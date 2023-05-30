import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./Modal";
import * as utils from "../utils";

const LevelPopup = ({ duration, delay }) => {
  const { showInitialInstructions, finished } = useStore(
    (state) => state.appState
  );
  const sessionState = useStore((state) => state.sessionState);
  const { gdy, goalImages } = useStore((state) => state.gameState);
  const [playbackState, setPlaybackState] = useStore((state) => [
    state.playbackState,
    state.setPlaybackState,
  ]);

  const [open, setOpen] = useState(false);
  const [lvl, setLvl] = useState(-1);

  useEffect(() => {
    if (sessionState.levelIdx !== lvl && isReady()) {
      update();
    }
  }, [showInitialInstructions, finished, sessionState]);

  const isReady = () => {
    return !(
      showInitialInstructions ||
      finished ||
      sessionState.levelIdx >=
        sessionState.session.phases[sessionState.phaseIdx].levels.length
    );
  };

  const update = () => {
    setTimeout(() => {
      setLvl(sessionState.levelIdx);
      setOpen(true);
    }, delay);
  };

  const onProceedClicked = () => {
    setOpen(false);
    setPlaybackState({ ...playbackState, waiting: false });
  };

  return (
    isReady() &&
    open &&
    sessionState.levelIdx !== -1 && (
      <Modal open={open} className="level-popup">
        <div className="level-popup-title">
          {lvl === 0 ? "Practice level" : `Level ${lvl}`}
        </div>
        <div>
          <span>Aliens</span>
          <div className="level-popup-icon-container">
            {sessionState.session.agentIds
              .filter((agent, idx) => playbackState.pathsToShow[idx] !== "")
              .map((agent) => sessionState.session.agentAvatars[agent])
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
                gdy.Environment.Levels[
                  utils.currentLevelId(sessionState)
                ].includes(gi.replace(".png", "").slice(-1))
              )
              .map((imgPath) => {
                let idx = goalImages.indexOf(imgPath);
                return (
                  <div className="level-popup-gem">
                    <img src={`resources/images/${imgPath}`} height="40px" />
                    <span>
                      {idx <= 2 ? sessionState.session.utility.goals[idx] : "?"}
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
