import React from "react";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const InitialInstructions = () => {
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);

  // const expGroup = session?.agentIds?.length === 2 ? 1 : 2;
  const expGroup = 1;

  const finishInstructions = () => {
    setUIState({ ...uiState, showInitialInstructions: false });
    setExpState({ ...expState, phaseIdx: 0 });
  };

  const content = {
    Consent: [
      {
        content: (
          <>
            <p>
              Before proceeding further, please carefully read through the{" "}
              <a href={`${window.location.origin}/pis`} target="_blank">
                participant information sheet
              </a>
              , and then confirm you have done so by clicking the button below
            </p>
          </>
        ),
        buttonLabel: "Confirm",
      },
      {
        content: (
          <>
            <p>
              By participating in the study you agree that
              <ul>
                <li>
                  My participation is voluntary, and that I can withdraw at any
                  time without giving a reason. Withdrawing will not affect any
                  of my rights
                </li>
                <li>
                  I consent to my anonymised data being used in academic
                  publications and presentations.
                </li>
                <li>
                  I understand that my anonymised data will be stored for the
                  duration outlined in the Participant Information Sheet.
                </li>
              </ul>
            </p>
            <p>
              <b>
                Please click 'give consent' to confirm and proceed to the
                experiment.
              </b>
            </p>
          </>
        ),
        buttonLabel: "Give consent",
      },
    ],
    Instructions: [
      {
        content: (
          <>
            <p>
              You will now read through some instructions on how to complete the
              experiment.{" "}
            </p>
            <p className="please-read">
              Please read these instructions very carefully and make sure you
              understand them. You will not be able to access them again once
              the experiment has started.
            </p>
          </>
        ),
        buttonLabel: "Next",
      },
      {
        content: (
          <>
            <p>This experiment involves playing a simple 2D navigation game.</p>
            <img
              src="resources/images/custom/levelpic1.jpg"
              height="250px"
              style={{ marginBottom: "1rem" }}
            />
            <p>
              You control a human avatar, which you can move around using the{" "}
              <b>arrow keys</b> on your keyboard.
            </p>
          </>
        ),
        buttonLabel: "Next",
      },
      {
        content: (
          <>
            <p>You will play through a sequence of 7 levels.</p>
            <p>
              Each level will contain a number of different coloured gems.{" "}
              <b>To complete the level, you need to collect one of the gems.</b>{" "}
            </p>
            <p>
              Collecting any gem will complete the level, but each gem is worth
              a different number of points:
            </p>
            {/* <div className="instruction-modal-score-key">
              {session &&
                goalImages &&
                session.utility.goals.map((r, i) => (
                  <div className="instruction-modal-score-key-item">
                    <img
                      src={`resources/images/${goalImages[i]}`}
                      height="50px"
                    />
                    <span>{i <= 2 ? r : "?"}</span>
                  </div>
                ))}
            </div> */}
            <p>
              The value of each gem will remain the same throughout the game.{" "}
            </p>
          </>
        ),
        buttonLabel: "Next",
      },
      {
        content: (
          <>
            <p>
              As well as your human character, there are a number of aliens in
              the game. At each level, some or all of the aliens will take turns
              to complete it - it will then be your turn to complete the level
              yourself.
            </p>
            {/* <div className="instruction-modal-character-key">
              {session &&
                session.agentIds.map((id) => (
                  <img
                    src={`resources/images/${session.agentAvatars[id]}`}
                    height="60px"
                    style={{ marginRight: 10 }}
                  />
                ))}
            </div> */}
            <p>
              <b>
                You should pay close attention to what each of the aliens does.
                In some levels, you may want to copy one the aliens - but be
                careful, because not all aliens are like you - some might prefer
                different gems!
              </b>
            </p>
          </>
        ),
        buttonLabel: "Next",
      },
      {
        content:
          expGroup === 1 ? (
            <>
              <p>
                Some levels may be partly hidden by darkness, so that you can
                only see a small part of the environment at once.
              </p>
              <p>
                The aliens are unaffected by this, since they have eyesight that
                allows them to see in the dark.{" "}
                <b>This means that they always know where they are going.</b>
              </p>
              <img
                src="resources/images/custom/levelpic2.jpg"
                height="250px"
                style={{ marginBottom: "1rem" }}
              />
            </>
          ) : (
            <>
              <p>
                In some levels, part of the world may be blocked off by water,
                meaning that some of the gems are not accessible.{" "}
              </p>
              <p>
                In these levels, you should just collect whichever gem you can.{" "}
                <b>
                  But you should still pay close attention to which gems the
                  aliens collect,
                </b>{" "}
                as this information may help in other levels.
              </p>
            </>
          ),
        buttonLabel: "Next",
      },
      {
        content: (
          <>
            <p>
              You start the game with 100 points. Every step you take will cost
              1 point. <b>Your goal is to get the highest score you can.</b>{" "}
              High scores will earn a bonus payment, so do your best!
            </p>
            <p>
              The first level will be a <b>practice level</b> - it will not
              count towards your final score. After the practice level, you will
              be presented with a <b>very short quiz</b>, where you will have to
              identify which gem each alien collected - so pay attention!
            </p>
            <p>
              <i>
                Note: if at any point your arrow keys stop working, click on the
                game screen to refocus.
              </i>
            </p>
          </>
        ),
        buttonLabel: "Start experiment",
      },
    ],
  };

  return (
    <MultiScreenModal
      content={content}
      visible={uiState.showInitialInstructions}
      key="instruction-modal"
      onFinish={finishInstructions}
    />
  );
};

export default InitialInstructions;
