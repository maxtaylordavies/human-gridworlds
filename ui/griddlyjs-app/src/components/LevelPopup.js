import React, { useEffect, useState } from "react";

import { Modal } from "./Modal";

const LevelPopup = ({ level, ready, delay, duration }) => {
  const [open, setOpen] = useState(false);
  const [lvl, setLvl] = useState(0);

  useEffect(() => {
    if (level !== lvl && ready) {
      update();
    }
  }, [level, ready]);

  const update = () => {
    setTimeout(() => {
      setLvl(level);
      setOpen(true);
      setTimeout(() => setOpen(false), duration - (delay + 200));
    }, delay);
  };

  return (
    <Modal open={open} className="level-popup">
      Level {lvl}
    </Modal>
  );
};

export default LevelPopup;
