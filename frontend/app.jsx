import React, { useState, useEffect } from 'react';
import ActionOptions from './components/ActionOptions.jsx';
import ShotMarker from './components/ShotMarker'
import Arrow from './components/Arrow'
import StatsTable from './components/StatsTable'
import { calculateXG } from './utils/expected_goals.js';
import { getStatsFromActions } from './utils/stats.js';
import './styles.css';

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

      <ActionOptions
      teamType={teamType} setTeamType={setTeamType}
      shotType={shotType} setShotType={setShotType}
      isHeader={isHeader} setIsHeader={setIsHeader}
      actionType={actionType} setActionType={setActionType}
      />

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
