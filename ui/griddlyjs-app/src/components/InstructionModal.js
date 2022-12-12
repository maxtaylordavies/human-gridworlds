import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Modal } from "./Modal";

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
    <Modal key="instruction-modal" className="instruction-modal" open={visible}>
      <div className="instruction-modal-title">Instructions</div>
      <div className="instruction-modal-body">
        <div className="instruction-modal-text">
          <p>
            Welcome! This experiment involves playing a simple game, with
            multiple levels.
          </p>
          <img
            src="resources/images/sprite2d/player.png"
            height="40px"
            style={{ marginBottom: "1rem" }}
          />
          <p>
            You control a human avatar, which you can move around using the{" "}
            <b>arrow keys</b> on your keyboard.
            <b>
              To complete each level, you need to collect one of the coloured
              jewels.
            </b>{" "}
            Collecting any jewel will complete the level, but each jewel is
            worth a different number of points.
          </p>
          <div className="instruction-modal-score-key">
            {session &&
              objectImages &&
              session.utility.goals.map((r, i) => (
                <div className="instruction-modal-score-key-item">
                  <img
                    src={`resources/images/${objectImages.goals[i]}`}
                    height="40px"
                  />
                  <span>{i <= 2 ? r : "?"}</span>
                </div>
              ))}
          </div>
          <p>
            There are two other characters in the game. At each level, they will
            take turns to complete it - you should watch what they do, and then
            complete the level yourself.{" "}
          </p>
          <div className="instruction-modal-character-key">
            {session &&
              session.agentIds.map((id) => (
                <img
                  src={`resources/images/${session.agentAvatars[id]}`}
                  height="40px"
                  style={{ marginRight: 10 }}
                />
              ))}
          </div>
          <p>
            These characters may not get the same number of points from each
            jewel as you. They can also see in the dark, whereas you can't
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
    </Modal>
  );
};

const _kbd = ({ children }) => {
  return <div className="keyboard-key">{children}</div>;
};

export default InstructionModal;
