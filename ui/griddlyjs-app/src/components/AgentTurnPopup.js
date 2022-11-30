import React, { useEffect, useState } from "react";

import { Modal } from "./Modal";
import { INTER_AGENT_INTERVAL_MS } from "../constants";

const AgentTurnPopup = ({ agentImage, ready }) => {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (agentImage !== image && ready) {
      update();
    }
  }, [agentImage, ready]);

  useEffect(() => {
    console.log(`open changed to ${open}`);
  }, [open]);

  const update = () => {
    setTimeout(() => {
      setImage(agentImage);
      setOpen(true);
      setTimeout(() => setOpen(false), INTER_AGENT_INTERVAL_MS - 350);
    }, 250);
  };

  return (
    <Modal open={open} className="agent-turn-popup">
      {image ? (
        <span>
          <img src={`resources/images/${image}`} width="50px" />
          's turn
        </span>
      ) : (
        "Your turn!"
      )}
    </Modal>
  );
};

export default AgentTurnPopup;
