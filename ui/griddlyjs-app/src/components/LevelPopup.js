import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Modal } from "./Modal";

const LevelPopup = ({
  session,
  gdy,
  goalImages,
  paths,
  levelIdx,
  ready,
  delay,
  duration,
  onProceed,
}) => {
  const [open, setOpen] = useState(false);
  const [lvl, setLvl] = useState(-1);

  useEffect(() => {
    if (levelIdx !== lvl && ready) {
      update();
    }
  }, [levelIdx, ready]);

  const update = () => {
    setTimeout(() => {
      setLvl(levelIdx);
      setOpen(true);
      // setTimeout(() => {
      //   setOpen(false);
      //   onProceed();
      // }, duration);
    }, delay);
  };

  const onProceedClicked = () => {
    setOpen(false);
    onProceed();
  };

  return (
    ready &&
    open &&
    levelIdx !== -1 && (
      <Modal open={open} className="level-popup">
        <div className="level-popup-title">
          {lvl === 0 ? "Practice level" : `Level ${lvl}`}
        </div>
        <div>
          <span>Aliens</span>
          <div className="level-popup-icon-container">
            {session.agentIds
              .filter((agent, idx) => paths[idx] !== "")
              .map((agent) => session.agentAvatars[agent])
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
                gdy.Environment.Levels[session.levels[levelIdx]].includes(
                  gi.replace(".png", "").slice(-1)
                )
              )
              .map((imgPath) => {
                let idx = goalImages.indexOf(imgPath);
                return (
                  <div className="level-popup-gem">
                    <img src={`resources/images/${imgPath}`} height="40px" />
                    <span>{idx <= 2 ? session.utility.goals[idx] : "?"}</span>
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
