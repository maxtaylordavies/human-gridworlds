import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

const emoji = { high: "🎉", medium: "😐", low: "🤦‍♂️" };

const ScorePopup = ({ score }) => {
  const [open, setOpen] = useState(false);
  const [prevScore, setprevScore] = useState(score);
  const [scoreDelta, setScoreDelta] = useState(0);

  useEffect(() => {
    let delta = score - prevScore;
    setScoreDelta(delta);
    setprevScore(score);
  }, [score]);

  useEffect(() => {
    if (scoreDelta > 0) {
      setOpen(true);
      setTimeout(() => setOpen(false), 2000);
    }
  }, [scoreDelta]);

  const bracket = scoreDelta > 30 ? "high" : scoreDelta < 10 ? "low" : "medium";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="score-popup"
          className={`score-popup ${bracket}`}
          initial={{ opacity: 0, top: 10 }}
          animate={{ opacity: 1, top: -70 }}
          exit={{ opacity: 0, top: 0 }}
          transition={{ duration: 0.4 }}
        >
          +{scoreDelta} points {emoji[bracket]}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScorePopup;
