import React, { useEffect } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

import * as utils from "../utils";

const ScorePopup = () => {
  const expState = useStore((state) => state.expState);
  const gameState = useStore((state) => state.gameState);
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);

  const showPopup = () => {
    setUiState({ ...uiState, showScorePopup: true });
  };

  const closePopup = () => {
    setUiState({ ...uiState, showScorePopup: false });
  };

  useEffect(() => {
    const phase = utils.currentPhase(expState);
    if (
      phase &&
      expState.phaseIdx === 0 &&
      gameState.playing &&
      gameState.rewardHistory.length > 0
    ) {
      showPopup();

      // dismiss the score popup after 2 seconds
      setTimeout(closePopup, 1000);
    }
  }, [gameState.rewardHistory.length]);

  const reward = () => {
    if (gameState.rewardHistory.length === 0) {
      return 0;
    }
    return gameState.rewardHistory[gameState.rewardHistory.length - 1];
  };

  const item = () => {
    if (gameState.itemHistory.length === 0) {
      return "";
    }
    return gameState.itemHistory[gameState.itemHistory.length - 1];
  };

  const _reward = reward();
  const _item = item();

  return (
    <Modal
      key="score-popup"
      className="score-popup"
      open={uiState.showScorePopup}
      scoreHidden={uiState.scoreHidden}
    >
      <div className="score-popup-score high">
        <img src={`resources/images/custom/items/${_item}.png`} width={50} />={" "}
        {_reward} points
      </div>
      <motion.button
        onClick={() => setUiState({ ...uiState, showScorePopup: false })}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        Okay
      </motion.button>
    </Modal>
  );
};

export default ScorePopup;
