import React, { useEffect, useState } from "react";

import { useStore } from "../store";
import { Modal } from "./core/Modal";
import { DelayButton } from "./core/DelayButton";
import * as utils from "../utils";

const LevelItemsPopup = ({ delay }) => {
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);
  const expState = useStore((state) => state.expState);
  const gameState = useStore((state) => state.gameState);

  const [show, setShow] = useState(uiState.showLevelItemsPopup);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (uiState.showLevelItemsPopup) {
      const _items = utils.currentItems(expState, gameState);
      setItems(_items);
      setTimeout(() => {
        setShow(true);
      }, delay);
    } else if (show) {
      setShow(false);
    }
  }, [uiState, expState, gameState]);

  const onProceedClicked = () => {
    setUiState({ ...uiState, showLevelItemsPopup: false });
  };

  return (
    <Modal open={show} className="level-items-popup">
      <div className="level-items-popup-header">
        This level contains the following items:
      </div>
      <div className="level-items-popup-items">
        {items.map((item, i) => (
          <div key={i} className="level-items-popup-item">
            <img
              src={`resources/images/custom/items/goal${item}.png`}
              width={100}
              height={100}
              alt={item}
            />
          </div>
        ))}
      </div>
      <div className="level-items-popup-button-row">
        <DelayButton
          delay={2}
          onClick={onProceedClicked}
          spinnerSize={16}
          spinnerWidth={2.5}
          className="level-items-popup-button"
        >
          Proceed
        </DelayButton>
      </div>
    </Modal>
  );
};

export default LevelItemsPopup;
