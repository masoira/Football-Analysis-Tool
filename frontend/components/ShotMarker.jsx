import React from "react";

const ShotMarker = ({ x, y, shotType, team, isHeader, xG }) => {
  const markerClass = isHeader ? 'header-shot' : shotType;
  
  return (
    <div className={`shot-marker ${markerClass}`} style={{ left: `${x - 10}px`, top: `${y - 10}px` }}>
      {shotType === 'off-target' ? 'X' : ''}
      <div className="xg-text">{xG.toFixed(2)}</div>
    </div>
  );
};

export default ShotMarker;
