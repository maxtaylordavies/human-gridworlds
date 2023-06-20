import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { useStore } from "../store";
import { Modal } from "./core/Modal";
import * as utils from "../utils";

const AgentPopup = ({ delay }) => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const expState = useStore((state) => state.expState);

  const [show, setShow] = useState(uiState.showAgentPopup);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (uiState.showAgentPopup) {
      setReady(false);
      setTimeout(() => {
        setShow(true);
      }, delay);
    } else {
      setShow(false);
    }
  }, [uiState, expState]);

  //   const isReady = () => {
  //     return !(
  //       uiState.showInitialInstructions ||
  //       uiState.showFinishedScreen ||
  //       expState.agentIdx >=
  //         expState.session.phases[expState.phaseIdx].levels.length
  //     );
  //   };

  const onProceedClicked = () => {
    setUIState({ ...uiState, showAgentPopup: false });
  };

  return (
    <Modal open={show} className="agent-popup">
      <div className="agent-popup-title">New character</div>
      <div className="agent-popup-agent">
        <img
          src={`resources/images/${utils.currentAvatarImg(expState)}`}
          className="agent-popup-image"
          width={150}
        />
        <div className="agent-popup-name">{utils.getAgentName(expState)}</div>
      </div>
      <div className="agent-popup-button-row">
        <motion.button
          onClick={onProceedClicked}
          className="agent-popup-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.1 }}
          style={{ pointerEvents: ready ? "auto" : "none" }}
        >
          Proceed
          {ready ? (
            <FontAwesomeIcon icon={faPlay} className="agent-popup-play-icon" />
          ) : (
            <div className="agent-popup-countdown">
              <CountdownCircleTimer
                isPlaying
                duration={3}
                colors={"white"}
                size={22}
                strokeWidth={3}
                trailColor={"#00916E"}
                onComplete={() => {
                  setReady(true);
                  return [true, 0];
                }}
              />
            </div>
          )}
        </motion.button>
      </div>
    </Modal>
  );
};

export default AgentPopup;
