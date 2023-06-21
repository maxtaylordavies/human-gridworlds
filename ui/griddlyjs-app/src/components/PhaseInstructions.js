import React, { useEffect, useState } from "react";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <>
          <p>
            In this phase, you will play through a series of levels in a game.{" "}
            You can control the game using the arrow keys on your keyboard.{" "}
          </p>
          <p>
            In each level, you need to collect an item. Some levels will only
            contain one item, but in other levels you will have to choose
            between items.
          </p>
        </>
      ),
      buttonLabel: "Next",
    },
    {
      content: (
        <>
          <p>
            Every time you collect an item, you will receive some points. The
            number of points you receive will depend on the properties of the
            item you collect.
          </p>
          <p>
            You should first try to determine the relationship between item
            properties and points.{" "}
          </p>
          <p>
            You can then use this information to score as many points as
            possible.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
    },
  ],
  [
    {
      content: (
        <>
          <p>Evidence phase 1 instructions :)</p>
        </>
      ),
      buttonLabel: "Start phase",
    },
  ],
  [
    {
      content: (
        <>
          <p>Test phase instructions :)</p>
        </>
      ),
      buttonLabel: "Start phase",
    },
  ],
  [
    {
      content: (
        <>
          <p>Evidence phase 2 instructions :)</p>
        </>
      ),
      buttonLabel: "Start phase",
    },
  ],
  [
    {
      content: (
        <>
          <p>Test phase 2 instructions :)</p>
        </>
      ),
      buttonLabel: "Start phase",
    },
  ],
];

const PhaseInstructions = () => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const expState = useStore((state) => state.expState);

  const [visible, setVisible] = useState(uiState.showPhaseInstructions);

  useEffect(() => {
    // when toggling visibility to true, we add a small delay to allow
    // the initial instructions to fade out first
    if (uiState.showPhaseInstructions) {
      setTimeout(() => {
        setVisible(true);
      }, 500);
    } else {
      setVisible(false);
    }
  }, [uiState.showPhaseInstructions]);

  const onFinish = () => {
    setUIState({ ...uiState, showPhaseInstructions: false });
  };

  const generateContentProp = () => {
    const prop = {};
    const name = `Phase ${expState.phaseIdx + 1}`;
    prop[name] = phaseInstructionsContent[expState.phaseIdx];
    return prop;
  };

  return expState.phaseIdx === -1 ? (
    <></>
  ) : (
    <MultiScreenModal
      content={generateContentProp()}
      visible={visible}
      key="phase-instructions-modal"
      onFinish={onFinish}
    />
  );
};

export default PhaseInstructions;
