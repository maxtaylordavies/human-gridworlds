import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

const emoji = { high: "🎉", medium: "😐", low: "🤦‍♂️" };

const ScorePopup = ({ score, session }) => {
  const [open, setOpen] = useState(false);
  const [prevScore, setprevScore] = useState(score);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (session) {
      setBounds({
        min: Math.min(...session.utility.goals),
        max: Math.max(...session.utility.goals),
      });
    }
  }, [session]);

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

  const bracket =
    scoreDelta === bounds.max
      ? "high"
      : scoreDelta === bounds.min
      ? "low"
      : "medium";

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
