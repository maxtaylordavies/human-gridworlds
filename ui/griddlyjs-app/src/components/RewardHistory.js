import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";

const RewardHistory = () => {
  const gameState = useStore((state) => state.gameState);
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

  return (
    <motion.div className="reward-history">
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
                {h.agent.name === "you" && `(${h.reward} points)`}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RewardHistory;
