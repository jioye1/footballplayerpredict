document.addEventListener('DOMContentLoaded', function() {
    let playersData = {};

    fetch('playersData.json')
        .then(response => response.json())
        .then(data => playersData = data)
        .catch(error => console.error('Error loading player data:', error));

    const playerNameInput = document.getElementById('playerName');
    const autocompleteList = document.getElementById('autocompleteList');

    playerNameInput.addEventListener('input', function() {
        const input = this.value;
        autocompleteList.innerHTML = ''; // Clear existing suggestions
        if (!input) return;

        const filteredNames = Object.keys(playersData)
            .filter(name => name.toLowerCase().includes(input.toLowerCase()))
            .slice(0, 10); // Limit to the first 10 matches

        filteredNames.forEach(name => {
            const div = document.createElement('div');
            div.textContent = name;
            div.addEventListener('click', function() {
                playerNameInput.value = name; // Fill input with selected name
                autocompleteList.innerHTML = ''; // Clear suggestions
            });
            autocompleteList.appendChild(div);
        });
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        const playerName = playerNameInput.value.trim();
        const playerInfoDiv = document.getElementById('playerInfo');
        if (playerName && playersData[playerName]) {
            playerInfoDiv.textContent = `${playerName} is from ${playersData[playerName]}.`;
        } else {
            playerInfoDiv.textContent = 'Player not found. Please check the name and try again.';
        }
    });
});
