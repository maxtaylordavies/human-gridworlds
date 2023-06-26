import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";
import * as utils from "../utils";

const QuizModal = () => {
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);
  const expState = useStore((state) => state.expState);
  const saveQuizResponse = useStore((state) => state.saveQuizResponse);

  const [name, setName] = useState("");
  const [expected, setExpected] = useState([-1, -1]);
  const [selected, setSelected] = useState([-1, -1]);
  const [showIfCorrect, setShowIfCorrect] = useState(false);

  useEffect(() => {
    if (expState.session) {
      setName(utils.currentAgentName(expState));
    }
  }, [expState]);

  useEffect(() => {
    if (expState.session) {
      const expctd = [];
      const thetas = expState.session.conditions.thetas;
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
  }, [expState.session]);

  const disabled = selected.includes(-1);

  const onSubmitClicked = () => {
    saveQuizResponse(name, selected);

    const checkAnswers = name === "you";
    setShowIfCorrect(checkAnswers);
    setTimeout(() => {
      if (!checkAnswers || selected.every((s, i) => s === expected[i])) {
        setUiState({ ...uiState, showQuiz: false });
      }
      setSelected([-1, -1]);
      setShowIfCorrect(false);
    }, 500);
  };

  return (
    <Modal
      open={uiState.showQuiz && !uiState.showScorePopup}
      className="quiz-modal"
    >
      <div className="quiz-modal-title">Quiz: {name}</div>
      <div className="quiz-modal-body">
        <div className="quiz-modal-text">
          1. Which item do you think would give <b>{name}</b> more points? If
          you think they're equal, select the = option.
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
                    src={`resources/images/custom/quiz/quiz-${color}.png`}
                    width="50px"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="quiz-modal-text">
          2. Which item do you think would give <b>{name}</b> more points? If
          you think they're equal, select the = option.
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
                    src={`resources/images/custom/quiz/quiz-${shape}.png`}
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
          onClick={onSubmitClicked}
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
