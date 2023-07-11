import React, { useEffect, useState } from "react";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const phaseInstructionsContent = [
  [
    {
      content: (
        <p>
          This is an{" "}
          <u>
            <b>interactive phase</b>
          </u>
          . In this phase, you will <b>use your arrow keys</b> to control a{" "}
          <b>character</b> in a 2D game. The aim of the game is to earn{" "}
          <b>points</b> by collecting <b>items</b>.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <p>
          There are four different types of item in the game.{" "}
          <b>Your character likes some types of item more than others.</b> Items
          that your character likes more will give you more points.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
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
      buttonDelay: 3,
    },
    {
      content: (
        <>
          <p>
            All points you earn during the experiment will contribute to your
            final score. Your final score will determine the bonus payment you
            receive, so you should try to get as many points as possible!
          </p>
          <p>Note: every time your character moves, you will lose 1 point.</p>
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
          This is an{" "}
          <u>
            <b>observation phase</b>
          </u>
          . So far, you have only seen your own character. But the game also
          contains <b>other characters</b> - in this phase, you will begin to be
          introduced to them.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <p>
          You will not be able to control these characters - instead you will
          watch them as they navigate the grid to collect items for themselves.
          After watching each character, you will complete a quiz, similar to
          the one you completed for yourself in the previous phase.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <>
          <p>
            Every character has their own preferences regarding item types. Just
            like in the real world, different characters might agree on which
            item types are best, or they might disagree!
          </p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <>
          <p>
            <b>
              This means that any character you see might choose the same items
              that you would choose - or they might choose different items.
            </b>
          </p>
          <p>Like you, other characters also lose points for moving.</p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <>
          <p>
            By watching what each character does, you should try to figure out
            which types of item they prefer.
          </p>
          <p>
            <i>This information may be useful to you in the next phase.</i>
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
        <>
          <p>
            This phase combines{" "}
            <u>
              <b>both observation and interaction</b>
            </u>
            . You will first watch the same characters you just met (Alice and
            Bob) choose between two items - you will then have to choose between
            the two items yourself.
          </p>
        </>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
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
      buttonDelay: 3,
    },
    {
      content: (
        <p>
          While you will not be able to see inside the boxes,{" "}
          <b>Alice and Bob already know what each box contains</b>, so you
          should pay close attention to which box they each choose!
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <p>
          When you collect a hidden item, the game will <b>not</b> tell you how
          many points you earned. But these points <u>will</u> still contribute
          to your final score (and your bonus payment!)
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
        <p>
          This is another{" "}
          <u>
            <b>observation phase</b>
          </u>
          . In this phase you will be introduced to <b>four new characters</b>{" "}
          that you have not seen before. As in phase 2, you will observe each
          character choose between different items.
        </p>
      ),
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
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
            This is the{" "}
            <u>
              <b>final phase</b>
            </u>
            . Like phase 3, this phase involves choosing between hidden items
            after watching what two characters do.{" "}
          </p>
          <p>
            Unlike phase 3, <b>you have NOT seen these characters before</b> in
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
