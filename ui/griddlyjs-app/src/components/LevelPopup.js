import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./Modal";
import * as utils from "../utils";

const LevelPopup = ({ duration, delay }) => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const expState = useStore((state) => state.expState);
  const { gdy, goalImages } = useStore((state) => state.gameState);
  const [playbackState, setPlaybackState] = useStore((state) => [
    state.playbackState,
    state.setPlaybackState,
  ]);

  const [lvl, setLvl] = useState(-1);

  useEffect(() => {
    if (expState.levelIdx !== lvl && isReady()) {
      update();
    }
  }, [uiState, expState]);

  const isReady = () => {
    return !(
      uiState.showInitialInstructions ||
      uiState.showFinishedScreen ||
      expState.levelIdx >=
        expState.session.phases[expState.phaseIdx].levels.length
    );
  };

  const update = () => {
    setTimeout(() => {
      setLvl(expState.levelIdx);
      setUIState({ ...uiState, showLevelPopup: true });
    }, delay);
  };

  const onProceedClicked = () => {
    setUIState({ ...uiState, showLevelPopup: false });
  };

  return (
    isReady() &&
    uiState.showLevelPopup &&
    expState.levelIdx !== -1 && (
      <Modal open={uiState.showLevelPopup} className="level-popup">
        <div className="level-popup-title">
          {lvl === 0 ? "Practice level" : `Level ${lvl}`}
        </div>
        <div>
          <span>Aliens</span>
          <div className="level-popup-icon-container">
            {expState.session.agentIds
              .filter((agent, idx) => playbackState.pathsToShow[idx] !== "")
              .map((agent) => expState.session.agentAvatars[agent])
              .map((imgPath) => (
                <img
                  src={`resources/images/${imgPath}`}
                  height="40px"
                  style={{ marginRight: 10 }}
                />
              ))}
          </div>
        </div>
        <div>
          <span>Gems</span>
          <div className="level-popup-icon-container">
            {goalImages
              .filter((gi) =>
                gdy.Environment.Levels[utils.currentLevelId(expState)].includes(
                  gi.replace(".png", "").slice(-1)
                )
              )
              .map((imgPath) => {
                let idx = goalImages.indexOf(imgPath);
                return (
                  <div className="level-popup-gem">
                    <img src={`resources/images/${imgPath}`} height="40px" />
                    <span>
                      {idx <= 2 ? expState.session.utility.goals[idx] : "?"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="level-popup-button-row">
          <motion.button
            onClick={onProceedClicked}
            className="level-popup-button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            Proceed
          </motion.button>
        </div>
      </Modal>
    )
  );
};

export default LevelPopup;
