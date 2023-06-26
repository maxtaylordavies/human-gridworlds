import React, { useEffect, useState } from "react";
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

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (gameState.playing && gameState.rewardHistory.length > 0) {
      setUiState({ ...uiState, showScorePopup: true });
    }
  }, [gameState.rewardHistory.length]);

  useEffect(() => {
    const phase = utils.currentPhase(expState);
    setShow(uiState.showScorePopup && phase && !phase.objectsHidden);
  }, [uiState.showScorePopup, expState]);

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
      open={show}
      scoreHidden={uiState.scoreHidden}
    >
      <div className={`score-popup-score ${_reward > 10 ? "high" : "medium"}`}>
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
