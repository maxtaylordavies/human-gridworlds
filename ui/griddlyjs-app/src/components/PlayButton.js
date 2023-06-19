import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { Modal } from "./core/Modal";

export const PlayButton = () => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const playing = useStore((state) => state.gameState.playing);

  const onClick = () => {
    setUIState({ ...uiState, showPlayButton: false });
  };

  return (
    <Modal
      open={uiState.showPlayButton && !playing}
      className="play-button-modal"
    >
      <FontAwesomeIcon
        icon={faPlay}
        className="play-button-icon"
        onClick={onClick}
        width={100}
      />
    </Modal>
  );
};
