import React from 'react';
import { createRoot } from 'react-dom/client';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { createClient } from '@supabase/supabase-js'
import html2canvas from 'html2canvas';

import { calculateXG } from './utils/expected_goals.js';
import { getStatsFromActions } from './utils/stats.js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

let isHeader = false; // Default to "No", meaning not a header
let actions = [];
let currentAction = null;


// displays a single action (possible including both dribble/assist and shot)
function displayAction(action) {
    if (action.type === "shot") {
        createShotMarker(action.x, action.y, action.shot_type, action.team, action.xG);
    }
    if (action.assist) {
        drawArrow(action.x, action.y, action.assist.x, action.assist.y, action.assist.type, action.team);
    }
}

// clears all shot markers from the pitch
function clearPitch() {
    const pitch = document.getElementById('football-pitch');
    const markers = pitch.getElementsByClassName('shot-marker');
    Array.from(markers).forEach(marker => marker.remove());
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

    // TODO: Do blocked shots count towards expected goals? Currently they do.
    const actionType = document.getElementById('actionOutcome').value;
    const shotType = document.getElementById('shotOutcome').value;
    const teamType = document.getElementById('teamOutcome').value;

    if (currentAction === null) {
        let newAction = {
            type: "shot",
            header: isHeader,  // TODO: Add button to be able to set this to true
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

// undoes the previous action
function undoAction() {
    console.log('Starting undo operation - Current actions length:', actions.length);
    if (actions.length > 0) {
        actions.pop();
        displayAllActions(actions);
    }
    currentAction = null;
}

// draws a single shot marker
function createShotMarker(x, y, shotType, teamType, xG) {
    const marker = document.createElement('div');
    marker.className = 'shot-marker';
    marker.style.left = `${x - 10}px`;
    marker.style.top = `${y - 10}px`;

    let color = (teamType === 'team') ? 'var(--primary-light)' : 'var(--accent-red)';

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
    xgText.innerHTML = xG.toFixed(2);
    xgText.style.position = 'absolute';
    xgText.style.left = '0px';
    xgText.style.top = '-15px';
    xgText.style.color = (teamType === 'team') ? 'var(--primary-light)' : 'var(--accent-red)';

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

    let arrowColor = (teamType === 'team') ? 'var(--primary-light)' : 'var(--accent-red)';

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
    const pitch = document.getElementById('football-pitch');
    html2canvas(pitch).then(canvas => {
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = canvas.toDataURL();
        downloadLink.style.display = 'block';
    });
}

// Renders a sortable table using TanStack Table. Converts data array [{Statistic, Your Team, Opponent},...] into HTML table structure
function StatsTable({ data }) {
    const columns = [
      { accessorKey: 'Statistic' },
      { accessorKey: 'Your Team' },
      { accessorKey: 'Opponent' }
    ];
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });
  
    return (
      <table>
        <thead><tr>
          {table.getAllColumns().map(column => (
            <th key={column.id}>{column.id}</th>
          ))}
        </tr></thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{cell.getValue()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
// TODO: Style table using one of:
// - @tanstack/react-table-plugins (official styling plugin)
// - tailwindcss (utility classes, popular with React)
// - shadcn/ui table component (pre-styled, modern look)

  function showStats() {
    console.log('Starting showStats');
    const stats = getStatsFromActions(actions);
    const container = document.getElementById('stats-root');
    
    if (!container._root) {
        container._root = createRoot(container);
    }
    container._root.render(<StatsTable data={stats} />);
}

const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: 'https://masoira.github.io/Football-Analysis-Tool/'
          }
    });
};

// Check account for correct greeting text when page loads
window.addEventListener('load', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
        document.getElementById('user-greeting').textContent = `Hello ${session.user.email}!`;
    }
});

const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    document.getElementById('user-greeting').textContent = 'You have logged out.';
};

document.getElementById('login-button').addEventListener('click', handleSignUp);
document.getElementById('logout-button').addEventListener('click', handleSignOut);
document.getElementById('football-pitch').addEventListener('click', recordAction);
document.getElementById('undo-action').addEventListener('click', undoAction);
document.getElementById('finish-button').addEventListener('click', generateImage);
document.getElementById('download-json').addEventListener('click', downloadJSON);
document.getElementById('show-stats').addEventListener('click', showStats);
// Add an event listener to update isHeader based on dropdown selection
document.getElementById('isHeader').addEventListener('change', function(event) {
    isHeader = event.target.value === 'header';  // Set isHeader to true if 'Yes' is selected, false otherwise
});
