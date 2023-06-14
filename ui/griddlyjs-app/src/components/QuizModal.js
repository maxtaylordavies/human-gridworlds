import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

const QuizModal = () => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const session = useStore((state) => state.expState.session);

  const [expected, setExpected] = useState([-1, -1]);
  const [selected, setSelected] = useState([-1, -1]);
  const [showIfCorrect, setShowIfCorrect] = useState(false);

  useEffect(() => {
    if (session) {
      const expctd = [];
      const thetas = session.conditions.thetas;
      for (let i = 0; i < 2; i++) {
        if (thetas[i][0] > thetas[i][1]) {
          expctd.push(0);
        } else if (thetas[i][0] < thetas[i][1]) {
          expctd.push(1);
        } else {
          expctd.push(2);
        }
      }
      setExpected(expctd);
    }
  }, [session]);

  useEffect(() => {
    console.log("expected", expected);
  }, [expected]);

  const disabled = selected.includes(-1);

  const checkAnswers = () => {
    setShowIfCorrect(true);
    setTimeout(() => {
      setShowIfCorrect(false);
      setSelected([-1, -1]);
      if (selected.every((s, i) => s === expected[i])) {
        setUIState({ ...uiState, showQuiz: false });
      }
    }, 1000);
  };

  return (
    <Modal open={uiState.showQuiz} className="quiz-modal">
      <div className="quiz-modal-title">Quiz</div>
      <div className="quiz-modal-body">
        <div className="quiz-modal-text">
          1. select which <b>colour</b> gives you more points
        </div>
        <div className="quiz-modal-option-row">
          {["yellow", "green", "equal"].map((color, idx) => {
            let modifier = "";
            if (selected[0] === idx) {
              modifier = showIfCorrect
                ? expected[0] === idx
                  ? " correct"
                  : " incorrect"
                : " selected";
            }
            return (
              <div
                onClick={() => {
                  const newSelected = [...selected];
                  newSelected[0] = idx;
                  setSelected(newSelected);
                }}
                className={`quiz-modal-option${modifier}`}
              >
                {color === "equal" ? (
                  <div className="quiz-modal-equal">=</div>
                ) : (
                  <img
                    src={`resources/images/custom/quiz-${color}.png`}
                    width="50px"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="quiz-modal-text">
          2. select which <b>shape</b> gives you more points
        </div>
        <div className="quiz-modal-option-row">
          {["circle", "triangle", "equal"].map((shape, idx) => {
            let modifier = "";
            if (selected[1] === idx) {
              modifier = showIfCorrect
                ? expected[1] === idx
                  ? " correct"
                  : " incorrect"
                : " selected";
            }
            return (
              <div
                onClick={() => {
                  const newSelected = [...selected];
                  newSelected[1] = idx;
                  setSelected(newSelected);
                }}
                className={`quiz-modal-option${modifier}`}
              >
                {shape === "equal" ? (
                  <div className="quiz-modal-equal">=</div>
                ) : (
                  <img
                    src={`resources/images/custom/quiz-${shape}.png`}
                    width="50px"
                  />
                )}
              </div>
            );
          })}
        </div>
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
