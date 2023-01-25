import React, { useEffect, useState } from "react";

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
      setTimeout(() => {
        setOpen(false);
        onProceed();
      }, duration);
    }, delay);
  };

  return (
    ready &&
    open &&
    levelIdx !== -1 && (
      <Modal open={open} className="level-popup">
        <div className="level-popup-title">Level {lvl + 1}</div>
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
      </Modal>
    )
  );
};

export default LevelPopup;
