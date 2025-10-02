document.addEventListener('DOMContentLoaded', () => {
    // --- My List Functionality (using localStorage) ---

    // Define different list size limits for desktop and mobile.
    const MAX_LIST_SIZE_DESKTOP = 20;
    const MAX_LIST_SIZE_MOBILE = 10;

    /**
     * Retrieves the user's list from localStorage.
     * @returns {Array} An array of anime objects.
     */
    function getMyList() {
        return JSON.parse(localStorage.getItem('myAnimeList')) || [];
    }

    /**
     * Saves the user's list to localStorage.
     * @param {Array} list - The array of anime objects to save.
     */
    function saveMyList(list) {
        localStorage.setItem('myAnimeList', JSON.stringify(list));
    }

    /**
     * Checks if an anime is already in the list.
     * @param {number} animeId - The MAL ID of the anime.
     * @returns {boolean} True if the anime is in the list.
     */
    function isAnimeInList(animeId) {
        const myList = getMyList();
        return myList.some(item => item.mal_id === animeId);
    }

    /**
     * Adds or removes an anime from the list.
     * @param {object} animeData - The full anime object from the API.
     */
    function toggleAnimeInList(animeData) {
        let myList = getMyList();
        if (isAnimeInList(animeData.mal_id)) {
            // Remove it
            myList = myList.filter(item => item.mal_id !== animeData.mal_id);
            saveMyList(myList);
        } else {
            // Determine the correct list size limit based on viewport width.
            const isMobile = window.innerWidth <= 900; // Use 900px to be consistent with other mobile styles
            const currentMaxListSize = isMobile ? MAX_LIST_SIZE_MOBILE : MAX_LIST_SIZE_DESKTOP;
            const alertMessage = `Your list is full! You can save a maximum of ${currentMaxListSize} anime.`;

            // Check if the list is full before adding a new item.
            if (myList.length >= currentMaxListSize) {
                alert(alertMessage);
                return; // Stop the function to prevent adding the item.
            }
            // If not full, add it.
            myList.push(animeData);
            saveMyList(myList);
        }
    }

    /**
     * Renders the anime cards for the "My List" section.
     */
    function displayMyList() {
        const myListContainer = document.getElementById('my-list-container');
        const myList = getMyList();

        // Determine which list to display based on viewport width
        const isMobile = window.innerWidth <= 900;
        const listToDisplay = isMobile ? myList.slice(0, MAX_LIST_SIZE_MOBILE) : myList;

        const CROWDED_THRESHOLD = 10; // The number of items before cards shrink

        // Add or remove a class based on the number of items in the list
        if (listToDisplay.length > CROWDED_THRESHOLD) {
            myListContainer.classList.add('is-crowded');
        } else {
            myListContainer.classList.remove('is-crowded');
        }

        myListContainer.innerHTML = ''; // Clear previous content

        if (listToDisplay.length === 0) {
            myListContainer.innerHTML = '<p class="empty-list-message" style="font-size: 2rem;">Your list is empty. Add anime from search or "Anime of the Day"!</p>';
            return;
        }

        // Iterate over the potentially truncated list
        listToDisplay.forEach(anime => {
            const animeDiv = document.createElement('div');
            animeDiv.className = 'anime-result-item'; // Reuse existing class

            animeDiv.innerHTML = `
                <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="Poster for ${anime.title}">
                <h3>${anime.title}</h3>
                <button class="remove-from-list-btn" data-anime-id="${anime.mal_id}">Remove</button>
            `;
            myListContainer.appendChild(animeDiv);
        });

        // Add event listeners to the "Remove" buttons
        myListContainer.querySelectorAll('.remove-from-list-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const animeId = parseInt(e.target.dataset.animeId);
                toggleAnimeInList({ mal_id: animeId }); // We only need the ID to remove
                displayMyList(); // Refresh the list view
            });
        });
    }

    // Expose functions to the global scope so scanime.js can use them
    window.myListApp = { isAnimeInList, toggleAnimeInList, displayMyList };
});