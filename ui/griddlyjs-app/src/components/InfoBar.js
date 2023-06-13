import React, { useState, useEffect } from "react";

import { useStore } from "../store";
import ScorePopup from "./ScorePopup";

const InfoBar = () => {
  const { session, phaseIdx, levelIdx } = useStore((state) => state.expState);
  const score = useStore((state) => state.gameState.score);
  const [prevScore, setprevScore] = useState(score);
  const [scoreDelta, setScoreDelta] = useState(0);
  const pathIdx = useStore((state) => state.playbackState.currentPathIdx);

  // const avatarPath = session.agentAvatars[session.agentIds[pathIdx]] || "";
  const avatarPath = "";

  useEffect(() => {
    setScoreDelta(score - prevScore);
    setprevScore(score);
  }, [score]);

  console.log("scoreDelta", scoreDelta);

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
      <ScorePopup scoreDelta={scoreDelta} clearDelta={() => setScoreDelta(0)} />
      <div className="info-bar-stats">
        {InfoBarItem("phase", phaseIdx + 1)}
        {InfoBarItem(
          "level",
          `${levelIdx + 1}/${session.phases[phaseIdx].levels.length}`
        )}
        {InfoBarItem("score", score, {
          color: scoreDelta > 0 ? "green" : scoreDelta < 0 ? "red" : "",
          fontWeight: scoreDelta === 0 ? "" : "bold",
          minWidth: 96,
        })}
      </div>
    </div>
  );
};

const InfoBarItem = (key, val, style = {}) => {
  return (
    <div className="info-bar-stats-item" style={style}>
      <div className="info-bar-stats-item-key">{key}:</div>
      <div className="info-bar-stats-item-val">{val}</div>
    </div>
  );
};

export default InfoBar;
