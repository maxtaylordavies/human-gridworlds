import React, { useState, useEffect } from "react";

import { useStore } from "../store";
import ScorePopup from "./ScorePopup";
import * as utils from "../utils";

const InfoBar = () => {
  const expState = useStore((state) => state.expState);
  const playing = useStore((state) => state.gameState.playing);
  const score = useStore((state) => state.score);

  const [prevScore, setprevScore] = useState(score);
  const [scoreDelta, setScoreDelta] = useState(0);

  useEffect(() => {
    setScoreDelta(score - prevScore);
    setprevScore(score);
  }, [score]);

  let color = "";
  if (scoreDelta > 10) {
    color = "#00C14D";
  } else if (scoreDelta > 0) {
    color = "#FF9900";
  } else if (scoreDelta < 0) {
    color = "#FF0000";
  }

  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {playing ? "Playing" : `Observing: ${utils.getAgentName(expState)}`}
      </div>
      <ScorePopup
        scoreDelta={scoreDelta}
        clearDelta={() => setScoreDelta(0)}
        scoreHidden={expState.session.phases[expState.phaseIdx].objectsHidden}
      />
      <div className="info-bar-stats">
        {InfoBarItem(
          "phase",
          `${expState.phaseIdx + 1}/${expState.session.phases.length}`
        )}
        {/* {InfoBarItem(
          "level",
          `${levelIdx + 1}/${session.phases[phaseIdx].levels.length}`
        )} */}
        {/* {InfoBarItem("score", score, {
          color: color,
          fontWeight: scoreDelta === 0 ? "" : "bold",
          minWidth: 95,
        })} */}
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
