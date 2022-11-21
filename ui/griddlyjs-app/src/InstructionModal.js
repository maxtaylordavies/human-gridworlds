import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const InstructionModal = ({ visible, onStartClicked }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="instruction-modal"
          className="instruction-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="instruction-modal-title">Instructions</div>
          <div className="instruction-modal-body">
            <div className="instruction-modal-text">
              <p>
                Welcome! This experiment involves playing a simple game, with
                multiple levels.
              </p>
              <p>
                For each level, you will first watch some recordings of other
                players - you will then play the level yourself.
              </p>
              <p>
                You move around using the keys <_kbd>w</_kbd> <_kbd>a</_kbd>{" "}
                <_kbd>s</_kbd> <_kbd>d</_kbd>. There are no other controls.
              </p>
            </div>
            <motion.button
              className="instruction-modal-start-button"
              onClick={onStartClicked}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              Start experiment
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const _kbd = ({ children }) => {
  return <div className="keyboard-key">{children}</div>;
};

export default InstructionModal;
