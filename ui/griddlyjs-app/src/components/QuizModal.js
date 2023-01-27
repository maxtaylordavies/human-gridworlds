import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Modal } from "./Modal";

const QuizModal = ({ session, goalImages, visible, onFinished }) => {
  const [expected, setExpected] = useState([-1, -1]);
  const [selected, setSelected] = useState([-1, -1]);
  const [showIfCorrect, setShowIfCorrect] = useState(false);

  useEffect(() => {
    console.log(session.agentIds.slice(0, 2));
    if (session) {
      setExpected([
        session.agentIds.indexOf("a-0001"),
        session.agentIds.indexOf("a-0002"),
      ]);
    }
  }, [session]);

  const disabled = selected.includes(-1);

  const checkAnswers = () => {
    setShowIfCorrect(true);
    setTimeout(() => {
      setShowIfCorrect(false);
      setSelected([-1, -1]);
      if (selected.every((s, i) => s === expected[i])) {
        onFinished();
      }
    }, 1000);
  };

  return (
    <Modal open={visible} className="quiz-modal">
      <div className="quiz-modal-title">Quiz</div>
      <div className="quiz-modal-body">
        <div className="quiz-modal-text">
          Select the gem collected by each alien in the practice level
        </div>
        {session.agentIds.slice(0, 2).map((agent, aIdx) => (
          <div className="quiz-modal-option-row">
            <img
              src={`resources/images/${session.agentAvatars[agent]}`}
              className="quiz-modal-agent-image"
              height="50px"
            />
            {goalImages.slice(0, 3).map((goal, gIdx) => {
              let modifier = "";
              if (selected[aIdx] === gIdx) {
                modifier = showIfCorrect
                  ? expected[aIdx] === gIdx
                    ? " correct"
                    : " incorrect"
                  : " selected";
              }
              return (
                <div
                  onClick={() => {
                    const newSelected = [...selected];
                    newSelected[aIdx] = gIdx;
                    setSelected(newSelected);
                  }}
                  className={`quiz-modal-gem-option${modifier}`}
                >
                  <img src={`resources/images/${goal}`} height="40px" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="quiz-modal-button-row">
        <motion.button
          onClick={checkAnswers}
          className="quiz-modal-button"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.96 }}
          transition={{ duration: 0.2 }}
          style={{ opacity: disabled ? 0.4 : 1 }}
        >
          Submit
        </motion.button>
      </div>
    </Modal>
  );
};

export default QuizModal;
