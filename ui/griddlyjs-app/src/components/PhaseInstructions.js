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
            <b>use your arrow keys</b> to control an avatar in a 2D game. The
            aim of the game is to earn <b>points</b> by collecting <b>items</b>.
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
            There are four different types of item in the game.{" "}
            <b>Different types may be worth different numbers of points</b>, but
            the number of points you earn for a particular type will <b>not</b>{" "}
            change during the experiment.
          </p>
          <p>
            Every time you collect an item, the game will show you how many
            points you earned. You should pay close attention to this
            information, and{" "}
            <b>try to determine which items are worth the most points.</b>
          </p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 4,
    },
    {
      content: (
        <>
          <p>
            All points you earn will contribute to your final score. A high
            final score means you will earn a bonus payment, so you should try
            to get as many points as possible!
          </p>
          <p>
            <b>Note: every time you move your avatar, you will lose 1 point.</b>
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 4,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This is an <b>observation phase</b>. In this phase, you will not
            interact with the game yourself - instead, you will watch{" "}
            <b>two other characters</b> as they navigate the grid to collect
            items for themselves.
          </p>
          <p>
            Characters also earn points by collecting items.{" "}
            <b>
              However, the number of points they earn for a particular item type
              may not be the same as for you
            </b>{" "}
            - so they <i>might</i> not always make the same choices that you
            would.
          </p>
          <p>Also, like you, every character loses points by moving.</p>
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
            You should pay <b>very close attention</b> to the choices each
            character makes, as this information will be useful in the next
            phase.
          </p>
          <p>
            You will also be presented with a quiz after watching each
            character. Unlike the quiz you just completed, you won't be told
            whether you answered correctly. However,{" "}
            <b>
              correct responses will earn you points towards your final score.
            </b>
            , so you should think carefully about your answers.
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
            This phase combines <b>both observation and interaction</b>. You
            will first watch the same two characters from the previous phase
            choose between two items - you will then have to choose between the{" "}
            <b>same</b> two items yourself.
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
            While you will not be able to see which item is inside each box,{" "}
            <b>all characters already know what is inside each box</b>.
          </p>
          <p>
            Furthermore, this time the game will <b>not</b> tell you how many
            points you earned - but these points will still contribute to your
            final score.
          </p>
          <p>
            From watching the characters, you should think carefully about which
            box is likely to give you more points!
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
            observe each character choose between different items.
          </p>
          <p>
            Like before, you should pay <b>very close attention</b> to the
            choices they make, as this information will be useful in the next
            phase. Again, you will also be presented with a quiz after each new
            character.
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
            any previous phase - they are <b>completely new</b>.
          </p>
          <p>
            From watching the characters, you should think carefully about which
            box is likely to give you more points.
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
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
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
    setUiState({ ...uiState, showPhaseInstructions: false });
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
