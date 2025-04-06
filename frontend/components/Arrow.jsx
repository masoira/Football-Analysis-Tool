import React from "react";

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

export default Arrow;
