import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import html2canvas from 'html2canvas';
import { calculateXG } from './utils/expected_goals.js';
import { getStatsFromActions } from './utils/stats.js';

// Stats Table Component
const StatsTable = ({ data }) => {
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
      <thead>
        <tr>
          {table.getAllColumns().map(column => (
            <th key={column.id}>{column.id}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const App = () => {
  // State
  const [actions, setActions] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
  // Form state
  const [teamType, setTeamType] = useState('team');
  const [shotType, setShotType] = useState('on-target');
  const [isHeader, setIsHeader] = useState(false);
  const [actionType, setActionType] = useState('none');

  // Shot marker creation
  const createShotMarker = (x, y, shotType, teamType, xG) => {
    const marker = document.createElement('div');
    marker.className = 'shot-marker';
    marker.style.left = `${x - 10}px`;
    marker.style.top = `${y - 10}px`;

    const color = teamType === 'team' ? 'var(--primary-light)' : 'var(--accent-red)';

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

    const xgText = document.createElement('div');
    xgText.innerHTML = xG.toFixed(2);
    xgText.style.position = 'absolute';
    xgText.style.left = '0px';
    xgText.style.top = '-15px';
    xgText.style.color = color;

    marker.appendChild(xgText);
    return marker;
  };

  // Arrow creation for assists/dribbles
  const drawArrow = (startX, startY, endX, endY, actionType, teamType) => {
    const arrow = document.createElement('div');
    arrow.className = 'shot-marker';
    arrow.style.position = 'absolute';
    arrow.style.left = `${startX}px`;
    arrow.style.top = `${startY}px`;

    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    arrow.style.width = `${length}px`;
    arrow.style.height = '2px';

    const color = teamType === 'team' ? 'var(--primary-light)' : 'var(--accent-red)';

    if (actionType === 'assist') {
      arrow.style.backgroundColor = color;
    } else if (actionType === 'dribble') {
      arrow.style.borderBottom = `2px dotted ${color}`;
      arrow.style.height = '0';
    }

    arrow.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`;
    arrow.style.transformOrigin = '0 0';
    return arrow;
  };

  // Clear all markers from pitch
  const clearPitch = () => {
    const pitch = document.getElementById('football-pitch');
    const markers = pitch.getElementsByClassName('shot-marker');
    Array.from(markers).forEach(marker => marker.remove());
  };

  // Display all actions
  const displayAllActions = () => {
    clearPitch();
    const pitch = document.getElementById('football-pitch');
    actions.forEach(action => {
      if (action.type === "shot") {
        const marker = createShotMarker(action.x, action.y, action.shot_type, action.team, action.xG);
        pitch.appendChild(marker);
      }
      if (action.assist) {
        const arrow = drawArrow(action.x, action.y, action.assist.x, action.assist.y, action.assist.type, action.team);
        pitch.appendChild(arrow);
      }
    });
  };

  // Update display whenever actions change
  useEffect(() => {
    displayAllActions();
  }, [actions]);

  // Handle pitch click
  const handlePitchClick = (event) => {
    const pitch = document.getElementById('football-pitch');
    const rect = pitch.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentAction === null) {
      const newAction = {
        type: "shot",
        header: isHeader,
        x: x,
        y: y,
        shot_type: shotType,
        team: teamType
      };
      newAction.xG = calculateXG(newAction);
      setActions(prev => [...prev, newAction]);
      
      if (actionType !== 'none') {
        setCurrentAction(actionType);
      }
    } else {
      setActions(prev => {
        const lastAction = {...prev[prev.length - 1]};
        lastAction.assist = {
          x: x,
          y: y,
          type: currentAction
        };
        lastAction.xG = calculateXG(lastAction);
        return [...prev.slice(0, -1), lastAction];
      });
      setCurrentAction(null);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (actions.length > 0) {
      setActions(prev => prev.slice(0, -1));
    }
    setCurrentAction(null);
  };

  // Handle JSON download
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(actions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'shot_data.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Handle image generation
  const handleGenerateImage = () => {
    const pitch = document.getElementById('football-pitch');
    html2canvas(pitch).then(canvas => {
      const downloadLink = document.getElementById('download-link');
      downloadLink.href = canvas.toDataURL();
      downloadLink.style.display = 'block';
    });
  };

  // Stats handling
  const handleShowStats = () => {
    setShowStats(!showStats);
    if (!showStats) {
      const stats = getStatsFromActions(actions);
      const container = document.getElementById('stats-root');
      if (!container._root) {
        container._root = createRoot(container);
      }
      container._root.render(<StatsTable data={stats} />);
    }
  };

  return (
    <>
      <nav>
        <button id="login-button">Login</button>
        <button id="logout-button">Logout</button>
        <span id="user-greeting">Hello! You have not logged in yet.</span>
      </nav>

      <h1>Football Shot Analysis</h1>
      <p>Click anywhere on the pitch to record a shot.</p>

      <div id="team-selector">
        <label htmlFor="teamOutcome">Select Team:</label>
        <select 
          id="teamOutcome"
          value={teamType}
          onChange={(e) => setTeamType(e.target.value)}
        >
          <option value="team">Your Team</option>
          <option value="opponent">Opponent</option>
        </select>
      </div>

      <div id="shot-type">
        <label htmlFor="shotOutcome">Select Shot Outcome:</label>
        <select 
          id="shotOutcome"
          value={shotType}
          onChange={(e) => setShotType(e.target.value)}
        >
          <option value="on-target">On Target</option>
          <option value="blocked">Blocked</option>
          <option value="off-target">Off Target</option>
        </select>
      </div>

      <div id="headerButton">
        <label htmlFor="isHeader">Is Header?</label>
        <select 
          id="isHeader"
          value={isHeader ? 'header' : 'none'}
          onChange={(e) => setIsHeader(e.target.value === 'header')}
        >
          <option value="none">No</option>
          <option value="header">Yes</option>
        </select>
      </div>

      <div id="action-type">
        <label htmlFor="actionOutcome">Select Action:</label>
        <select 
          id="actionOutcome"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          <option value="none">None</option>
          <option value="assist">Assist</option>
          <option value="dribble">Dribble</option>
        </select>
      </div>

      <div id="football-pitch" onClick={handlePitchClick}></div>

      <button id="undo-action" onClick={handleUndo}>Undo</button>
      <button id="finish-button" onClick={handleGenerateImage}>Finish</button>
      <a id="download-link" href="#" download="shot_map.png">Download Shot Map</a>
      <button id="download-json" onClick={handleDownloadJSON}>Download Shot Data as JSON</button>
      <button id="show-stats" onClick={handleShowStats}>Show Match Stats</button>
      <div id="stats-root"></div>
    </>
  );
};

export default App;
