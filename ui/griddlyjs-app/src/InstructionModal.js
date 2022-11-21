import React from "react";

const InstructionModal = ({ visible, onStartClicked }) => {
  return (
    visible && (
      <div className="instruction-modal">
        <div className="instruction-modal-title">Instructions</div>
        <div className="instruction-modal-body">
          <div className="instruction-modal-text">
            <p>
              Welcome! This experiment involves playing a simple game, with
              multiple levels.
            </p>
            <p>
              For each level, you will first watch some recordings of other
              players - you will then play the level yourself.
            </p>
            <p>
              You move around using the keys wasd. There are no other controls.
            </p>
          </div>
          <button
            className="instruction-modal-start-button"
            onClick={onStartClicked}
          >
            Start experiment
          </button>
        </div>
      </div>
    )
  );
};

export default InstructionModal;
