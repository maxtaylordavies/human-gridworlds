import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";

const RewardHistory = () => {
  const gameState = useStore((state) => state.gameState);
  const uiState = useStore((state) => state.uiState);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const h = [];
    for (let i = gameState.rewardHistory.length - 1; i >= 0; i--) {
      h.push({
        reward: gameState.rewardHistory[i],
        item: gameState.itemHistory[i],
        agent: gameState.agentHistory[i],
      });
    }
    setHistory(h);
  }, [gameState]);

  let opacity = 1;
  if (
    uiState.showInitialInstructions ||
    uiState.showPhaseInstructions ||
    uiState.showFinishedScreen
  ) {
    opacity = 0;
  } else if (
    uiState.showAgentPopup ||
    uiState.showScorePopup ||
    uiState.showTextResponseModal
  ) {
    opacity = 0.1;
  }

  return (
    <motion.div
      className="reward-history"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
    >
      <div className="reward-history-title">History</div>
      <div className="reward-history-list">
        {history.map((h, i) => {
          return (
            <div key={i} className="reward-history-item">
              <div className={`reward-history-item-agent ${h.agent.color}`}>
                {h.agent.name}
              </div>
              <div className="reward-history-item-reward">
                <img
                  src={`resources/images/custom/items/${h.item}.png`}
                  style={{ marginRight: 5 }}
                  width={30}
                />
                {h.agent.name === "you" &&
                  `(${h.item === "mystery-box" ? "?" : h.reward} points)`}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RewardHistory;
