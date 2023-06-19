import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Modal = ({
  key,
  open,
  children,
  styleProps,
  className,
  ref,
  onKeyDown,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={key}
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ styleProps }}
          ref={ref}
          onKeyDown={onKeyDown}
          tabIndex={-1}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
