import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ScorePopup = ({ scoreDelta, clearDelta, scoreHidden }) => {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(scoreDelta);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (!open) {
      setDelta(scoreDelta);
    }

    if (scoreDelta <= 0) return;

    setOpen(true);
    clearTimeout(timeoutId);
    setTimeoutId(
      setTimeout(() => {
        setOpen(false);
        clearDelta();
      }, 1000)
    );
  }, [scoreDelta]);

  return (
    <AnimatePresence>
      {open && !scoreHidden && (
        <motion.div
          key="score-popup"
          className={`score-popup ${delta > 10 ? "high" : "medium"}`}
          initial={{ opacity: 0, top: 10 }}
          animate={{ opacity: 1, top: -70 }}
          exit={{ opacity: 0, top: 0 }}
          transition={{ duration: 0.4 }}
        >
          +{delta} points
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScorePopup;
