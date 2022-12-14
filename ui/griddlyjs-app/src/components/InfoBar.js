import React from "react";
import ScorePopup from "./ScorePopup";

const InfoBar = (props) => {
  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {props.avatarPath ? (
          <span>
            <img src={`resources/images/${props.avatarPath}`} />
            's turn
          </span>
        ) : (
          "Your turn"
        )}
      </div>
      <ScorePopup score={props.score} />
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
