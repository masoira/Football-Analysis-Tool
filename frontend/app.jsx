import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import html2canvas from 'html2canvas';
import { calculateXG } from './utils/expected_goals.js';
import { getStatsFromActions } from './utils/stats.js';
import './styles.css';

// Shot Marker Component
const ShotMarker = ({ x, y, shotType, team, isHeader, xG }) => {
  const markerClass = isHeader ? 'header-shot' : shotType;
  
  return (
    <div className={`shot-marker ${markerClass}`} style={{ left: `${x - 10}px`, top: `${y - 10}px` }}>
      {shotType === 'off-target' ? 'X' : ''}
      <div className="xg-text">{xG.toFixed(2)}</div>
    </div>
  );
};

// Arrow Component for Assists & Dribbles
const Arrow = ({ startX, startY, endX, endY, actionType, team }) => {
  const style = {
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)}px`,
    transform: `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`,
    transformOrigin: '0 0',
    position: 'absolute',
    borderBottom: actionType === 'assist' ? '2px solid var(--primary-light)' : '2px dotted var(--accent-red)',
  };

  return <div className="arrow" style={style}></div>;
};

// Stats Table Component
const StatsTable = ({ data }) => {
  const columns = [
    { accessorKey: 'Statistic', header: 'Statistic' },
    { accessorKey: 'Your Team', header: 'Your Team' },
    { accessorKey: 'Opponent', header: 'Opponent' },
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
          {columns.map(column => (
            <th key={column.accessorKey}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Main App Component
const App = () => {
  const [actions, setActions] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [teamType, setTeamType] = useState('team');
  const [shotType, setShotType] = useState('on-target');
  const [isHeader, setIsHeader] = useState(false);
  const [actionType, setActionType] = useState('none');
  const [currentAction, setCurrentAction] = useState(null);

  const handlePitchClick = (event) => {
    const pitch = document.getElementById('football-pitch');
    const rect = pitch.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentAction === null) {
      const newAction = {
        type: "shot",
        header: isHeader,
        x,
        y,
        shotType,
        team: teamType,
        xG: calculateXG({ type: "shot", header: isHeader, x, y, shotType, team: teamType }),
      };

      setActions([...actions, newAction]);

      if (actionType !== 'none') {
        setCurrentAction(actionType);
      }
    } else {
      setActions(prev => {
        const lastAction = { ...prev[prev.length - 1] };
        lastAction.assist = { x, y, type: currentAction };
        return [...prev.slice(0, -1), lastAction];
      });

      setCurrentAction(null);
    }
  };

  const handleUndo = () => {
    setActions(actions.slice(0, -1));
    setCurrentAction(null);
  };

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

  return (
    <>
      <nav>
        <button id="login-button">Login</button>
        <button id="logout-button">Logout</button>
        <span id="user-greeting">Hello! You have not logged in yet.</span>
      </nav>

      <h1>Football Shot Analysis</h1>
      <p>Click anywhere on the pitch to record a shot.</p>

      <div id="football-pitch" onClick={handlePitchClick}>
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            <ShotMarker {...action} />
            {action.assist && <Arrow startX={action.x} startY={action.y} endX={action.assist.x} endY={action.assist.y} actionType={action.assist.type} />}
          </React.Fragment>
        ))}
      </div>

      <button id="undo-action" onClick={handleUndo}>Undo</button>
      <button id="download-json" onClick={handleDownloadJSON}>Download Shot Data</button>
      <button id="show-stats" onClick={() => setShowStats(!showStats)}>Show Match Stats</button>

      {showStats && <StatsTable data={getStatsFromActions(actions)} />}
    </>
  );
};

export default App;
