import React, { useState } from "react";
import { motion } from "framer-motion";

import { Modal } from "./Modal";

const InstructionModal = ({ visible, onStartClicked, session, goalImages }) => {
  const [stage, setStage] = useState("Consent");
  const [screenIdx, setScreenIdx] = useState(0);

  const expGroup = session?.agentIds.length === 2 ? 1 : 2;

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
        onClick: () => setScreenIdx((curr) => curr + 1),
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
        onClick: () => {
          setStage("Instructions");
          setScreenIdx(0);
        },
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
        onClick: () => setScreenIdx((curr) => curr + 1),
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
        onClick: () => setScreenIdx((curr) => curr + 1),
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
            <div className="instruction-modal-score-key">
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
            </div>
            <p>
              The value of each gem will remain the same throughout the game.{" "}
            </p>
          </>
        ),
        buttonLabel: "Next",
        onClick: () => setScreenIdx((curr) => curr + 1),
      },
      {
        content: (
          <>
            <p>
              As well as your human character, there are{" "}
              {session.agentIds.length} aliens in the game. At each level, some
              or all of the aliens will take turns to complete it - it will then
              be your turn to complete the level yourself.
            </p>
            <div className="instruction-modal-character-key">
              {session &&
                session.agentIds.map((id) => (
                  <img
                    src={`resources/images/${session.agentAvatars[id]}`}
                    height="60px"
                    style={{ marginRight: 10 }}
                  />
                ))}
            </div>
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
        onClick: () => setScreenIdx((curr) => curr + 1),
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
        onClick: () => setScreenIdx((curr) => curr + 1),
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
        onClick: onStartClicked,
      },
    ],
  };

  return (
    <Modal key="instruction-modal" className="instruction-modal" open={visible}>
      <div className="instruction-modal-title">{stage}</div>
      <div className="instruction-modal-body">
        <div className="instruction-modal-text">
          {content[stage][screenIdx].content}
        </div>
        <div className="instruction-modal-button-row">
          {stage === "instructions" || screenIdx > 0 ? (
            <motion.button
              className="instruction-modal-button back"
              onClick={() => {
                screenIdx === 0
                  ? setStage("Consent")
                  : setScreenIdx((curr) => curr - 1);
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              Back
            </motion.button>
          ) : (
            <div />
          )}
          <motion.button
            className={`instruction-modal-button ${
              content[stage][screenIdx].buttonLabel === "Next"
                ? "next"
                : "start"
            }`}
            onClick={content[stage][screenIdx].onClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {content[stage][screenIdx].buttonLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default InstructionModal;
