import React, { useEffect, useState } from "react";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { Modal } from "./core/Modal";
import { DelayButton } from "./core/DelayButton";
import { AgentIcon } from "./Avatar";
import * as utils from "../utils";

const AgentPopup = ({ delay }) => {
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);
  const expState = useStore((state) => state.expState);

  const [show, setShow] = useState(uiState.showAgentPopup);
  const [name, setName] = useState("");
  const [phi, setPhi] = useState(null);
  const [agentsShown, setAgentsShown] = useState([]);

  useEffect(() => {
    if (uiState.showAgentPopup) {
      const _name = utils.currentAgentName(expState);
      if (!agentsShown.includes(_name)) {
        const _phi = utils.currentPhi(expState);
        setName(_name);
        setPhi(_phi);
        setTimeout(() => {
          setShow(true);
        }, delay);
      } else {
        setUiState({ ...uiState, showAgentPopup: false });
      }
    } else if (show) {
      setShow(false);
      if (name !== "") {
        setAgentsShown([...agentsShown, name]);
      }
    }
  }, [uiState, expState]);

  const onProceedClicked = () => {
    setUiState({ ...uiState, showAgentPopup: false });
  };

  return (
    <Modal open={show} className="agent-popup">
      {!agentsShown.includes(name) && (
        <div className="agent-popup-title">New character</div>
      )}
      <div className="agent-popup-agent">
        <AgentIcon phi={phi} size="large" />
        {/* <img
          src={`resources/images/${avatar}`}
          className="agent-popup-image"
          width={150}
        /> */}
        <div className="agent-popup-name">{name}</div>
      </div>
      <div className="agent-popup-button-row">
        <DelayButton
          delay={2}
          onClick={onProceedClicked}
          icon={faPlay}
          spinnerSize={16}
          spinnerWidth={2.5}
          className="agent-popup-button"
        >
          Watch
        </DelayButton>
      </div>
    </Modal>
  );
};

export default AgentPopup;
