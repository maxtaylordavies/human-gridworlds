import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="score-popup"
          className="score-popup"
          initial={{ opacity: 0, top: 10 }}
          animate={{ opacity: 1, top: -60 }}
          exit={{ opacity: 0, top: 0 }}
          transition={{ duration: 0.4 }}
        >
          +{scoreDelta} points!
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScorePopup;
