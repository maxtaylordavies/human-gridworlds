import React from "react";

import { useStore } from "../store";
import * as utils from "../utils";

const InfoBar = () => {
  const expState = useStore((state) => state.expState);
  const playing = useStore((state) => state.gameState.playing);

  return (
    <div className="info-bar">
      <div className="info-bar-playing">
        {playing ? "Playing" : `Observing: ${utils.currentAgentName(expState)}`}
      </div>
      <div className="info-bar-stats">
        {InfoBarItem(
          "phase",
          `${expState.phaseIdx + 1}/${expState.session.phases.length}`
        )}
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
