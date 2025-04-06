import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MatchSelector = ({ supabase, onSelectMatch }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No token');

      const res = await fetch(`${API_BASE_URL}/api/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch matches');
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <button onClick={loadMatches} disabled={loading}>
        {loading ? 'Loading...' : 'Load Matches'}
    </button>

    <select onChange={(e) => onSelectMatch?.(e.target.value)}>
        <option value="">Select a match</option>
        {matches.map((match) => (
        <option key={match.match_id} value={match.match_id}>
            {match.match_name}
        </option>
        ))}
    </select>
    </div>
  );
};

export default MatchSelector;
