import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { supabase } from '../utils/supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MatchSelector = forwardRef(({ onSelectMatch }, ref) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No token');

      console.log('Bearer token:', token);

      const res = await fetch(`${API_BASE_URL}/matches/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch matches');
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      setErrorMsg(err.message || String(err));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchChange = (e) => {
    const matchId = e.target.value;
    setSelectedMatchId(matchId);
    const selectedMatch = matches.find(match => match.match_id === matchId);
    onSelectMatch?.(selectedMatch);
  };

  // Load matches when component mounts and when refreshTrigger changes
  useEffect(() => {
    loadMatches();
  }, []);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh: loadMatches
  }));

  return (
    <div className="match-selector">
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {loading && <div>Loading matches...</div>}
      
      {!loading && !errorMsg && matches.length === 0 && (
        <div>No matches found.</div>
      )}
      
      <select 
        value={selectedMatchId}
        onChange={handleMatchChange}
        disabled={loading}
      >
        <option value="">New Match</option>
        <option value="existing" disabled>───────────</option>
        {matches.map((match) => (
          <option key={match.match_id} value={match.match_id}>
            {match.match_name}
          </option>
        ))}
      </select>
    </div>
  );
});

export default MatchSelector;
