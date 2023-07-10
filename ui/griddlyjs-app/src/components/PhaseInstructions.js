import React, { useEffect, useState } from "react";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <p>
          This is an interactive phase. In this phase, you will{" "}
          <b>use your arrow keys</b> to control a <b>character</b> in a 2D game.
          The aim of the game is to earn <b>points</b> by collecting{" "}
          <b>items</b>.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
    },
    {
      content: (
        <p>
          There are four different types of item in the game.{" "}
          <b>Your character likes some types of item more than others.</b> Items
          that your character likes more are worth more points.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
    },
    {
      content: (
        <>
          <p>
            Each time you collect an item, the game will show you how many
            points you earned. You should use this information to{" "}
            <b>try and determine which types of item your character prefers.</b>
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
            All points you earn during the experiment will contribute to your
            final score. A high final score means you will earn a bonus payment,
            so you should try to get as many points as possible!
          </p>
          <p>Note: every time your character moves, you will lose 1 point.</p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
    },
  ],
  [
    {
      content: (
        <p>
          This is an <b>observation phase</b>. In this phase, you will not
          interact with the game yourself - instead, you will watch{" "}
          <b>two other characters</b> as they navigate the grid to collect items
          for themselves.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
    },
    {
      content: (
        <>
          <p>
            Other characters also earn points by collecting items, and like some
            types of item more than others -{" "}
            <b>but their preferences might be different to yours!</b>
          </p>
          <p>Like you, they also lose points by moving.</p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <p>
          Just like you did in the previous phase, you should try to figure out
          which types of item each character prefers.{" "}
          <i>This information may be useful to you in the next phase.</i>
        </p>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
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
      buttonDelay: 2,
    },
    {
      content: (
        <>
          <p>
            While you will not be able to see inside the boxes,{" "}
            <b>
              the other characters already know which item type each box
              contains,
            </b>{" "}
            so you should pay close attention to what they do.
          </p>
          <p>
            Furthermore, this time the game will <b>not</b> tell you how many
            points you earned - but these points will still contribute to your
            final score.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
  ],
  [
    {
      content: (
        <p>
          This is another observation phase. In this phase you will be
          introduced to <b>four new characters</b>; as in phase 2, you will
          observe each character choose between different items.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 2,
    },
    {
      content: (
        <p>
          Like before, you should pay <b>close attention</b> to the choices they
          make, and try to figure out which types of item each character
          prefers.{" "}
          <i>This information may be useful to you in the next phase.</i>
        </p>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
  ],
  [
    {
      content: (
        <>
          <p>
            This is the <b>final phase.</b> Like phase 3, this phase involves
            choosing between hidden items after watching what two characters do.{" "}
          </p>
          <p>
            Unlike phase 3, <b>you have not seen these characters before</b> in
            any previous phase - they are{" "}
            <i>
              <b>completely new</b>
            </i>
            .
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
