document.addEventListener('DOMContentLoaded', function() {
    let playersData = {};

    // Fetch the initial player data from a local JSON file
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
            .filter(name => name.toLowerCase().includes(input.toLowerCase().replace(/\s+/g, '-')))
            .slice(0, 10); // Limit to the first 10 matches

        filteredNames.forEach(nameKey => {
            const div = document.createElement('div');
            div.textContent = nameKey.replace(/-/g, ' '); // Show the player name with spaces
            div.addEventListener('click', function() {
                playerNameInput.value = nameKey.replace(/-/g, ' '); // Set input value with spaces
                autocompleteList.innerHTML = ''; // Clear suggestions
            });
            autocompleteList.appendChild(div);
        });
    });

    document.getElementById('searchButton').addEventListener('click', async function() {
        const playerName = playerNameInput.value.trim().replace(/\s+/g, '-');
        const playerInfoDiv = document.getElementById('playerInfo');
        playerInfoDiv.innerHTML = ''; // Clear any existing info

        if (playerName) {
            try {

                // Fetch player stats using the API
                const playerStatsResponse = await fetch(`http://127.0.0.1:5000/api/${playerName}`).then(res => res.json());

                if (playerStatsResponse && playerStatsResponse.results) {
                    const stats = playerStatsResponse.results[0].slice(4); // Skip the first four entries, as they're not used
                    
                    // Display information and stats in the frontend
                    displayPlayerInfo(playerInfoDiv, playerName.replace(/-/g, ' '), stats);
                } else {
                    playerInfoDiv.textContent = 'Stats not found for this player.';
                }
            } catch (error) {
                console.error('Error fetching player stats:', error);
                playerInfoDiv.textContent = 'Failed to load player stats. Please try again.';
            }
        } else {
            playerInfoDiv.textContent = 'Please enter a player name.';
        }

        displayLinkText(playerName, playersData);


    });


});


function displayPlayerInfo(container, playerName, stats) {
    // Display player's name and link to matches if available
    const playerNameDisplay = document.createElement('h3');
    playerNameDisplay.textContent = playerName;
    container.appendChild(playerNameDisplay);


    const table = createStatsTable(stats);
    container.appendChild(table);

    // Append explanations after the table
    appendExplanations(container);
}





function appendExplanations(container) {

    const explanations = [
        { key: 'StP', desc: 'Probability of Starting the match.' },
        { key: 'Mins', desc: 'Minutes Played.' },
        { key: 'Gls', desc: 'Goals - the number of goals scored by the player.' },
        { key: 'Ast', desc: 'Assists - the number of assists made by the player.' },
        { key: 'PK', desc: 'Penalty Kicks Made - the number of penalty kicks made by the player.' },
        { key: 'PKatt', desc: 'Penalty Kicks Attempted - the number of penalty kicks attempted by the player.' },
        { key: 'Sh', desc: 'Shots - the total number of shots taken by the player.' },
        { key: 'SoT', desc: 'Shots on Target - the number of shots that went on goal.' },
        { key: 'CrdY', desc: 'Yellow Cards - the number of yellow cards received by the player.' },
        { key: 'CrdR', desc: 'Red Cards - the number of red cards received by the player.' },
        { key: 'Tkl', desc: 'Tackles - the number of times the player successfully took the ball from an opponent.' },
        { key: 'Int', desc: 'Interceptions - the number of times the player intercepted the ball from an opponent.' },
        { key: 'xG', desc: 'Expected Goals - a measure of the quality of chances created and conceded.' },
        { key: 'npXG', desc: 'Non-Penalty Expected Goals - expected goals excluding penalties.' },
        { key: 'xAG', desc: 'Expected Assisted Goals - a measure of the quality of assists or passes leading to shots.' },
        { key: 'SCA', desc: 'Shot Creating Actions - actions directly leading to a shot, such as passes, dribbles, and drawing fouls.' },
        { key: 'GCA', desc: 'Goal Creating Actions - actions directly leading to a goal, including the final two actions before a goal.' },
        { key: 'Cmp', desc: 'Passes Completed - the number of passes successfully made to another player.' },
        { key: 'PAtt', desc: 'Passes Attempted - the total number of attempted passes by the player.' },
        { key: 'Cmp%', desc: 'Pass Completion Percentage - the percentage of attempted passes that were successfully completed.' },
        { key: 'PrgP', desc: 'Progressive Passes - passes that move the ball significantly closer to the opponent\'s goal.' },
        { key: 'Carries', desc: 'Number of times the player controlled the ball with their feet.' },
        { key: 'PrgC', desc: 'Progressive Carries - carries that move the ball significantly closer to the opponent\'s goal.' },
        { key: 'TAtt', desc: 'Take on Attempts - number of attempts to take on defenders while dribbling.' },
        { key: 'Succ', desc: 'Successful Take Ons - number of defenders taken on successfully.' }
    ];
    

    explanations.forEach(exp => {
        const explanationParagraph = document.createElement('p');
        explanationParagraph.textContent = `${exp.key}: ${exp.desc}`;
        container.appendChild(explanationParagraph);
    });
}



function createStatsTable(stats) {
    const headers = [
        "StP", "Mins", "Gls", "Ast", "PK", "PKatt", "Sh", "SoT", "CrdY", "CrdR", "Touches", "Tkl", "Int", "Blocks", 
        "xG", "npxG", "xA", "SCA", "GCA", "Cmp", "PAtt", "Cmp%", "Prog", "Carries", "ProgC", 
        "TAtt", "Succ"
    ];

    const table = document.createElement('table');
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(headerText => {
        let headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    const tbody = table.createTBody();
    const dataRow = tbody.insertRow();

    stats.forEach(stat => {
        let cell = dataRow.insertCell();
        // Check if the stat is a number and format it
        cell.textContent = typeof stat === 'number' ? stat.toFixed(2) : stat;
    });

    return table;
}


function displayLinkText(playerNameKey, playersData) {
    const linkContainer = document.getElementById('playerLinkContainer');
    linkContainer.innerHTML = ''; // Clear previous content

    const playerLink = playersData[playerNameKey];
    if (playerLink) {
        // Use innerHTML to include HTML tags within the text
        linkContainer.innerHTML = `Here is the link to the last five matches: <span style="text-decoration: underline;">${playerLink}</span>`;
    } else {
        linkContainer.textContent = 'Link not found.';
    }
}
