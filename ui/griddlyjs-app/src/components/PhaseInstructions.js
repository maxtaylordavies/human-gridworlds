import React, { useEffect, useState } from "react";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <>
          <p>
            This is an interactive phase. In this phase, you will{" "}
            <b>use your arrow keys</b> to control an avatar in a 2D grid world.
            You earn <b>points</b> by collecting <b>items</b> that appear in
            corners of the grid.
          </p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
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
      buttonIcon: faHandPointRight,
      buttonDelay: 8,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This is an observation phase. In this phase, you will not interact
            with the game yourself - instead, you will watch{" "}
            <b>two other characters</b> as they navigate the grid to collect
            items.
          </p>
          <p>
            Characters also earn points by collecting items, and lose points
            when they move.{" "}
            <b>
              However, the points they earn for different items may not be the
              same as for you.
            </b>
          </p>
          <p>
            You should pay <b>close attention</b> to the choices they make, as
            this information will be useful in the next phase.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 8,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This phase combines both observation and interaction. You will first
            watch the two characters from the previous phase make a choice
            between two items - you will then have to choose between the same
            two items yourself.
          </p>
          <p>
            In this phase however, each item will be{" "}
            <b>hidden inside a mystery box</b>:
          </p>
          <img
            src="resources/images/custom/items/mystery-box.png"
            width={75}
            style={{ marginBottom: "1rem" }}
          />
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 5,
    },
    {
      content: (
        <>
          <p>
            While you will not be able to see which item is inside each box, the{" "}
            <b>two characters already know the contents of the boxes</b>, and
            will choose whichever gives them the most points.
          </p>
          <p>
            Also, the game will not tell you how many points you earned - but it
            will still contribute to your final score, so you should try to pick
            the box that gives you the most points!
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 5,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This is another observation phase. In this phase you will be
            introduced to <b>four new characters</b>; as in phase 2, you will
            observe each character make choices between items.
          </p>
          <p>
            Like before, you should pay <b>close attention</b> to the choices
            they make, as this information will be useful in the next phase.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 5,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This is the final phase. Like phase 3, this phase involves choosing
            between hidden items after watching what two characters do.{" "}
          </p>
          <p>
            Unlike phase 3, <b>you have not seen these characters before</b> in
            any previous phase.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 5,
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
