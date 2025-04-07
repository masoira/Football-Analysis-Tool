import React, { useState, useEffect, useRef } from 'react';
import ActionOptions from './components/ActionOptions.jsx';
import Arrow from './components/Arrow'
import MatchSelector from './components/MatchSelector';
import ShotMarker from './components/ShotMarker'
import StatsTable from './components/StatsTable'
import MatchUploadForm from './components/MatchUploadForm';
import { supabase } from './utils/supabaseClient.js';
import { calculateXG } from './utils/expectedGoals.js';
import { getStatsFromActions } from './utils/stats.js';
import { transformMatchActions } from './utils/matchTransforms.js';
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
  const [selectedMatch, setSelectedMatch] = useState(null);
  const matchSelectorRef = useRef(null);

  // Supabase Auth stuff
  const supabaseRedirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL
  const [user, setUser] = useState(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  
    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: supabaseRedirectUrl
      }
    });
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Function to handle match selection
  const handleMatchSelect = (match) => {
    if (!match) {
      setActions([]);
      setSelectedMatch(null);
      return;
    }

    setActions(transformMatchActions(match));
    setSelectedMatch(match);
  };

  // Pitch and Actions related code starts
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

  const handleUploadSuccess = () => {
    // Clear current actions
    setActions([]);
    setSelectedMatch(null);
    // Refresh the match list
    matchSelectorRef.current?.refresh();
  };

  return (
    <>
      <nav>
      <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <span>Hello {user ? user.email : 'You have not logged in yet.'}</span>
      </nav>

      <h1>Football Shot Analysis</h1>
      <p>Click anywhere on the pitch to record a shot.</p>

      <MatchSelector ref={matchSelectorRef} onSelectMatch={handleMatchSelect} />

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

      <MatchUploadForm 
        actions={actions} 
        onUploadSuccess={handleUploadSuccess}
        selectedMatch={selectedMatch} 
      />
    </>
  );
};

export default App;
