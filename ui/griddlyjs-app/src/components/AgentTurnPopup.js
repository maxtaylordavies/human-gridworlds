import React, { useEffect, useState } from "react";

import { Modal } from "./Modal";

const AgentTurnPopup = ({ agentImage, ready, delay, duration }) => {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (agentImage !== image && ready) {
      update();
    }
  }, [agentImage, ready]);

  const update = () => {
    setTimeout(() => {
      setImage(agentImage);
      setOpen(true);
      setTimeout(() => setOpen(false), duration - (delay + 200));
    }, delay);
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
