import React from "react";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

import { useStore } from "../store";
import { MultiScreenModal } from "./core/MultiScreenModal";

const InitialInstructions = () => {
  const [uiState, setUiState] = useStore((state) => [
    state.uiState,
    state.setUiState,
  ]);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);

  const finishInstructions = () => {
    setUiState({ ...uiState, showInitialInstructions: false });
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
        buttonIcon: faThumbsUp,
        buttonDelay: 0,
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
        buttonIcon: faThumbsUp,
        buttonDelay: 5,
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
