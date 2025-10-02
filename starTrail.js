document.addEventListener('DOMContentLoaded', () => {
    // --- Star Trail Effect ---
    const starTrailToggleBtn = document.getElementById('starTrailToggleBtn');
    const starContainer = document.getElementById('star-container');
    const cursorDot = document.getElementById('cursor-dot');

    // Fade in the button after the splash screen is gone
    setTimeout(() => {
        anime({
            targets: starTrailToggleBtn,
            opacity: 1,
            duration: 800,
            easing: 'easeOutQuad',
            begin: () => starTrailToggleBtn.style.pointerEvents = 'auto'
        });
    }, 5000); // Match the splash screen timeout

    // --- Star Trail Mouse Pointer Functionality ---
    let currentStarTrailMode = 'off'; // 'off', 'pinkBlue', 'yellowBeam'
    let starTrailMouseMoveHandler = null; // To store the event listener function

    // --- Time-based variables for a gapped trail ---
    let lastEventTime = 0;
    const gappedTrailInterval = 25; // Interval in ms for the gapped trail. Higher = more gaps.

    // --- Interpolation variables for a gapless trail ---
    let lastMouseX = 0;
    let lastMouseY = 0;
    const starDensity = 3; // Create a star every 3 pixels of movement for high density.

    // Define different color schemes for the star trail
    const COLOR_SCHEMES = {
        pinkBlue: ['#FF69B4', '#4169E1'], // Hot Pink, Royal Blue
        yellowBeam: ['#FFFF00', '#FFD700', '#FFA500'] // Yellow, Gold, Orange for a warm beam
    };
    let activeColors = []; // Will hold the colors for the currently active mode

    // Define the order of modes for the button to cycle through
    const STAR_TRAIL_MODES_CYCLE = ['off', 'pinkBlue', 'yellowBeam'];

    /**
     * Creates a single star element at the given coordinates.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {HTMLElement} The created star element.
     */
    function createStar(x, y) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Assign random color dynamically from the activeColors
        const color = activeColors[anime.random(0, activeColors.length - 1)];
        star.style.backgroundColor = color;
        star.style.color = color; // Used for the box-shadow's currentColor

        // Position the star so its center is under the cursor
        star.style.left = `${x - 3}px`; // Adjusted for 6px width
        star.style.top = `${y - 3}px`; // Adjusted for 6px height

        starContainer.appendChild(star);
        return star;
    }

    /**
     * Animates a star to appear, move slightly, and disappear.
     * @param {HTMLElement} star - The star element to animate.
     */
    function animateStar(star) {
        // Longer duration for a longer, smoother tail effect
        const duration = anime.random(1000, 2000);

        anime({
            targets: star,
            // Appearance and movement
            // We remove translateX and translateY to keep the trail perfectly smooth
            scale: [
                { value: 1, duration: 100, easing: 'easeOutQuad' }, // Quick pop to full size
                { value: 0, delay: duration * 0.5, duration: duration * 0.5 } // Slow shrink over the second half
            ],
            opacity: [
                { value: 0.8, duration: 100 }, // Quick fade in
                { value: 0, delay: duration * 0.5, duration: duration * 0.5 } // Slow fade out
            ],
            duration: duration,
            easing: 'linear',
            // Cleanup
            complete: function (anim) {
                star.remove();
            }
        });
    }

    // Helper function to clean up any active star trail effect
    function _cleanupStarTrail() {
        if (starTrailMouseMoveHandler) {
            document.removeEventListener('mousemove', starTrailMouseMoveHandler);
            starTrailMouseMoveHandler = null;
        }
        // Reset interpolation variables
        lastMouseX = 0;
        lastMouseY = 0;
        // Reset time-based variables
        lastEventTime = 0;

        document.body.classList.remove('star-trail-active'); // Show default cursor
        cursorDot.style.display = 'none'; // Hide the custom cursor dot
        starContainer.innerHTML = ''; // Clear all existing stars
    }

    // Helper function to activate a specific star trail mode
    function _activateStarTrail(mode) {
        if (mode === 'off') {
            _cleanupStarTrail(); // Ensure everything is turned off
            return;
        }

        // Set the colors based on the chosen mode
        activeColors = COLOR_SCHEMES[mode];

        // Choose the correct handler based on the mode
        if (mode === 'pinkBlue') {
            // --- GAPPED TRAIL LOGIC (Time-based) ---
            starTrailMouseMoveHandler = (event) => {
                cursorDot.style.left = `${event.clientX}px`;
                cursorDot.style.top = `${event.clientY}px`;

                const currentTime = Date.now();
                if (currentTime - lastEventTime > gappedTrailInterval) {
                    animateStar(createStar(event.clientX, event.clientY)); // Call animateStar here
                    lastEventTime = currentTime;
                }
            };
        } else if (mode === 'yellowBeam') {
            // --- DENSE TRAIL LOGIC (Interpolation) ---
            starTrailMouseMoveHandler = (event) => {
                const currentMouseX = event.clientX;
                const currentMouseY = event.clientY;

                cursorDot.style.left = `${currentMouseX}px`;
                cursorDot.style.top = `${currentMouseY}px`;

                if (lastMouseX === 0 && lastMouseY === 0) {
                    lastMouseX = currentMouseX;
                    lastMouseY = currentMouseY;
                    return;
                }

                const dx = currentMouseX - lastMouseX;
                const dy = currentMouseY - lastMouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                if (distance > 0) {
                    const numStarsToCreate = Math.ceil(distance / starDensity);
                    for (let i = 1; i <= numStarsToCreate; i++) {
                        const progress = i / numStarsToCreate;
                        const x = lastMouseX + Math.cos(angle) * (distance * progress);
                        const y = lastMouseY + Math.sin(angle) * (distance * progress);
                        animateStar(createStar(x, y)); // Call animateStar here
                    }
                }

                lastMouseX = currentMouseX;
                lastMouseY = currentMouseY;
            };
        }

        document.addEventListener('mousemove', starTrailMouseMoveHandler);
        document.body.classList.add('star-trail-active'); // Hide default cursor
        cursorDot.style.display = 'block'; // Show the custom cursor dot
    }

    starTrailToggleBtn.addEventListener('click', () => {
        // Prevent activation on mobile/tablet devices
        if (window.innerWidth <= 900) {
            _cleanupStarTrail(); // Ensure it's off
            return;
        }

        const currentIndex = STAR_TRAIL_MODES_CYCLE.indexOf(currentStarTrailMode);
        const nextIndex = (currentIndex + 1) % STAR_TRAIL_MODES_CYCLE.length;
        currentStarTrailMode = STAR_TRAIL_MODES_CYCLE[nextIndex];

        // First, clean up any existing effect.
        _cleanupStarTrail();
        // Then, activate the new one (if it's not 'off').
        _activateStarTrail(currentStarTrailMode);

        // Update button text based on the new mode
        switch (currentStarTrailMode) {
            case 'off':
                starTrailToggleBtn.textContent = 'Star Trail (Off)';
                break;
            case 'pinkBlue':
                starTrailToggleBtn.textContent = 'Trail: Default';
                break;
            case 'yellowBeam':
                starTrailToggleBtn.textContent = 'Trail: Golden Beam';
                break;
        }
    });

    // Add a resize listener to disable the effect if the window becomes too small
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 900 && currentStarTrailMode !== 'off') {
            _cleanupStarTrail();
            currentStarTrailMode = 'off';
            starTrailToggleBtn.textContent = 'Star Trail (Off)';
        }
    });
});