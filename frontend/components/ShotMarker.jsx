import React from "react";
import './ShotMarker.css';

const ShotMarker = ({ x, y, shotType, team, xG }) => {
  const classNames = ['shot-marker', team, shotType].join(' ');

  return (
    <div
      className={classNames}
      style={{ left: `${x - 10}px`, top: `${y - 10}px` }}
    >
      {shotType === 'off-target' ? 'X' : ''}
      <div className="xg-text">{xG.toFixed(2)}</div>
    </div>
  );
};

export default ShotMarker;
