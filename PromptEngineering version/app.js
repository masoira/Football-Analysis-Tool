let shots = [];
let arrows = [];
let currentAction = null;

function recordAction(event) {
    const pitch = document.getElementById('football-pitch');
    const rect = pitch.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const actionType = document.getElementById('actionOutcome').value;
    const shotType = document.getElementById('shotOutcome').value;
    const teamType = document.getElementById('teamOutcome').value;

    if (currentAction === null) {
        recordShot(x, y, shotType, teamType);
        if (actionType !== 'none') {
            currentAction = actionType;
        }
    } else {
        if (actionType !== 'none') {
            drawArrow(shots[shots.length - 1].x, shots[shots.length - 1].y, x, y, currentAction, teamType);
            arrows.push({ startX: shots[shots.length - 1].x, startY: shots[shots.length - 1].y, endX: x, endY: y, type: currentAction, team: teamType });
        }
        currentAction = null;
    }
}

function recordShot(x, y, shotType, teamType) {
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

    const pitch = document.getElementById('football-pitch');
    pitch.appendChild(marker);

    shots.push({ x: x, y: y, type: shotType, team: teamType });
}

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
    const dataStr = JSON.stringify(shots, null, 2); // Convert shots array to JSON string
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
    img.src = 'football_pitch.jpg'; // Make sure this is the correct path
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        shots.forEach((shot) => {
            const color = (shot.team === 'team') ? 'red' : '#1E90FF';

            if (shot.type === 'on-target') {
                ctx.beginPath();
                ctx.arc(shot.x, shot.y, 7, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            } else if (shot.type === 'blocked') {
                ctx.fillStyle = color;
                ctx.fillRect(shot.x - 7, shot.y - 7, 15, 15);
            } else if (shot.type === 'off-target') {
                ctx.fillStyle = color;
                ctx.fillText('X', shot.x - 10, shot.y + 5);
            }
        });

        arrows.forEach((arrow) => {
            ctx.beginPath();
            ctx.moveTo(arrow.startX, arrow.startY);
            ctx.lineTo(arrow.endX, arrow.endY);
            ctx.strokeStyle = (arrow.team === 'team') ? 'red' : '#1E90FF';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        const downloadLink = document.getElementById('download-link');
        downloadLink.style.display = 'block';
        downloadLink.onclick = function() {
            const dataURL = canvas.toDataURL('image/png');
            downloadLink.href = dataURL;
        };
    };
}
