import { calculateXG } from './expected_goals.js';

let actions = [];
let currentAction = null;


// displays a single action (possible including both dribble/assist and shot)
function displayAction(action) {
    if (action.type === "shot") {
        createShotMarker(action.x, action.y, action.shot_type, action.team);
    }
    if (action.assist) {
        drawArrow(action.x, action.y, action.assist.x, action.assist.y, action.assist.type, action.team);
    }
}

// function to start fresh and loop over all action in an array to display them
function displayAllActions(actions) {
    clearPitch();
    actions.forEach(action => displayAction(action));
}

// registers click, stores it to 'actions' array and displays the new shot/assist/dribble
function recordAction(event) {
    const pitch = document.getElementById('football-pitch');
    const rect = pitch.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const actionType = document.getElementById('actionOutcome').value;
    const shotType = document.getElementById('shotOutcome').value;
    const teamType = document.getElementById('teamOutcome').value;

    if (currentAction === null) {
        let newAction = {
            type: "shot",
            header: false,  // TODO: Add button to be able to set this to true
            x: x,
            y: y,
            shot_type: shotType,
            team: teamType
        };
        // calculate xG based on shot info. Recalculated and overwritten if assist/dribble info is added.
        newAction.xG = calculateXG(newAction);
        actions.push(newAction);
        displayAction(newAction);
        // if assist or dribble was selected, after placing shot, the user places assist or dribble location.
        // When currentAction is set, the program know the next click is associated with the previously assigned shot.
        if (actionType !== 'none') {
            currentAction = actionType;
        }
    } else {
        if (actionType !== 'none') {
            actions[actions.length-1].assist = {
                x: x,
                y: y,
                type: currentAction
            };
            actions[actions.length-1].xG = calculateXG(actions[actions.length-1]);
            displayAction(actions[actions.length-1]);
        }
        currentAction = null;
    }
}

// draws a single shot marker
function createShotMarker(x, y, shotType, teamType) {
    const marker = document.createElement('div');
    marker.className = 'shot-marker';
    marker.style.left = `${x - 10}px`;
    marker.style.top = `${y - 10}px`;

    let color = (teamType === 'team') ? 'red' : '#1E90FF';

    if (shotType === 'on-target') {
        marker.style.width = '15px';
        marker.style.height = '15px';
        marker.style.backgroundColor = color;
        marker.style.borderRadius = '50%';
    } else if (shotType === 'blocked') {
        marker.style.width = '15px';
        marker.style.height = '15px';
        marker.style.backgroundColor = color;
        marker.style.borderRadius = '0%';
    } else if (shotType === 'off-target') {
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.color = color;
        marker.innerHTML = 'X';
        marker.style.fontSize = '16px';
        marker.style.textAlign = 'center';
        marker.style.lineHeight = '20px';
    }

    // xG text above the marker
    const xgText = document.createElement('div');
    xgText.innerHTML = actions[actions.length-1].xG.toFixed(2);
    xgText.style.position = 'absolute';
    xgText.style.left = '0px';
    xgText.style.top = '-15px';
    xgText.style.color = (teamType === 'team') ? 'red' : '#1E90FF';

    const pitch = document.getElementById('football-pitch');
    marker.appendChild(xgText);
    pitch.appendChild(marker);
}

// draws a single marker for assist or dribble
function drawArrow(startX, startY, endX, endY, actionType, teamType) {
    const pitch = document.getElementById('football-pitch');
    const arrow = document.createElement('div');
    arrow.className = 'shot-marker';
    arrow.style.position = 'absolute';
    arrow.style.left = `${startX}px`;
    arrow.style.top = `${startY}px`;

    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    arrow.style.width = `${length}px`;
    arrow.style.height = '2px';

    let arrowColor = (teamType === 'team') ? 'red' : '#1E90FF';

    if (actionType === 'assist') {
        arrow.style.backgroundColor = arrowColor;
    } else if (actionType === 'dribble') {
        arrow.style.borderBottom = `2px dotted ${arrowColor}`;
        arrow.style.height = '0';
    }

    arrow.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`;
    arrow.style.transformOrigin = '0 0';
    pitch.appendChild(arrow);
}

// Function to download shot data as a JSON file
function downloadJSON() {
    const dataStr = JSON.stringify(actions, null, 2); // Convert shots array to JSON string
    const blob = new Blob([dataStr], { type: 'application/json' }); // Create a blob
    const url = URL.createObjectURL(blob); // Create a URL for the blob

    const downloadLink = document.createElement('a');
    downloadLink.href = url; // Set the URL to the link
    downloadLink.download = 'shot_data.json'; // Specify the name of the file
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Trigger download
    document.body.removeChild(downloadLink); // Remove the link after download
}


function generateImage() {
    const canvas = document.getElementById('shot-map-canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = 'football_pitch.jpg';
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        actions.forEach((action) => {
            const color = (action.team === 'team') ? 'red' : '#1E90FF';

            // Draw shot marker
            if (action.type === 'shot') {
                if (action.shot_type === 'on-target') {
                    ctx.beginPath();
                    ctx.arc(action.x, action.y, 7, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                } else if (action.shot_type === 'blocked') {
                    ctx.fillStyle = color;
                    ctx.fillRect(action.x - 7, action.y - 7, 15, 15);
                } else if (action.shot_type === 'off-target') {
                    ctx.fillStyle = color;
                    ctx.fillText('X', action.x - 10, action.y + 5);
                }
            }

            // Draw assist/dribble arrow
            if (action.assist) {
                ctx.beginPath();
                ctx.moveTo(action.x, action.y);
                ctx.lineTo(action.assist.x, action.assist.y);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        const downloadLink = document.getElementById('download-link');
        downloadLink.style.display = 'block';
        downloadLink.onclick = function() {
            const dataURL = canvas.toDataURL('image/png');
            downloadLink.href = dataURL;
        };
    };
}

document.getElementById('football-pitch').addEventListener('click', recordAction);
document.getElementById('finish-button').addEventListener('click', generateImage);
document.getElementById('download-json').addEventListener('click', downloadJSON);
