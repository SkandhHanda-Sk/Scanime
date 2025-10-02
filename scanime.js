// This event listener waits for the entire HTML document to be loaded and parsed
// before running the JavaScript code inside it.
document.addEventListener('DOMContentLoaded', () => {

    // --- Splash Screen and Stars ---
    const splash = document.querySelector('.splash');
    const starsContainer = document.querySelector('.stars-container');

    // --- Canvas Starfield ---
    // This is much more performant than animating 300 individual DOM elements.
    const canvas = document.createElement('canvas');
    starsContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let stars = [];
    const numStars = 300;
    let starfieldAnimationId = null; // To hold the animation frame ID

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = []; // Reset stars on resize
        for (let i = 0; i < numStars; i++) {
            // First half of stars are slow
            if (i < numStars / 2) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1 + 1, // Slightly larger
                    vx: (Math.random() - 0.5) * 0.3, // Slower velocity
                    vy: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.3
                });
            } else { // Second half are fast
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 0.8 + 0.2, // Slightly smaller
                    vx: (Math.random() - 0.5) * 0.8, // Faster velocity
                    vy: (Math.random() - 0.5) * 0.8,
                    opacity: Math.random() * 0.6 + 0.4
                });
            }
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#d5d9df';

        stars.forEach(star => {
            // Twinkle effect by changing opacity
            star.opacity += (Math.random() - 0.5) * 0.1;
            if (star.opacity > 1) star.opacity = 1;
            if (star.opacity < 0) star.opacity = 0;

            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Move star
            star.x += star.vx;
            star.y += star.vy;

            // Boundary check to wrap stars around
            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;
        });

        starfieldAnimationId = requestAnimationFrame(animateStars);
    }

    resizeCanvas();
    animateStars();
    window.addEventListener('resize', resizeCanvas);

    // This creates an animation "timeline" for the splash screen logo.
    const logoAnimation = anime.timeline({
        loop: false,
        easing: 'easeInOutExpo'
    });

    logoAnimation.add({
        targets: '.splash-image',
        translateX: ['-310vw%', '-50%'],
        translateY: '-50%',
        scale: [0, 1],
        opacity: [0, 1],
        duration: 1500
    })
    .add({
        targets: '.splash-image',
        duration: 3000
    })
    .add({
        targets: '.loading-text',
        opacity: 1,
        duration: 400,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
    }, '-=2000')
    .add({
        targets: '.splash-image',
        translateX: ['-50%', '210%'],
        translateY: '-50%',
        scale: [1, 0],
        opacity: [1, 0],
        duration: 1500,
        easing: 'easeOutExpo'
    });

    // This function waits for 5 seconds then fades out the splash screen.
    setTimeout(() => {
        anime({
            targets: '.splash',
            opacity: 0,
            duration: 1000,
            easing: 'easeInOutExpo',
            complete: () => {
                splash.style.display = 'none';
                // Stop the starfield animation completely
                if (starfieldAnimationId) cancelAnimationFrame(starfieldAnimationId);
            }
        });
    }, 5000);

    // --- Pre-load content and initialize animations behind the splash screen ---
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('header');

    // Fade in header, main content, and star trail button after the splash screen is gone
    setTimeout(() => {
        anime({
            targets: [header, mainContent],
            opacity: 1,
            duration: 800,
            easing: 'easeOutQuad',
            delay: anime.stagger(100) // Stagger the fade-in slightly
        });
    }, 5000); // Match the splash screen timeout

    // --- Carousel ---
    const carousel = document.getElementById('carousel');
    if (carousel) {
        // To create a seamless, infinite scrolling effect, we duplicate the carousel items.
        const originalCards = Array.from(carousel.children);
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            carousel.appendChild(clone);
        });
    }

    // --- Header Navigation ---
    /**
     * Attaches a smooth scroll event listener to a header button.
     * @param {string} buttonClass - The class of the button to select.
     * @param {string} sectionId - The ID of the section to scroll to.
     */
    function setupSmoothScroll(buttonClass, sectionId) {
        const button = document.querySelector(buttonClass);
        const section = document.getElementById(sectionId);

        if (button && section) {
            button.addEventListener('click', () => {
                // Calculate position, accounting for the sticky header's height
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
        }
    }

    setupSmoothScroll('.home.header-Btn', 'home-section');
    setupSmoothScroll('.trending.header-Btn', 'trending-section');
    setupSmoothScroll('.about.header-Btn', 'about-section');
    setupSmoothScroll('.myList.header-Btn', 'my-list-section');
    setupSmoothScroll('.genre.header-Btn', 'genre-section');
    setupGenreCarousel(); // Initialize the genre carousel logic

    // --- Hamburger Menu Functionality ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const headerNav = document.querySelector('.header-nav');
    const navLinks = document.querySelectorAll('.header-Btn');

    hamburgerMenu.addEventListener('click', () => {
        headerNav.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
    });

    // Close the menu when a link is clicked (useful for single-page apps)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (headerNav.classList.contains('active')) {
                headerNav.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    });

    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const clearBtn = document.getElementById('clearBtn');

