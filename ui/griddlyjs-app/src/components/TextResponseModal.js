import React, { useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

const TextResponseModal = () => {
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);
  const saveTextResponse = useStore((state) => state.saveTextResponse);

  const [response, setResponse] = useState("");

  const onSubmitClicked = () => {
    saveTextResponse(response);
    setUiState({ ...uiState, showTextResponseModal: false });
    setResponse("");
  };

  const disabled = response.length < 80;

  return (
    <Modal
      open={uiState.showTextResponseModal}
      className="experiment-complete-modal"
      key="text-response-modal"
    >
      <div className="experiment-complete-modal-title">Text response</div>
      <div className="experiment-complete-modal-body">
        <div className="experiment-complete-modal-text">
          <p>
            <b>
              Please write a brief response (minimum 80 characters) to the
              following question: how did you choose which of the mystery boxes
              to collect in the phase you just played through?
            </b>{" "}
          </p>
          <textarea rows="5" onChange={(e) => setResponse(e.target.value)} />
        </div>
        <div className="experiment-complete-modal-button-row">
          <div />
          <motion.button
            className="experiment-complete-modal-button start"
            onClick={onSubmitClicked}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.04 }}
            whileTap={{ scale: disabled ? 1 : 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: disabled ? 0.4 : 1 }}
          >
            Submit
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default TextResponseModal;
