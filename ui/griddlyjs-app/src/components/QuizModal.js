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
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const [gameState, setGameState] = useStore((state) => [
    state.gameState,
    state.setGameState,
  ]);
  const saveQuizResponse = useStore((state) => state.saveQuizResponse);

  const [name, setName] = useState("");
  const [expected, setExpected] = useState([-1, -1]);
  const [selected, setSelected] = useState([-1, -1]);
  const [showIfCorrect, setShowIfCorrect] = useState(false);
  const [result, setResult] = useState("waiting");

  useEffect(() => {
    if (expState.session) {
      setName(utils.currentAgentName(expState));
    }
  }, [expState]);

  useEffect(() => {
    if (expState.session) {
      const expctd = [];
      const theta = utils.currentTheta(expState);
      for (let i = 0; i < 2; i++) {
        if (theta[i][0] > theta[i][1]) {
          expctd.push(0);
        } else if (theta[i][0] < theta[i][1]) {
          expctd.push(1);
        } else {
          expctd.push(2);
        }
      }
      setExpected(expctd);
    }
  }, [expState]);

  const clear = () => {
    setSelected([-1, -1]);
    setResult("waiting");
    setShowIfCorrect(false);
  };

  const correct = () => {
    if (selected[0] === -1 || selected[1] === -1) {
      return false;
    }
    return selected.every((s, i) => s === expected[i]);
  };

  const handleCorrectSubmission = () => {
    // dismiss quiz
    setUiState({ ...uiState, showQuiz: false });

    // proceed to next phase or agent
    if (expState.phaseIdx === 0) {
      setExpState({ ...expState, phaseIdx: 1 });
    } else {
      setExpState({ ...expState, agentIdx: expState.agentIdx + 1 });
    }

    // reset local state
    setTimeout(() => {
      clear();
    }, 1000);
  };

  const handleIncorrectSubmission = () => {
    // dismiss quiz
    setUiState({ ...uiState, showQuiz: false });

    // return to first level for current phase or first replay for current agent
    setExpState(
      name === "you"
        ? { ...expState, levelIdx: 0 }
        : { ...expState, replayIdx: 0 },
    );

    // clear last 8 items from history arrays, maybe reset score to 0
    setGameState({
      ...gameState,
      rewardHistory: gameState.rewardHistory.slice(0, -8),
      itemHistory: gameState.itemHistory.slice(0, -8),
      agentHistory: gameState.agentHistory.slice(0, -8),
      score: name === "you" ? 0 : gameState.score,
    });

    // reset local state
    setTimeout(() => {
      clear();
    }, 1000);
  };

  const onClick = () => {
    if (result === "waiting") {
      setShowIfCorrect(true);
    }

    const handle = () => {
      if (result === "waiting") {
        saveQuizResponse(name, selected);
        setResult(correct() ? "correct" : "incorrect");
      } else if (result === "correct") {
        handleCorrectSubmission();
      } else {
        handleIncorrectSubmission();
      }
    };

    setTimeout(handle, 1000);
  };

  const quizContent = () => {
    return (
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
    );
  };

  const resultsContent = () => {
    return (
      <div className="quiz-modal-body">
        <div className="quiz-modal-text">
          {result === "correct"
            ? "Well done. Click the button below to continue."
            : `That's not quite right. Click the button below to repeat the ${
                name === "you" ? "phase" : "character"
              } and then try the quiz again.`}
        </div>
      </div>
    );
  };

  const disabled = result === "waiting" && selected.includes(-1);

  let buttonText = "Submit";
  let buttonWidth = 150;

  if (result === "correct") {
    buttonText = "Proceed";
  } else if (result === "incorrect") {
    buttonText = `Repeat ${name === "you" ? "phase" : "character"}`;
    buttonWidth = 200;
  }

  return (
    <Modal
      open={uiState.showQuiz && !uiState.showScorePopup}
      className="quiz-modal"
    >
      <div className="quiz-modal-title">
        {result === "correct"
          ? "Correct! 🎉"
          : result === "incorrect"
            ? "Incorrect 😥"
            : `Quiz: ${name}`}
      </div>
      {result === "waiting" ? quizContent() : resultsContent()}
      <div className="quiz-modal-button-row">
        <motion.button
          onClick={onClick}
          className="quiz-modal-button"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.96 }}
          transition={{ duration: 0.2 }}
          style={{ opacity: disabled ? 0.4 : 1, width: buttonWidth }}
        >
          {buttonText}
        </motion.button>
      </div>
    </Modal>
  );
};

export default QuizModal;
