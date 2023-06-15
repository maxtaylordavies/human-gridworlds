import create from "zustand";

export const useStore = create((set) => ({
  // general UI state
  uiState: {
    showInitialInstructions: true,
    showPhaseInstructions: false,
    showQuiz: false,
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
        console.log("setting showPhaseInstructions to true");
        return { uiState: { ...uist, showPhaseInstructions: true } };
      }

      // if showPhaseInstructions is being set to false, set levelIdx to 0
      if (!uist.showPhaseInstructions && state.uiState.showPhaseInstructions) {
        console.log("setting levelIdx to 0");
        return { uiState: uist, expState: { ...state.expState, levelIdx: 0 } };
      }

      // if showQuiz is being set to false, increment phaseIdx and set showPhaseInstructions to true
      if (!uist.showQuiz && state.uiState.showQuiz) {
        console.log("incrementing phaseIdx");
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
      // if replayIdx is being incremented, check if we're at the end of the
      // replays for the current level - if so, check if this phase is interactive;
      // if it is, set gameState.playing to true, otherwise increment levelIdx
      if (est.replayIdx > state.expState.replayIdx) {
        console.log("replayIdx being incremented");
        const phase = est.session.phases[est.phaseIdx];
        const level = phase.levels[est.levelIdx];
        if (est.replayIdx >= level.replays.length) {
          console.log("end of replays for this level");
          if (phase.interactive) {
            return {
              gameState: { ...state.gameState, playing: true },
              expState: est,
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
              uiState: { ...state.uiState, showQuiz: true },
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
          expState: { ...est, levelIdx: 0, replayIdx: 0 },
        };
      }

      return { expState: est };
    }),

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: true,
    score: 100,
    agentPos: { x: 0, y: 0 },
  },
  setGameState: (gst) =>
    set(() => {
      return { gameState: gst };
    }),
  updateScore: (delta) =>
    set((state) => {
      const newScore = state.gameState.score + delta;
      return {
        gameState: { ...state.gameState, score: newScore },
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
