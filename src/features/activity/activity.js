document.addEventListener('DOMContentLoaded', function () {
    const mainPanelContent = document.getElementById('main-panel-content');
    const addLocationBtn = document.getElementById('add-location-btn');

    const predefinedLocations = [];
    const gridColumns = 3; // Number of columns in the grid
    const gridSpacing = 10; // Spacing between grid items

    // Setup event listeners for all draggable cards
    document.querySelectorAll('.draggable-card').forEach(card => {
        card.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('source', 'side-panel');
            event.dataTransfer.setData('text/plain', event.target.id);
        });
    });

    addLocationBtn.addEventListener('click', function () {
        const location = createPredefinedLocation();
        mainPanelContent.insertBefore(location, addLocationBtn);
        predefinedLocations.push(location);
        setupPredefinedLocation(location); // Setup event listeners for new location
        updateGrid();
    });

    function createPredefinedLocation() {
        const location = document.createElement('div');
        location.className = 'predefined-location';

        const removeSign = document.createElement('span');
        removeSign.textContent = 'remove';
        removeSign.className = 'material-symbols-outlined';
        removeSign.id = 'remove';
        location.appendChild(removeSign);

        location.addEventListener('click', function (event) {
            if (!location.hasBlock && canRemoveLocation(location)) {
                predefinedLocations.splice(predefinedLocations.indexOf(location), 1);
                location.remove();
                updateGrid();
            }
        });

        return location;
    }

    function setupPredefinedLocation(location) {
        location.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        location.addEventListener('drop', function (event) {
            event.preventDefault();
            const source = event.dataTransfer.getData('source');
            const id = event.dataTransfer.getData('text');
            let draggableElement = document.getElementById(id);

            // Find the original predefined location that contains the dragged element
            const originalLocation = Array.from(predefinedLocations).find(loc => {
                const elementRect = draggableElement.getBoundingClientRect();
                const locRect = loc.getBoundingClientRect();
                return (
                    elementRect.left >= locRect.left &&
                    elementRect.right <= locRect.right &&
                    elementRect.top >= locRect.top &&
                    elementRect.bottom <= locRect.bottom
                );
            });

            if (source === 'side-panel' || source === 'main-panel') {
                if (source === 'side-panel') {
                    draggableElement = draggableElement.cloneNode(true);
                    draggableElement.id = `clone-${Date.now()}`;
                    draggableElement.draggable = true;
                } else {
                    if (originalLocation) {
                        originalLocation.hasBlock = false;
                    }
                    draggableElement.remove();
                }

                // Prevent dragging when interacting with input or textarea
                draggableElement.querySelectorAll('input, textarea').forEach(element => {
                    element.addEventListener('mousedown', function (event) {
                        event.stopPropagation();
                    });
                });

                draggableElement.style.position = 'absolute';
                draggableElement.style.left = `${location.offsetLeft}px`;
                draggableElement.style.top = `${location.offsetTop}px`;

                const closeButton = document.createElement('span');
                closeButton.textContent = 'cancel';
                closeButton.className = 'material-symbols-outlined';
                closeButton.id = 'close-btn';
                closeButton.addEventListener('click', function () {
                    draggableElement.remove();
                    location.hasBlock = false; // Mark location as no longer having a block
                    updateGrid(); // Ensure grid updates correctly after block removal
                });
                draggableElement.appendChild(closeButton);

                mainPanelContent.appendChild(draggableElement);

                location.hasBlock = true; // Mark location as having a block

                draggableElement.addEventListener('dragstart', function (event) {
                    event.dataTransfer.setData('source', 'main-panel');
                    event.dataTransfer.setData('text/plain', event.target.id);
                });

                draggableElement.addEventListener('dragend', function (event) {
                    snapToNearestLocation(event.target);
                });
            }
        });
    }

    function canRemoveLocation(location) {
        const index = predefinedLocations.indexOf(location);
        // Check if any of the locations to the right have a block
        for (let i = index + 1; i < predefinedLocations.length; i++) {
            if (predefinedLocations[i].hasBlock) {
                return false;
            }
        }
        return true; // Only allow removal if no blocks to the right
    }

    function snapToNearestLocation(element) {
        const nearestLocation = getNearestPredefinedLocation(
            element.getBoundingClientRect().left + element.offsetWidth / 2,
            element.getBoundingClientRect().top + element.offsetHeight / 2
        );

        if (nearestLocation) {
            element.style.left = `${nearestLocation.offsetLeft}px`;
            element.style.top = `${nearestLocation.offsetTop}px`;

            // Mark nearest location as having a block
            nearestLocation.hasBlock = true;
        }
    }

    function getNearestPredefinedLocation(x, y) {
        let minDistance = Infinity;
        let nearestLocation = null;

        predefinedLocations.forEach(location => {
            const rect = location.getBoundingClientRect();
            const distance = Math.sqrt(Math.pow(rect.left + rect.width / 2 - x, 2) + Math.pow(rect.top + rect.height / 2 - y, 2));

            if (distance < minDistance) {
                minDistance = distance;
                nearestLocation = location;
            }
        });

        return nearestLocation;
    }

    function updateGrid() {
        // Clear all previous positioning
        predefinedLocations.forEach(location => {
            location.style.position = '';
            location.style.left = '';
            location.style.top = '';
        });

        // Calculate new grid layout
        predefinedLocations.forEach((location, index) => {
            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;

            location.style.position = 'absolute';
            location.style.left = `${col * (location.offsetWidth + gridSpacing)}px`;
            location.style.top = `${row * (location.offsetHeight + gridSpacing)}px`;
        });

        const row = Math.floor(predefinedLocations.length / gridColumns);
        const col = predefinedLocations.length % gridColumns;

        addLocationBtn.style.position = 'absolute';
        addLocationBtn.style.left = `${col * (addLocationBtn.offsetWidth + gridSpacing)}px`;
        addLocationBtn.style.top = `${row * (addLocationBtn.offsetHeight + gridSpacing)}px`;
    }

    updateGrid(); // Initial grid update
});
