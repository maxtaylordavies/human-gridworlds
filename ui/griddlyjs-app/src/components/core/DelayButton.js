import React, { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

export const DelayButton = ({
  delay,
  onClick,
  className,
  children,
  ...props
}) => {
  const [ready, setReady] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0.5 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      style={{ pointerEvents: ready ? "auto" : "none" }}
    >
      {children}
      {ready ? (
        <FontAwesomeIcon icon={faPlay} className="agent-popup-play-icon" />
      ) : (
        <div className="agent-popup-countdown">
          <CountdownCircleTimer
            isPlaying
            duration={2}
            colors={"white"}
            size={22}
            strokeWidth={3}
            trailColor={"#00916E"}
            onComplete={() => {
              setReady(true);
              return [true, 0];
            }}
          />
        </div>
      )}
    </motion.button>
  );
};
