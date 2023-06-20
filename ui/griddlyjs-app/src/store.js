import create from "zustand";

import * as utils from "./utils";

export const useStore = create((set) => ({
  // general UI state
  uiState: {
    showInitialInstructions: true,
    showPhaseInstructions: false,
    showQuiz: false,
    showAgentPopup: false,
    showLevelPopup: false,
    showFinishedScreen: false,
  },
  setUIState: (uist) =>
    set((state) => {
      // if showInitialInstructions is being set to false, set showPhaseInstructions to true
      if (
        !uist.showInitialInstructions &&
        state.uiState.showInitialInstructions
      ) {
        return { uiState: { ...uist, showPhaseInstructions: true } };
      }

      // if showPhaseInstructions is being set to false, set levelIdx to 0 and (maybe) showLevelPopup to true
      if (!uist.showPhaseInstructions && state.uiState.showPhaseInstructions) {
        const exp = { ...state.expState };
        const playing = exp.session.phases[exp.phaseIdx].agentReplays === null;
        return {
          uiState: {
            ...uist,
            showAgentPopup: !playing,
          },
          expState: exp,
          gameState: { ...state.gameState, playing: playing },
        };
      }

      // if showQuiz is being set to false, increment phaseIdx and set showPhaseInstructions to true
      if (!uist.showQuiz && state.uiState.showQuiz) {
        return {
          uiState: { ...uist, showPhaseInstructions: true },
          expState: {
            ...state.expState,
            phaseIdx: state.expState.phaseIdx + 1,
            agentIdx: 0,
            replayIdx: 0,
            levelIdx: 0,
          },
        };
      }

      return { uiState: uist };
    }),

  // experiment/session state
  expState: {
    session: null, // session object
    phaseIdx: 0, // index of phase we're in
    agentIdx: 0, // index of agent we're showing replays for (within the current phase)
    replayIdx: 0, // index of replay we're in (for current agent)
    levelIdx: 0, // if playing, index of level we're in (within the current phase)
  },
  setExpState: (est) =>
    set((state) => {
      let uist = { ...state.uiState };

      // if replayIdx is being incremented, check if we're at the end of the
      // replays for the current agent - if so, increment agentIdx
      if (est.replayIdx > state.expState.replayIdx) {
        console.log("replayIdx being incremented");
        const phase = est.session.phases[est.phaseIdx];
        if (est.replayIdx >= phase.agentReplays[est.agentIdx].replays.length) {
          console.log("end of replays for this agent");
          est.agentIdx += 1;
        }
      }

      // if agentIdx is being incremented, check if we're at the end of the
      // agents for the current phase. if we're not, set replayIdx to 0 and
      // continue. if we are, check if it's an interactive phase. if it is,
      // set playing to true; otherwise, increment phaseIdx
      if (est.agentIdx > state.expState.agentIdx) {
        console.log("agentIdx being incremented");
        const phase = est.session.phases[est.phaseIdx];
        if (est.agentIdx >= phase.agentReplays.length) {
          console.log("end of agents for this phase");
          if (phase.interactive) {
            return {
              expState: est,
              gameState: { ...state.gameState, playing: true },
              uiState: uist,
            };
          }
          est.phaseIdx += 1;
        } else {
          est.replayIdx = 0;
          uist.showAgentPopup = true;
        }
      }

      // if levelIdx is being incremented, check if we're at the end of the
      // current phase. if we are, and it's the first phase, then show the
      // quiz; otherwise, increment phaseIdx. also set showLevelPopup to true
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
          expState: { ...est, levelIdx: 0, agentIdx: 0, replayIdx: 0 },
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
