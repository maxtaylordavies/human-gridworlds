import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Modal } from "./Modal";

const InstructionModal = ({ visible, onStartClicked, session, gdy }) => {
  const [objectImages, setObjectImages] = useState(null);
  const [screenIdx, setScreenIdx] = useState(0);

  const content = [
    <>
      <p>Welcome! This experiment involves playing a simple game.</p>
      <img
        src="resources/images/sprite2d/player.png"
        height="60px"
        style={{ marginBottom: "1rem" }}
      />
      <p>
        You control a human avatar, which you can move around using the{" "}
        <b>arrow keys</b> on your keyboard.
      </p>
    </>,
    <>
      <p>
        <b>
          To complete each level, you need to collect one of the coloured
          jewels.
        </b>{" "}
      </p>
      <p>
        Collecting any jewel will complete the level, but each jewel will earn
        you a different number of points. The points value of each jewel will
        not change between levels.
      </p>
      <div className="instruction-modal-score-key">
        {session &&
          objectImages &&
          session.utility.goals.map((r, i) => (
            <div className="instruction-modal-score-key-item">
              <img
                src={`resources/images/${objectImages.goals[i]}`}
                height="80px"
              />
              <span>{i <= 2 ? r : "?"}</span>
            </div>
          ))}
      </div>
    </>,
    <>
      <p>
        As well as your human character, there are two aliens in the game. At
        each level, they will take turns to complete it. You should watch what
        they do, and then complete the level yourself, trying to score as many
        points as possible.{" "}
      </p>
      <div className="instruction-modal-character-key">
        {session &&
          session.agentIds.map((id) => (
            <img
              src={`resources/images/${session.agentAvatars[id]}`}
              height="60px"
              style={{ marginRight: 10 }}
            />
          ))}
      </div>
      <p>
        Each alien has different preferences for the jewels in the game - the
        best jewel for an alien to get <b>may or may not</b> also be the best
        for you, so be careful!
      </p>
      <p>
        Some levels may be partly hidden by darkness.{" "}
        <b>The aliens can both see through this darkness</b> with their special
        alien eyesight, but you as a human cannot.{" "}
      </p>
    </>,
  ];

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

  const onButtonClicked = () => {
    if (screenIdx === content.length - 1) {
      onStartClicked();
    } else {
      setScreenIdx((curr) => curr + 1);
    }
  };

  return (
    <Modal key="instruction-modal" className="instruction-modal" open={visible}>
      <div className="instruction-modal-title">Instructions</div>
      <div className="instruction-modal-body">
        <div className="instruction-modal-text">{content[screenIdx]}</div>
        <div className="instruction-modal-button-row">
          {screenIdx > 0 ? (
            <motion.button
              className="instruction-modal-button back"
              onClick={() => setScreenIdx((curr) => curr - 1)}
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
              screenIdx === content.length - 1 ? "start" : "next"
            }`}
            onClick={onButtonClicked}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {screenIdx === content.length - 1 ? "Start experiment" : "Next"}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

const _kbd = ({ children }) => {
  return <div className="keyboard-key">{children}</div>;
};

export default InstructionModal;
