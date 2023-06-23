import React, { useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

const PROLIFIC_CODE = "CAL3DWSD";

const ExperimentCompleteModal = () => {
  const show = useStore((state) => state.uiState.showFinishedScreen);
  const score = useStore((state) => state.score);
  const saveTextResponse = useStore((state) => state.saveTextResponse);

  const [screenIdx, setScreenIdx] = useState(0);
  const [response, setResponse] = useState("");

  const onSubmitClicked = () => {
    saveTextResponse(response);
    setScreenIdx(1);
  };

  const onCopyCodeClicked = async () => {
    await navigator.clipboard.writeText(PROLIFIC_CODE);
  };

  const content = [
    {
      title: "Free text response",
      content: (
        <>
          <p>
            <b>
              Please write a brief response (minimum 100 characters) to the
              following question: how did you choose which of the mystery boxes
              to collect in phase 3 and phase 5?
            </b>{" "}
          </p>
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
