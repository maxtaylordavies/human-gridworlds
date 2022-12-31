import React, { useState } from "react";
import { motion } from "framer-motion";

import { Modal } from "./Modal";

const ExperimentCompleteModal = ({ visible, score, submitResponse }) => {
  const [screenIdx, setScreenIdx] = useState(0);
  const [response, setResponse] = useState("");

  const determineProlificCode = () => {
    if (score < 250) {
      return "CAL3DWSD";
    }
    if (score < 300) {
      return "CNER7Y6B";
    }
    return "CMNUR18D";
  };

  const onSubmitClicked = () => {
    submitResponse(response);
    setScreenIdx(1);
  };

  const onCopyCodeClicked = async () => {
    await navigator.clipboard.writeText(determineProlificCode());
  };

  const content = [
    {
      title: "Free text response",
      content: (
        <>
          <p>
            <b>
              Please write a brief description of how you decided what actions
              to take in the game.
            </b>{" "}
          </p>
          <p>
            If you copied either of the aliens, how did you decide which to
            copy? If you didn't copy, why not?
          </p>
          <p>minimum length 50 characters</p>
          <textarea rows="5" onChange={(e) => setResponse(e.target.value)} />
        </>
      ),
      buttonLabel: "Submit",
      buttonDisabled: () => response.length < 50,
      onClick: onSubmitClicked,
    },
    {
      title: "Experiment complete",
      content: (
        <>
          <p>
            Thanks for participating! Your final score was {score}. Your
            completion code for Prolific is <b>{determineProlificCode()}</b>
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
      open={visible}
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