// Listen for a click on the clear button
    clearBtn.addEventListener('click',  () => {
        searchInput.value = ''; // Clear the input field
        clearBtn.style.display = 'none'; // Hide the clear button
        resultsContainer.innerHTML = ''; // Clear the displayed results
    });


    searchForm.addEventListener('submit', (event) => {
        // This is the most important step for same-page results!
        event.preventDefault(); 

        const searchTerm = searchInput.value.trim();

        if (searchTerm) {
            // Optional: Let the user know something is happening
            resultsContainer.innerHTML = '<p class="loading-text">Searching for anime...</p>';

            // Fetch data from the API
            fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=8`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Pass the results to the display function
                    displayResults(data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    resultsContainer.innerHTML = '<p class="error-text">Sorry, an error occurred. Please try again.</p>';
                });
        } else {
            resultsContainer.innerHTML = ''; // Clear results if search is empty
        }
    });

    function displayResults(animeList) {
        // Clear the "Loading..." message or any previous results
        resultsContainer.innerHTML = '';
        clearBtn.style.display = 'block';

        if (!animeList || animeList.length === 0) {
            resultsContainer.innerHTML = '<p>No results found for your search.</p>';
            return;
        }

        // Loop through the results and create HTML for each one
        animeList.forEach(anime => {
            const animeDiv = document.createElement('div');
            animeDiv.className = 'anime-result-item'; // Add a class for styling
            
            // Populate the div with anime info
            animeDiv.innerHTML = `
                <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="Poster for ${anime.title}" style="pointer-events: none;">
                <h3>${anime.title}</h3>
                <button class="add-to-list-btn" data-anime-id="${anime.mal_id}">
                    ${window.myListApp.isAnimeInList(anime.mal_id) ? 'In List' : 'Add to List'}
                </button>
                
            `;

            // Add the new div to the results container
            resultsContainer.appendChild(animeDiv);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('#results .add-to-list-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const animeId = parseInt(e.target.dataset.animeId);
                const animeData = animeList.find(a => a.mal_id === animeId);
                window.myListApp.toggleAnimeInList(animeData);
                
                // Instead of re-rendering the whole list, just update the button itself.
                e.target.textContent = 'In List';
                e.target.disabled = true; // Prevents multiple clicks

                window.myListApp.displayMyList();
            });
        });

         anime({
            targets: '.anime-result-item',opacity: [0, 1],duration: 1000,delay: anime.stagger(200)
        });
    }

    // --- Anime of the Day ---

    /**
     * Fetches and displays the Anime of the Day.
     * Uses localStorage to ensure the anime selection only changes once per day.
     */
    function loadAnimeOfTheDay() {
        const aotdContainer = document.getElementById('anime-of-the-day-container');
        const today = new Date().toISOString().split('T')[0]; // Get date as 'YYYY-MM-DD'
        const storedDate = localStorage.getItem('aotd_date');
        const storedData = localStorage.getItem('aotd_data');

        if (storedDate === today && storedData) {
            // If we have data for today, use it
            displayAnimeOfTheDay(JSON.parse(storedData));
        } else {
            // Otherwise, fetch new data
            fetch('https://api.jikan.moe/v4/top/anime?limit=25')
                .then(response => response.json())
                .then(data => {
                    // --- Filtering for appropriate content ---
                    // Define genres and ratings to exclude.
                    const forbiddenGenres = new Set(['Hentai', 'Ecchi']);
                    const forbiddenRatings = new Set(['Rx - Hentai', 'R+ - Mild Nudity']);

                    // Filter the initial list to remove any anime that matches our criteria.
                    const filteredAnime = data.data.filter(anime => {
                        // Check if the anime's rating is in our forbidden set.
                        if (forbiddenRatings.has(anime.rating)) {
                            return false; // Exclude this anime.
                        }
                        // Check if any of the anime's genres are in our forbidden set.
                        const hasForbiddenGenre = anime.genres.some(genre => forbiddenGenres.has(genre.name));
                        return !hasForbiddenGenre; // Exclude if it has a forbidden genre.
                    });

                    // Get 3 unique random anime from the top list
                    const selectedAnime = [];
                    const usedIndexes = new Set();
                    while (selectedAnime.length < 3 && selectedAnime.length < filteredAnime.length) {
                        const randomIndex = Math.floor(Math.random() * filteredAnime.length);
                        if (!usedIndexes.has(randomIndex)) {
                            selectedAnime.push(filteredAnime[randomIndex]);
                            usedIndexes.add(randomIndex);
                        }
                    }

                    // Store the new data and date in localStorage
                    localStorage.setItem('aotd_data', JSON.stringify(selectedAnime));
                    localStorage.setItem('aotd_date', today);

                    // Display the newly fetched anime
                    displayAnimeOfTheDay(selectedAnime);
                })
                .catch(error => {
                    console.error('Error fetching Anime of the Day:', error);
                    aotdContainer.innerHTML = '<p class="error-text">Could not load Anime of the Day. Please try again later.</p>';
                });
        }
    }

    /**
     * Renders the anime cards for the "Anime of the Day" section.
     * @param {Array} animeList - An array of 3 anime objects.
     */
    function displayAnimeOfTheDay(animeList) {
        if (!animeList) return; // Guard against empty list
        let aotdBorderAnimation; // To hold the animation instance
        const container = document.getElementById('anime-of-the-day-container');
        container.innerHTML = ''; // Clear previous content

        let currentAotdIndex = 0;
        const isMobileView = window.innerWidth <= 480;

        if (!animeList || animeList.length === 0) return;

        animeList.forEach(anime => {
            const animeDiv = document.createElement('div');
            animeDiv.className = 'aotd-item'; // Use the new class for styling
            
            animeDiv.innerHTML = `
                <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="Poster for ${anime.title}" style="pointer-events: none;">
                <h3>${anime.title}</h3>
                <button class="add-to-list-btn" data-anime-id="${anime.mal_id}" style="margin-top: 10px; z-index: 5; position: relative;">
                     ${window.myListApp.isAnimeInList(anime.mal_id) ? 'In List' : 'Add to List'}
                </button>
            `;
            container.appendChild(animeDiv);
        });

        const aotdItems = document.querySelectorAll('.aotd-item');

        // --- Mobile Carousel Logic ---
        if (isMobileView && aotdItems.length > 0) {
            const prevBtn = document.getElementById('aotd-prev-btn');
            const nextBtn = document.getElementById('aotd-next-btn');
            const aotdContainer = document.getElementById('anime-of-the-day-container');
            let touchStartX = 0;
            let touchEndX = 0;

            // Show the first card initially
            aotdItems[0].style.display = 'block';

            const slideCard = (direction) => {
                const oldIndex = currentAotdIndex;
                let newIndex;

                if (direction === 'next') {
                    newIndex = (oldIndex + 1) % aotdItems.length;
                } else {
                    newIndex = (oldIndex - 1 + aotdItems.length) % aotdItems.length;
                }

                const oldCard = aotdItems[oldIndex];
                const newCard = aotdItems[newIndex];

                // Prepare new card for animation
                newCard.style.display = 'block';
                // Clear any previous animation classes
                oldCard.className = 'aotd-item';
                newCard.className = 'aotd-item';

                if (direction === 'next') {
                    oldCard.classList.add('slide-out-left');
                    newCard.classList.add('slide-in-right');
                } else {
                    oldCard.classList.add('slide-out-right');
                    newCard.classList.add('slide-in-left');
                }

                // After animation, hide the old card
                setTimeout(() => {
                    oldCard.style.display = 'none';
                }, 400); // Match animation duration

                currentAotdIndex = newIndex;
            };

            nextBtn.addEventListener('click', () => {
                slideCard('next');
            });

            prevBtn.addEventListener('click', () => {
                slideCard('prev');
            });

            // --- Swipe Listeners ---
            aotdContainer.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            aotdContainer.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });

            function handleSwipe() {
                const swipeThreshold = 50; // Minimum distance for a swipe
                // Swiped left (next)
                if (touchStartX - touchEndX > swipeThreshold) {
                    slideCard('next');
                }
                // Swiped right (previous)
                else if (touchEndX - touchStartX > swipeThreshold) {
                    slideCard('prev');
                }
            }
        } else {
            // --- Desktop Hover/Leave Animation Logic ---
            aotdItems.forEach(item => {
                let hoverTimeout; // Variable to hold our timeout

                item.addEventListener('mouseenter', () => {
                    hoverTimeout = setTimeout(() => {
                        item.classList.remove('is-leaving');
                        item.classList.add('is-hovered');
                    }, 500);
                });

                item.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimeout);
                    if (item.classList.contains('is-hovered')) {
                        item.classList.remove('is-hovered');
                        item.classList.add('is-leaving');
                    }
                });
            });
        }

        // Add event listeners for the 'Add to List' buttons regardless of view
        aotdItems.forEach(item => {
            const button = item.querySelector('.add-to-list-btn');
            button.addEventListener('click', (e) => {
                if (!isMobileView) e.stopPropagation(); // Stop propagation only on desktop
                const animeId = parseInt(e.target.dataset.animeId);
                const animeData = animeList.find(a => a.mal_id === animeId);
                window.myListApp.toggleAnimeInList(animeData);
                button.textContent = 'In List';
                window.myListApp.displayMyList();
            });
        });

        // Add the rotating border animation to the newly created cards
        aotdBorderAnimation = anime({
            targets: '.aotd-item',
            '--aotd-rotate': '360deg', // Animate the custom property from 0 to 360
            loop: true,
            duration: 4000,
            easing: 'linear',
            autoplay: false // We will control this with the Intersection Observer
        });

        container.aotdAnimation = aotdBorderAnimation; // Attach animation to the element for the observer
    }

    // --- Responsive Reload for AOTD ---
    let lastViewportWidth = window.innerWidth;
    const AOTD_BREAKPOINT = 400;

    window.addEventListener('resize', () => {
        const currentViewportWidth = window.innerWidth;
        const crossedBreakpoint = 
            (lastViewportWidth <= AOTD_BREAKPOINT && currentViewportWidth > AOTD_BREAKPOINT) ||
            (lastViewportWidth > AOTD_BREAKPOINT && currentViewportWidth <= AOTD_BREAKPOINT);

        if (crossedBreakpoint) {
            // The 'Anime of the Day' data is cached in localStorage, so this is a lightweight operation.
            // It re-runs the logic to switch between slider and grid mode correctly.
            loadAnimeOfTheDay();
        }

        lastViewportWidth = currentViewportWidth;
    });

    /**
     * Sets up the mobile carousel functionality for the Genre section.
     * This includes button clicks and swipe gestures.
     */
    function setupGenreCarousel() {
        const isMobileView = window.innerWidth <= 480;
        if (!isMobileView) return; // Only run this logic on mobile

        const genreContainer = document.querySelector('#genre-section .genre-container');
        const genreCards = document.querySelectorAll('#genre-section .genre-card-wrapper');
        const prevBtn = document.getElementById('genre-prev-btn');
        const nextBtn = document.getElementById('genre-next-btn');

        if (genreCards.length === 0) return;

        let currentGenreIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Show the first card initially by making it visible and centered
        if (genreCards.length > 0) {
            genreCards[currentGenreIndex].style.opacity = '1';
            genreCards[currentGenreIndex].style.transform = 'translateX(0)';
            genreCards[currentGenreIndex].classList.add('is-active-genre');
        }

        function showGenreCard(index) {
            if (index === currentGenreIndex) return;

            const oldCard = genreCards[currentGenreIndex];
            const newCard = genreCards[index];

            // Hide the old card by sliding it out
            oldCard.style.opacity = '0';
            oldCard.classList.remove('is-active-genre');
            oldCard.style.transform = index > currentGenreIndex ? 'translateX(-100%)' : 'translateX(100%)';

            // Show the new card by sliding it in
            newCard.style.opacity = '1';
            newCard.classList.add('is-active-genre');
            newCard.style.transform = 'translateX(0)';

            currentGenreIndex = index;
        }

        function nextGenre() {
            const nextIndex = (currentGenreIndex + 1) % genreCards.length;
            showGenreCard(nextIndex);
        }

        function prevGenre() {
            const prevIndex = (currentGenreIndex - 1 + genreCards.length) % genreCards.length;
            showGenreCard(prevIndex);
        }

        // --- Event Listeners ---
        nextBtn.addEventListener('click', nextGenre);
        prevBtn.addEventListener('click', prevGenre);

        // --- Swipe Listeners ---
        genreContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        genreContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for a swipe
            // Swiped left
            if (touchStartX - touchEndX > swipeThreshold) {
                nextGenre();
            }
            // Swiped right
            else if (touchEndX - touchStartX > swipeThreshold) {
                prevGenre();
            }
        }
    }


    // Function to handle scroll reveal animation
    function reveal() {
        const reveals = document.querySelectorAll(".reveal");

        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const element = reveals[i];
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150; // How far from the bottom to trigger the reveal

            // If the top of the element is within the viewport, make it visible
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add("is-visible");
            } 
            // Otherwise, if it's outside the viewport (either above or below), hide it again
            else {
                element.classList.remove("is-visible");
            }
        }
    }
    // Event listener for scroll

    window.addEventListener("scroll", reveal, { passive: true });
    // Run reveal once on load to show any sections already in view
    reveal();

    // Load the Anime of the Day on page load
    loadAnimeOfTheDay();

    // Also load "My List" on page load
    window.myListApp.displayMyList();

    // --- Animation Performance Observer ---
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const targetId = entry.target.id;

            if (targetId === 'trending-section') {
                const carousel = document.getElementById('carousel');
                if (entry.isIntersecting) {
                    carousel.classList.remove('is-paused');
                } else {
                    carousel.classList.add('is-paused');
                }
            }

            if (targetId === 'home-section') {
                const aotdContainer = document.getElementById('anime-of-the-day-container');
                if (aotdContainer.aotdAnimation) {
                    if (entry.isIntersecting) {
                        aotdContainer.aotdAnimation.play();
                    } else {
                        aotdContainer.aotdAnimation.pause();
                    }
                }
            }

            if (targetId === 'about-section') {
                if (typeof window.particleEffectsController === 'object') {
                    if (entry.isIntersecting) {
                        window.particleEffectsController.resumeAll();
                    } else {
                        window.particleEffectsController.pauseAll();
                    }
                }
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    ['trending-section', 'home-section', 'about-section'].forEach(id => animationObserver.observe(document.getElementById(id)));

    // Initialize the particle effects for the 'About' section.
    // The IntersectionObserver will handle starting/pausing them.
    if (typeof window.startParticleEffects === 'function') {
        window.startParticleEffects();
    }
});
