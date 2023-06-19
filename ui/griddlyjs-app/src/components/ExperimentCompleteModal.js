import React, { useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

const PROLIFIC_CODE = "CAL3DWSD";

const ExperimentCompleteModal = ({ submitResponse }) => {
  const show = useStore((state) => state.uiState.showFinishedScreen);
  const session = useStore((state) => state.expState.session);
  const score = useStore((state) => state.score);

  const [screenIdx, setScreenIdx] = useState(0);
  const [response, setResponse] = useState("");

  const onSubmitClicked = () => {
    submitResponse(response);
    setScreenIdx(1);
  };

  const onCopyCodeClicked = async () => {
    await navigator.clipboard.writeText(PROLIFIC_CODE);
  };

  const questions =
    2 === 2
      ? [
          "In the early levels (1-2), did you learn anything about the red and blue aliens from watching them?",
          "In the dark levels (3-4), how did you decide which way to go?",
          "In the last two levels (5-6) where the gems were unknown, how did you decide which one to collect?",
        ]
      : [
          "In the early levels (1-2), did you learn anything about the red and blue aliens from watching them?",
          "What about the yellow and pink aliens in levels 3-4?",
          "In the last two levels (5-6), how did you decide which gem to collect?",
        ];

  const content = [
    {
      title: "Free text response",
      content: (
        <>
          <p>
            <b>
              Please write a brief description (minimum 100 characters) of how
              you decided what actions to take in the game. Consider the
              following questions:
            </b>{" "}
          </p>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <textarea rows="5" onChange={(e) => setResponse(e.target.value)} />
        </>
      ),
      buttonLabel: "Submit",
      buttonDisabled: () => response.length < 100,
      onClick: onSubmitClicked,
    },
    {
      title: "Experiment complete",
      content: (
        <>
          <p>
            Thanks for participating! Your final score was {score}. Your
            completion code for Prolific is <b>{PROLIFIC_CODE}</b>
          </p>
        </>
      ),
      buttonLabel: "Copy code",
      buttonDisabled: () => false,
      onClick: onCopyCodeClicked,
    },
  ];

  const disabled = content[screenIdx].buttonDisabled();

  return (
    <Modal
      open={show}
      className="experiment-complete-modal"
      key="experiment-complete-modal"
    >
      <div className="experiment-complete-modal-title">
        {content[screenIdx].title}
      </div>
      <div className="experiment-complete-modal-body">
        <div className="experiment-complete-modal-text">
          {content[screenIdx].content}
        </div>
        <div className="experiment-complete-modal-button-row">
          <motion.button
            className="experiment-complete-modal-button"
            onClick={content[screenIdx].onClick}
            whileHover={{ scale: disabled ? 1 : 1.04 }}
            whileTap={{ scale: disabled ? 1 : 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: disabled ? 0.4 : 1 }}
            disabled={disabled}
          >
            {content[screenIdx].buttonLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ExperimentCompleteModal;
