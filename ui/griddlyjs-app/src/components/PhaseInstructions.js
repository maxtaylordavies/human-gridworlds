import React, { useEffect, useState } from "react";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <>
          <p>Exploration phase instructions :)</p>
        </>
      ),
      buttonLabel: "let's goooo",
    },
  ],
  [
    {
      content: (
        <>
          <p>Evidence phase instructions :)</p>
        </>
      ),
      buttonLabel: "let's goooo",
    },
  ],
  [
    {
      content: (
        <>
          <p>Test phase instructions :)</p>
        </>
      ),
      buttonLabel: "let's goooo",
    },
  ],
  [],
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
    const name = expState.session.phases[expState.phaseIdx].name;
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
