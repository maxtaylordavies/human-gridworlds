import React, { useEffect, useState } from "react";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <>
          <p>
            In this phase, you will <b>use your arrow keys</b> to control an
            avatar in a 2D grid world. You earn <b>points</b> by collecting{" "}
            <b>items</b> that appear in corners of the grid.
          </p>
        </>
      ),
      buttonLabel: "Next",
    },
    {
      content: (
        <>
          <p>
            <b>Different items are worth different amounts of points.</b> Every
            time you collect an item, the game will show you how many points you
            earned. These points contribute to your final score.
          </p>
          <p>
            A high final score means you will earn a bonus payment, so you
            should try to get as many points as possible!
          </p>
          <p>
            <b>Note: every time you move your avatar, you will lose 1 point.</b>
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
