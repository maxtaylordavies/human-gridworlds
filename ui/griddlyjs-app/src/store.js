import create from "zustand";

import * as utils from "./utils";

export const useStore = create((set) => ({
  // general UI state
  uiState: {
    showInitialInstructions: true,
    showPhaseInstructions: false,
    showQuiz: false,
    showLevelPopup: false,
    showPlayButton: false,
    showFinishedScreen: false,
  },
  setUIState: (uist) =>
    set((state) => {
      // if showInitialInstructions is being set to false, set showPhaseInstructions to true
      if (
        !uist.showInitialInstructions &&
        state.uiState.showInitialInstructions
      ) {
        console.log("setting showPhaseInstructions to true");
        return { uiState: { ...uist, showPhaseInstructions: true } };
      }

      // if showPhaseInstructions is being set to false, set levelIdx to 0 and showPlayButton to true
      if (!uist.showPhaseInstructions && state.uiState.showPhaseInstructions) {
        return {
          uiState: { ...uist, showPlayButton: true },
          expState: { ...state.expState, levelIdx: 0 },
        };
      }

      // if showQuiz is being set to false, increment phaseIdx and set showPhaseInstructions to true
      if (!uist.showQuiz && state.uiState.showQuiz) {
        return {
          uiState: { ...uist, showPhaseInstructions: true },
          expState: {
            ...state.expState,
            phaseIdx: state.expState.phaseIdx + 1,
            levelIdx: 0,
            replayIdx: 0,
          },
        };
      }

      return { uiState: uist };
    }),

  // experiment/session state
  expState: {
    session: null, // session object
    phaseIdx: 0, // index of phase we're in
    levelIdx: 0, // index of level we're in (within the current phase)
    replayIdx: 0, // index of replay we're in (within the current level)
  },
  setExpState: (est) =>
    set((state) => {
      let uist = { ...state.uiState };

      // if replayIdx is being incremented, check if we're at the end of the
      // replays for the current level - if so, check if this phase is interactive;
      // if it is, set gameState.playing to true, otherwise increment levelIdx
      if (est.replayIdx > state.expState.replayIdx) {
        console.log("replayIdx being incremented");
        uist.showPlayButton = true;
        const phase = est.session.phases[est.phaseIdx];
        const level = phase.levels[est.levelIdx];
        if (est.replayIdx >= level.replays.length) {
          console.log("end of replays for this level");
          if (phase.interactive) {
            return {
              expState: est,
              gameState: { ...state.gameState, playing: true },
              uiState: uist,
            };
          }
          est.levelIdx += 1;
        }
      }

      // if levelIdx is being incremented, check if we're at the end of the
      // current phase. if we are, and it's the first phase, then show the
      // quiz; otherwise, increment phaseIdx
      if (est.levelIdx > state.expState.levelIdx) {
        est.replayIdx = 0;

        const phase = est.session.phases[est.phaseIdx];
        if (est.levelIdx >= phase.levels.length) {
          if (est.phaseIdx === 0) {
            return {
              uiState: { ...uist, showQuiz: true },
            };
          }
          est.phaseIdx += 1;
        } else {
          uist.showPlayButton = true;
          // uist.showPlayButton =
          //   est.session.phases[est.phaseIdx].levels[est.levelIdx].replays
          //     .length > 0;
        }
      }

      // if phaseIdx is being incremented, first check if we've
      // reached the end of the experiment - otherwise reset
      // levelIdx to 0 and set showPhaseInstructions to true
      if (est.phaseIdx > state.expState.phaseIdx) {
        if (est.phaseIdx >= est.session.phases.length) {
          return { uiState: { ...state.uiState, showFinishedScreen: true } };
        }
        return {
          uiState: { ...state.uiState, showPhaseInstructions: true },
          expState: { ...est, levelIdx: 0, replayIdx: 0 },
        };
      }

      return { expState: est, uiState: uist };
    }),

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: true,
    agentPos: { x: 0, y: 0 },
  },
  setGameState: (gst) =>
    set(() => {
      return { gameState: gst };
    }),
  score: 50,
  updateScore: (delta) =>
    set((state) => {
      const newScore = state.score + delta;
      return {
        score: newScore,
      };
    }),

  // renderer state
  rendererState: {
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  },
  setRendererState: (rst) => set(() => ({ rendererState: rst })),

  // results state
  trajectories: {},
  setTrajectories: (traj) => set(() => ({ trajectories: traj })),
}));
