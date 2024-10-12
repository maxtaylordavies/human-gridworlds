import React from "react";

import { useStore } from "../store";
import * as utils from "../utils";

const Avatar = () => {
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const gameState = useStore((state) => state.gameState);

  const avatarPos = utils.computeNameBadgePos(expState, gameState);
  const phi = utils.currentPhi(expState);
  const phiRGBString = `rgb(${phi.map((x) => Math.floor(x * 255)).join(", ")})`;

  return (
    <div
      className="avatar-container"
      style={{
        left: avatarPos.left,
        top: avatarPos.top,
      }}
    >
      <div className="name-badge">{utils.currentAgentName(expState)}</div>
      <div className="avatar" style={{ backgroundColor: phiRGBString }}>
        <div className="avatar-eyes">
          <div className="avatar-eye">
            <div className="avatar-pupil" />
          </div>
          <div className="avatar-eye">
            <div className="avatar-pupil" />
          </div>
        </div>
        <div className="avatar-mouth" />
      </div>
    </div>
  );
};

export default Avatar;
