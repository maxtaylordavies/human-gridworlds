import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const InstructionModal = ({ visible, onStartClicked, session, gdy }) => {
  const [objectImages, setObjectImages] = useState(null);

  useEffect(() => {
    let tmp = gdy.Objects.filter((obj) => obj.Name !== "player").map((obj) => ({
      name: obj.Name,
      path: obj.Observers.Sprite2D[0].Image,
    }));
    setObjectImages({
      terrains: tmp.filter((x) => !x.name.includes("goal")).map((x) => x.path),
      goals: tmp.filter((x) => x.name.includes("goal")).map((x) => x.path),
    });
  }, [gdy]);

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
              <p>
                Each level contains one or more goal items. you complete the
                level by collecting any one item, but different items have
                different values:
              </p>
              <div className="instruction-modal-score-key">
                {session &&
                  objectImages &&
                  session.utility.goals.map((r, i) => (
                    <div>
                      <img src={`resources/images/${objectImages.goals[i]}`} />{" "}
                      = {r}
                    </div>
                  ))}
              </div>
              <p>
                You may lose points from moving over different types of terrain.
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
