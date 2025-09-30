// This event listener waits for the entire HTML document to be loaded and parsed
// before running the JavaScript code inside it.
document.addEventListener('DOMContentLoaded', () => {

    // --- Splash Screen and Stars ---
    const splash = document.querySelector('.splash');
    const starsContainer = document.querySelector('.stars-container');

    // -- Group 1: Slow-moving stars --
    // We will create the first batch of 150 stars that will move slowly.
    const numberOfSlowStars = 150;
    for (let i = 0; i < numberOfSlowStars; i++) {
        let star = document.createElement('div');
        // We give these stars a unique class 'star-slow' so we can animate them separately.
        star.classList.add('star', 'star-slow');
        let size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }

    // Animation for the SLOW stars using anime.js.
    // It targets only the elements with the '.star-slow' class.
    anime({
        targets: '.star-slow',
        // The translateX and translateY values are smaller, resulting in slower, shorter drifts.
        translateX: () => anime.random(-50, 50),
        translateY: () => anime.random(-50, 50),
        scale: [
            { value: 1, duration: 0 },
            { value: 1.2, duration: 1000 },
            { value: 1, duration: 1000 }
        ],
        loop: true,
        easing: 'linear',
        duration: 2000,
        delay: anime.stagger(10000)
    });

    // -- Group 2: Fast-moving stars --
    // Now, we create the second batch of 150 stars that will move more quickly.
    const numberOfFastStars = 150;
    for (let i = 0; i < numberOfFastStars; i++) {
        let star = document.createElement('div');
        // We give these stars a unique class 'star-fast' to target them for the faster animation.
        star.classList.add('star', 'star-fast');
        let size = Math.random() * 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }

    // Animation for the FAST stars using anime.js.
    // This animation specifically targets the '.star-fast' class.
    anime({
        targets: '.star-fast',
        // The translateX and translateY values are larger, resulting in faster, longer drifts across the screen.
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-150, 150),
        scale: [
            { value: 1, duration: 0 },
            { value: 1.2, duration: 1000 },
            { value: 1, duration: 1000 }
        ],
        loop: true,
        easing: 'linear',
        duration: 2000,
        delay: anime.stagger(5)
    });

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
                document.querySelector('.main-content').style.display = 'block';
                // Now that the content is visible, initialize the particle effects
                if (typeof window.startParticleEffects === 'function') {
                    window.startParticleEffects();
                }
            }
        });
    }, 5000);

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
                <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="Poster for ${anime.title}">
                <h3>${anime.title}</h3>
                
            `;

            // Add the new div to the results container
            resultsContainer.appendChild(animeDiv);
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
                    const container = document.getElementById('anime-of-the-day-container');
                    container.innerHTML = '<p class="error-text">Could not load Anime of the Day. Please try again later.</p>';
                });
        }
    }

    /**
     * Renders the anime cards for the "Anime of the Day" section.
     * @param {Array} animeList - An array of 3 anime objects.
     */
    function displayAnimeOfTheDay(animeList) {
        const container = document.getElementById('anime-of-the-day-container');
        container.innerHTML = ''; // Clear previous content

        if (!animeList || animeList.length === 0) return;

        animeList.forEach(anime => {
            const animeDiv = document.createElement('div');
            animeDiv.className = 'aotd-item'; // Use the new class for styling
            
            animeDiv.innerHTML = `
                <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="Poster for ${anime.title}">
                <h3>${anime.title}</h3>
            `;
            container.appendChild(animeDiv);
        });

        // --- Add hover/leave animations via JavaScript ---
        const aotdItems = document.querySelectorAll('.aotd-item');
        aotdItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.remove('is-leaving');
                item.classList.add('is-hovered');
            });

            item.addEventListener('mouseleave', () => {
                item.classList.remove('is-hovered');
                item.classList.add('is-leaving');
            });
        });

        // Add the rotating border animation to the newly created cards
        anime({
            targets: '.aotd-item',
            '--aotd-rotate': '360deg', // Animate the custom property from 0 to 360
            loop: true,
            duration: 4000,
            easing: 'linear',
            autoplay: true
        });
    }

    // Function to handle scroll reveal animation
    function reveal() {
        const reveals = document.querySelectorAll(".reveal");

        for (let i = 0; i < reveals.length; i++) {
            let windowHeight = window.innerHeight;
            let element = reveals[i];
            let revealTop = element.getBoundingClientRect().top;
            let revealBottom = element.getBoundingClientRect().bottom;
            // Trigger when the element is 150px from the bottom of the viewport
            // and also ensure it's not completely above the viewport
            let revealPoint = 150; 

            if (revealTop < windowHeight - revealPoint && revealBottom > 0 && !element.classList.contains('revealed')) {
                anime({
                    targets: element,
                    translateY: [50, 0], // Start 50px down, end at original position
                    opacity: [0, 1], // Fade in
                    duration: 1000,
                    easing: 'easeOutQuad'
                });
                element.classList.add("revealed"); // Mark as revealed
            } else if (revealBottom < revealPoint && element.classList.contains('revealed')) {
                anime.remove(element);
                element.classList.remove("revealed"); //re-add the reveal class
                element.classList.add("reveal");
            }
        }
    }
    // Event listener for scroll

    window.addEventListener("scroll", reveal);

    // Initial call to reveal to check elements that are already in view on page load
    reveal();

    // Load the Anime of the Day on page load
    loadAnimeOfTheDay();
});
