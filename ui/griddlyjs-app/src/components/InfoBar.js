import React from "react";
import ScorePopup from "./ScorePopup";

const InfoBar = ({ session, avatarPath, level, score }) => {
  const numLevels = session.levels.length;

  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {avatarPath ? (
          <span>
            <img src={`resources/images/${avatarPath}`} />
            's turn
          </span>
        ) : (
          "Your turn"
        )}
      </div>
      <ScorePopup session={session} score={score} />
      <div className="info-bar-stats">
        {InfoBarItem(
          "level",
          level === 0
            ? "practice"
            : `${Math.min(level, numLevels)}/${numLevels}`
        )}
        {InfoBarItem("score", score)}
      </div>
    </div>
  );
};

const InfoBarItem = (key, val) => {
  return (
    <div className="info-bar-stats-item">
      <div className="info-bar-stats-item-key">{key}:</div>
      <div className="info-bar-stats-item-val">{val}</div>
    </div>
  );
};

export default InfoBar;
