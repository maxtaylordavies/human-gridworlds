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
      setTimeout(() => setOpen(false), duration - (delay + 200));
    }, delay);
  };

  const iconBox = (caption, imgPaths, space) => (
    <div>
      <span>{caption}</span>
      <div className="level-popup-icon-container">
        {imgPaths.map((imgPath) => (
          <img
            src={`resources/images/${imgPath}`}
            height="40px"
            style={{ marginRight: space }}
          />
        ))}
      </div>
    </div>
  );

  return (
    ready &&
    levelIdx !== -1 && (
      <Modal open={open} className="level-popup">
        <div className="level-popup-title">Level {lvl + 1}</div>
        {iconBox(
          "Aliens",
          session.agentIds
            .filter((agent, idx) => paths[idx] !== "")
            .map((agent) => session.agentAvatars[agent]),
          10
        )}
        {iconBox(
          "Items",
          goalImages.filter((gi) =>
            gdy.Environment.Levels[session.levels[levelIdx]].includes(
              gi.replace(".png", "").slice(-1)
            )
          ),
          0
        )}
      </Modal>
    )
  );
};

export default LevelPopup;
