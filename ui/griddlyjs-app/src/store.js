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
      console.log("setting uiState: ", uist);

      // if showPhaseInstructions is being set to false, set levelIdx to 0
      if (!uist.showPhaseInstructions && state.uiState.showPhaseInstructions) {
        console.log("setting levelIdx to 0");
        return { uiState: uist, expState: { ...state.expState, levelIdx: 0 } };
      }
      console.log("not setting levelIdx to 0");
      return { uiState: uist };
    }),

  // experiment/session state
  expState: {
    session: null, // session object
    phaseIdx: 0, // index of phase we're in
    levelIdx: 0, // index of level we're in (within the current phase)
    agentTrajectories: null, // set of agent trajectories to show
  },
  setExpState: (est) =>
    set((state) => {
      // if levelIdx is being incremented, check if we're at the end of the
      // current phase - if so, increment phaseIdx
      if (est.levelIdx > state.expState.levelIdx) {
        const phase = est.session.phases[est.phaseIdx];
        if (est.levelIdx >= phase.levels.length) {
          est.phaseIdx += 1;
        }
      }

      // if phaseIdx is being incremented, first check if we've
      // reached the end of the experiment - otherwise reset
      // levelIdx to -1 and set showPhaseInstructions to true
      if (est.phaseIdx > state.expState.phaseIdx) {
        if (est.phaseIdx >= est.session.phases.length) {
          return { uiState: { ...state.uiState, showFinishedScreen: true } };
        }
        return {
          uiState: { ...state.uiState, showPhaseInstructions: true },
          expState: { ...est, levelIdx: 0 },
        };
      }

      return { expState: est };
    }),

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: false,
    score: 100,
  },
  setGameState: (gst) => set(() => ({ gameState: gst })),

  // playback and renderer state
  playbackState: {
    pathsToShow: null,
    currentPathIdx: -1,
  },
  setPlaybackState: (pst) => set(() => ({ playbackState: pst })),
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
