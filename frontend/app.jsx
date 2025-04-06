import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import ActionOptions from './components/ActionOptions.jsx';
import Arrow from './components/Arrow'
import MatchSelector from './components/MatchSelector';
import ShotMarker from './components/ShotMarker'
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

  // Supabase Auth stuff
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)
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
        redirectTo: 'https://masoira.github.io/Football-Analysis-Tool/'
      }
    });
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

  return (
    <>
      <nav>
      <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <span>Hello {user ? user.email : 'You have not logged in yet.'}</span>
      </nav>

      <h1>Football Shot Analysis</h1>
      <p>Click anywhere on the pitch to record a shot.</p>

      <MatchSelector supabase={supabase} />

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
