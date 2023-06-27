import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { LINGER_ON_GOAL_MS } from "../constants";

export const EmojiBubble = ({ pos }) => {
  const [agentEmoji, updateAgentEmoji] = useStore((state) => [
    state.gameState.agentEmoji,
    state.updateAgentEmoji,
  ]);

  useEffect(() => {
    if (agentEmoji) {
      setTimeout(() => {
        updateAgentEmoji("");
      }, LINGER_ON_GOAL_MS);
    }
  }, [agentEmoji]);

  return (
    agentEmoji && (
      <div
        className="emoji-bubble"
        style={{
          left: pos.left,
          top: pos.top,
        }}
      >
        <FontAwesomeIcon icon={faComment} />
        <div className="emoji-bubble-emoji">{agentEmoji}</div>
      </div>
    )
  );
};
