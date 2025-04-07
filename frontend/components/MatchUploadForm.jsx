import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MatchUploadForm = ({ actions, onUploadSuccess, selectedMatch }) => {
  const [matchName, setMatchName] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form when a match is selected or clear it when deselected
  useEffect(() => {
    if (selectedMatch) {
      setMatchName(selectedMatch.match_name);
      setHomeTeam(selectedMatch.home_team || '');
      setAwayTeam(selectedMatch.away_team || '');
      setMatchDate(selectedMatch.date);
    } else {
      // Clear form when no match is selected
      setMatchName('');
      setHomeTeam('');
      setAwayTeam('');
      setMatchDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedMatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No authentication token found');

      // Create match data with current actions in a Full Match period
      const matchData = {
        match_name: matchName,
        home_team: homeTeam || null,
        away_team: awayTeam || null,
        date: matchDate,
        periods: [
          {
            type: "Full Match",
            actions: actions.map(action => ({
              type: action.type,
              x: action.x,
              y: action.y,
              shot_type: action.shotType,
              is_header: action.header,
              team: action.team,
              assist: action.assist
            }))
          }
        ]
      };

      // Determine if this is a new match or an update
      const isUpdate = selectedMatch?.match_id;
      const url = isUpdate 
        ? `${API_BASE_URL}/matches/${selectedMatch.match_id}`
        : `${API_BASE_URL}/matches/`;

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(matchData)
      });

      if (!response.ok) {
        throw new Error(isUpdate ? 'Failed to update match' : 'Failed to upload match');
      }

      // Clear form if it's a new match, keep data if updating
      if (!isUpdate) {
        setMatchName('');
        setHomeTeam('');
        setAwayTeam('');
        setMatchDate(new Date().toISOString().split('T')[0]);
      }
      
      setSuccessMessage(isUpdate ? 'Match updated successfully!' : 'Match saved successfully!');
      onUploadSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to save match');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="match-upload-form">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div>
        <label htmlFor="matchName">Match Name*:</label>
        <input
          id="matchName"
          type="text"
          value={matchName}
          onChange={(e) => setMatchName(e.target.value)}
          required
          placeholder="e.g., Arsenal vs Chelsea"
        />
      </div>

      <div>
        <label htmlFor="homeTeam">Home Team:</label>
        <input
          id="homeTeam"
          type="text"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          placeholder="e.g., Arsenal"
        />
      </div>

      <div>
        <label htmlFor="awayTeam">Away Team:</label>
        <input
          id="awayTeam"
          type="text"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          placeholder="e.g., Chelsea"
        />
      </div>

      <div>
        <label htmlFor="matchDate">Date*:</label>
        <input
          id="matchDate"
          type="date"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Saving...' : (selectedMatch ? 'Update Match' : 'Save Match')}
      </button>
    </form>
  );
};

export default MatchUploadForm; 