import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Modal } from "./Modal";

export const MultiScreenModal = ({ content, visible, key, onFinish }) => {
  const stageKeys = Object.keys(content);

  const [stageIdx, setStageIdx] = useState(0);
  const [screenIdx, setScreenIdx] = useState(0);
  const [currScreen, setCurrScreen] = useState(
    content[stageKeys[stageIdx]][screenIdx]
  );

  useEffect(() => {
    setCurrScreen(content[stageKeys[stageIdx]][screenIdx]);
  }, [stageIdx, screenIdx, content]);

  const onNextClicked = () => {
    // three cases:
    // 1. we're on the last screen of the last stage - trigger the onFinish callback
    // 2. we're on the last screen of a stage - move to the next stage
    // 3. we're on any other screen - move to the next screen
    const isFinalStage = stageIdx === stageKeys.length - 1;
    const isFinalScreen = screenIdx === content[stageKeys[stageIdx]].length - 1;

    if (isFinalStage && isFinalScreen) {
      onFinish();
    } else if (isFinalScreen) {
      setStageIdx((curr) => curr + 1);
      setScreenIdx(0);
    } else {
      setScreenIdx((curr) => curr + 1);
    }
  };

  const onBackClicked = () => {
    if (screenIdx === 0) {
      setStageIdx((curr) => curr - 1);
      setScreenIdx(content[stageKeys[stageIdx - 1]].length - 1);
    } else {
      setScreenIdx((curr) => curr - 1);
    }
  };

  return (
    <Modal key={key} className="instruction-modal" open={visible}>
      <div className="instruction-modal-title">{stageKeys[stageIdx]}</div>
      <div className="instruction-modal-body">
        <div className="instruction-modal-text">{currScreen.content}</div>
        <div className="instruction-modal-button-row">
          {stageIdx + screenIdx > 0 ? (
            <motion.button
              className="instruction-modal-button back"
              onClick={onBackClicked}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              Back
            </motion.button>
          ) : (
            <div />
          )}
          <motion.button
            className={`instruction-modal-button ${
              currScreen.buttonLabel === "Next" ? "next" : "start"
            }`}
            onClick={onNextClicked}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {currScreen.buttonLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
