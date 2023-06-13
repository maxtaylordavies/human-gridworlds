import React from "react";

import { useStore } from "../store";
import ScorePopup from "./ScorePopup";

const InfoBar = () => {
  const { session, phaseIdx, levelIdx } = useStore((state) => state.expState);
  const score = useStore((state) => state.gameState.score);
  const pathIdx = useStore((state) => state.playbackState.currentPathIdx);

  // const avatarPath = session.agentAvatars[session.agentIds[pathIdx]] || "";
  const avatarPath = "";

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
      <ScorePopup />
      <div className="info-bar-stats">
        {InfoBarItem("phase", phaseIdx + 1)}
        {InfoBarItem(
          "level",
          `${levelIdx + 1}/${session.phases[phaseIdx].levels.length}`
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
