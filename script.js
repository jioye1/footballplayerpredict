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

    document.getElementById('searchButton').addEventListener('click', function() {
        const playerName = playerNameInput.value.trim();
        const playerInfoDiv = document.getElementById('playerInfo');
        playerInfoDiv.innerHTML = ''; // Clear any existing info

        const playerNameKey = playerName.replace(/\s+/g, '-'); // Convert space to hyphen to match JSON keys
        if (playerName && playersData[playerNameKey]) {
            // Display the link to the player's matches
            const linkPara = document.createElement('p');
            linkPara.innerHTML = `Link to the last five matches: <a href="${playersData[playerNameKey]}" target="_blank">Click here</a>`;
            playerInfoDiv.insertBefore(linkPara, playerInfoDiv.firstChild); // Insert link at the top of playerInfoDiv

            

            const describe = document.createElement('p');
            describe.innerHTML = '<strong>Below is the predicted stats of this player for the next match: </strong>';
            playerInfoDiv.appendChild(describe);


            const table = document.createElement('table');
            const headers = [
                "Gls", "Ast", "PK", "PKatt", "Sh", "SoT", "CrdY", "CrdR", "Touches", "Tkl", "Int", "Blocks", 
                "xG", "npxG", "xA", "SCA", "GCA", "Cmp", "Att", "Cmp%", "Prog", "Carries", "ProgC", 
                "TakeOns", "Att", "Succ"
            ];
    
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach(headerText => {
                let headerCell = document.createElement("th");
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });
    
            // Create tbody element
            const tbody = table.createTBody();
            const dataRow = tbody.insertRow();
    
            // Placeholder values for demonstration purposes
            const playerStats = new Array(headers.length).fill("0");
            
            // Update placeholder values with real data in the future
            playerStats.forEach(stat => {
                let cell = dataRow.insertCell();
                cell.textContent = stat; // Set text content to placeholder value
            });
    
            playerInfoDiv.appendChild(table);
            const explanationPara = document.createElement('p');
            explanationPara.textContent = 'Gls: Goals - the number of goals scored by the player.';
            playerInfoDiv.appendChild(explanationPara);

            const explanationAst = document.createElement('p');
            explanationAst.textContent = 'Ast: Assists - the number of assists made by the player.';
            playerInfoDiv.appendChild(explanationAst);

            const explanationPk = document.createElement('p');
            explanationPk.textContent = 'PK: Penalty Kicks Made - the number of penalty kicks made by the player.';
            playerInfoDiv.appendChild(explanationPk);

            const explanationPkatt = document.createElement('p');
            explanationPkatt.textContent = 'PKatt: Penalty Kicks Attempted - the number of penalty kicks attempted by the player.';
            playerInfoDiv.appendChild(explanationPkatt);

            const explanationSh = document.createElement('p');
            explanationSh.textContent = 'Sh: Shots - the total number of shots taken by the player.';
            playerInfoDiv.appendChild(explanationSh);

            const explanationSoT = document.createElement('p');
            explanationSoT.textContent = 'SoT: Shots on Target - the number of shots that went on goal.';
            playerInfoDiv.appendChild(explanationSoT);

            const explanationCrdY = document.createElement('p');
            explanationCrdY.textContent = 'CrdY: Yellow Cards - the number of yellow cards received by the player.';
            playerInfoDiv.appendChild(explanationCrdY);

            const explanationCrdR = document.createElement('p');
            explanationCrdR.textContent = 'CrdR: Red Cards - the number of red cards received by the player.';
            playerInfoDiv.appendChild(explanationCrdR);

            const explanationTkl = document.createElement('p');
            explanationTkl.textContent = 'Tkl: Tackles - the number of times the player successfully took the ball from an opponent.';
            playerInfoDiv.appendChild(explanationTkl);

            const explanationInt = document.createElement('p');
            explanationInt.textContent = 'Int: Interceptions - the number of times the player intercepted the ball from an opponent.';
            playerInfoDiv.appendChild(explanationInt);

        } else {
            playerInfoDiv.textContent = 'Player not found. Please check the name and try again.';
        }
    });
});
