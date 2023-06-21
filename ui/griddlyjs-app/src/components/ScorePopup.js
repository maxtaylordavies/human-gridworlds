import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ScorePopup = ({ scoreDelta, clearDelta, scoreHidden }) => {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (scoreDelta === 0) return;
    setOpen(scoreDelta > 0);
    clearTimeout(timeoutId);
    setTimeoutId(
      setTimeout(
        () => {
          setOpen(false);
          clearDelta();
        },
        scoreDelta > 0 ? 1000 : 500
      )
    );
  }, [scoreDelta]);

  return (
    <AnimatePresence>
      {open && !scoreHidden && (
        <motion.div
          key="score-popup"
          className={`score-popup ${scoreDelta > 10 ? "high" : "medium"}`}
          initial={{ opacity: 0, top: 10 }}
          animate={{ opacity: 1, top: -70 }}
          exit={{ opacity: 0, top: 0 }}
          transition={{ duration: 0.4 }}
        >
          +{scoreDelta} points
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScorePopup;
