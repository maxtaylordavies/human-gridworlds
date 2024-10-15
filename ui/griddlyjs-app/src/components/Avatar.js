import React from "react";

import { useStore } from "../store";
import * as utils from "../utils";

export const AgentIcon = ({ phi, size }) => {
  const rgbString = utils.phiToRGBString(phi);

  return (
    <div className={`avatar ${size}`} style={{ backgroundColor: rgbString }}>
      <div className={`avatar-eyes ${size}`}>
        <div className={`avatar-eye ${size}`}>
          <div className={`avatar-pupil ${size}`} />
        </div>
        <div className={`avatar-eye ${size}`}>
          <div className={`avatar-pupil ${size}`} />
        </div>
      </div>
      <div className={`avatar-mouth ${size}`} />
    </div>
  );
};

export const Avatar = () => {
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const gameState = useStore((state) => state.gameState);

  const avatarPos = utils.computeNameBadgePos(expState, gameState);
  const phi = utils.currentPhi(expState);

  return (
    <div
      className="avatar-container"
      style={{
        left: avatarPos.left,
        top: avatarPos.top,
      }}
    >
      <div className="name-badge">{utils.currentAgentName(expState)}</div>
      <AgentIcon phi={phi} size="small" />
    </div>
  );
};
