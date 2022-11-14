import React from "react";

const InfoBar = (props) => {
  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {props.playing ? "Playing" : "Watching"}
      </div>
      <div className="info-bar-stats">
        <div className="info-bar-stats-item">
          level {Math.min(props.level + 1, props.numLevels)}/{props.numLevels}
        </div>
        <div className="info-bar-stats-item">score: {props.score}</div>
      </div>
    </div>
  );
};

export default InfoBar;
