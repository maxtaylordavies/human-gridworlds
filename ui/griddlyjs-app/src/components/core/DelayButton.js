import React, { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

export const DelayButton = ({
  delay,
  spinnerSize,
  spinnerWidth,
  onClick,
  icon,
  className,
  children,
  ...props
}) => {
  const [ready, setReady] = useState(false);

  const handleClick = () => {
    onClick();
    setReady(false);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`delay-button ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0.5 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      style={{ pointerEvents: ready ? "auto" : "none" }}
    >
      {children}
      {ready ? (
        <FontAwesomeIcon icon={icon} className="delay-button-icon" />
      ) : (
        <div className="delay-button-countdown">
          <CountdownCircleTimer
            isPlaying
            duration={delay || 2}
            colors={"white"}
            size={spinnerSize || 20}
            strokeWidth={spinnerWidth || 3}
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
