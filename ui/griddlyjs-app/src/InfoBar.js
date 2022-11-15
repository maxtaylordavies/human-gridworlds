import React from "react";

const InfoBar = (props) => {
  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {props.playing ? "Playing" : "Watching"}
      </div>
      <div className="info-bar-stats">
        {InfoBarItem(
          "level",
          `${Math.min(props.level + 1, props.numLevels)}/${props.numLevels}`
        )}
        {InfoBarItem("score", props.score)}
      </div>
    </div>
  );
};

const InfoBarItem = (key, val) => {
  return (
    <div className="info-bar-stats-item">
      <div className="info-bar-stats-item-key">{key}</div>
      <div className="info-bar-stats-item-val">{val}</div>
    </div>
  );
};

export default InfoBar;
