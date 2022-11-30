import React, { useEffect, useState } from "react";

import { Modal } from "./Modal";

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
      setTimeout(() => setOpen(false), 1000);
    }
  }, [scoreDelta]);

  return (
    <Modal open={open} className="score-popup">
      +{scoreDelta} points!
    </Modal>
  );
};

export default ScorePopup;
