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
            In this phase, you will <b>use your arrow keys</b> to control a{" "}
            <b>character</b> in a 2D game.
          </p>
          <p>
            The aim of the game is to earn <b>points</b> by collecting{" "}
            <b>items</b>.
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
          <p>There are four different types of item in the game:</p>
          <div style={{ marginBottom: "1rem" }}>
            {["A", "B", "C", "D"].map((item) => {
              return (
                <img
                  src={`resources/images/custom/items/goal${item}.png`}
                  height={60}
                  width={60}
                  alt={`item ${item}`}
                />
              );
            })}
          </div>
          <p>
            <b>Your character likes some types of item more than others.</b>{" "}
          </p>
          <p>Items that your character likes more will give you more points.</p>
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
            In this phase, the game will show you how many points you earn for
            each item.
          </p>
          <p>
            You can use this to{" "}
            <b>figure out which types of item your character prefers</b>.
          </p>
          <p>
            The item types your character prefers will be the same throughout
            the experiment.
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
            final score. Your final score will determine the{" "}
            <b>bonus payment</b> you receive, so you should try to get as many
            points as possible!
          </p>
          <p>
            <b>
              Note: for every step your character takes, you will lose 1 point!
            </b>
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
          <p>This phase combines observation and interaction.</p>
          <p>
            So far, you have only seen your own character. In this phase you
            will be introduced to <b>four new characters</b> that you have not
            seen before.
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
            You will <b>not</b> be able to control these characters.
          </p>
          <p>
            At each level, you will first watch them navigate the grid to
            collect items for themselves
          </p>
          <p>
            <b>You will then play the same level yourself.</b>
          </p>
          {/* <p>
            After watching each character, you will complete a quiz, similar to
            the one you completed for yourself in the previous phase.
          </p> */}
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
            Every character has their own preferences regarding item types.{" "}
          </p>
          <p>
            <b>
              Just like in the real world, different characters can agree or
              disagree on which items are best!
            </b>
          </p>
          <p>
            (And like you, the other characters also lose points for moving.)
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    // {
    //   content: (
    //     <p>
    //       By watching what each character does, you should try to figure out
    //       which types of item they prefer.
    //     </p>
    //   ),
    //   buttonLabel: "Start phase",
    //   buttonIcon: faHandPointRight,
    //   buttonDelay: 3,
    // },
  ],
  [
    {
      content: (
        <>
          <p>
            In the final phase, you will be introduced to two <b>new</b>{" "}
            characters.
          </p>
          <p>
            Just like in the previous phase, you will watch what they do, and
            then complete each level yourself.
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
            alt="mystery box"
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
          You will not be able to see inside the boxes, but{" "}
          <b>the other characters already know what each box contains</b>, so
          you should pay attention to which box they each choose!
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
      buttonLabel: "Next",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
    },
    {
      content: (
        <>
          <p>There are two levels in this final phase.</p>
          <p>
            In the first level, the hidden items are the <b>same colour</b> but{" "}
            <b>different shapes</b>.
          </p>
          <p>
            In the second level, the hidden items are the <b>same shape</b> but{" "}
            <b>different colours</b>.
          </p>
        </>
      ),
      buttonLabel: "Start phase",
      buttonIcon: faHandPointRight,
      buttonDelay: 3,
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
