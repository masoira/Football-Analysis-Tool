import React from 'react';

const ActionOptions = ({
  teamType, setTeamType,
  shotType, setShotType,
  isHeader, setIsHeader,
  actionType, setActionType
}) => {
  return (
    <>
      <div id="team-selector">
        <label>Select Team:</label>
        <select value={teamType} onChange={(e) => setTeamType(e.target.value)}>
          <option value="team">Your Team</option>
          <option value="opponent">Opponent</option>
        </select>
      </div>

      <div id="shot-type">
        <label>Select Shot Outcome:</label>
        <select value={shotType} onChange={(e) => setShotType(e.target.value)}>
          <option value="on-target">On Target</option>
          <option value="blocked">Blocked</option>
          <option value="off-target">Off Target</option>
        </select>
      </div>

      <div id="headerButton">
        <label>Is Header?</label>
        <select value={isHeader ? 'header' : 'none'} onChange={(e) => setIsHeader(e.target.value === 'header')}>
          <option value="none">No</option>
          <option value="header">Yes</option>
        </select>
      </div>

      <div id="action-type">
        <label>Select Action:</label>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
          <option value="none">None</option>
          <option value="assist">Assist</option>
          <option value="dribble">Dribble</option>
        </select>
      </div>
    </>
  );
};

export default ActionOptions;
