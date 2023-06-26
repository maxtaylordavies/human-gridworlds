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
  const [prevScore, setPrevScore] = useState(gameState.score);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const delta = gameState.score - prevScore;
    setDelta(delta);
    setPrevScore(gameState.score);

    if (delta > 0) {
      setUiState({ ...uiState, showScorePopup: true });
    }
  }, [gameState.score]);

  useEffect(() => {
    if (!uiState.showScorePopup) {
      setDelta(0);
    }

    const phase = utils.currentPhase(expState);
    setShow(uiState.showScorePopup && phase && !phase.objectsHidden);
  }, [uiState.showScorePopup, expState]);

  return (
    <Modal
      key="score-popup"
      className="score-popup"
      open={show}
      scoreHidden={uiState.scoreHidden}
    >
      <div className={`score-popup-score ${delta > 10 ? "high" : "medium"}`}>
        <img
          src={`resources/images/custom/items/${gameState.lastGoalReached}.png`}
          width={50}
        />
        = {delta} points
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
