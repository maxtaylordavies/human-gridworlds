import create from "zustand";

export const useStore = create((set) => ({
  // general UI state
  uiState: {
    showInitialInstructions: true,
    showPhaseInstructions: false,
    showQuiz: false,
    showLevelPopup: true,
    showFinishedScreen: false,
  },
  setUIState: (uist) => set(() => ({ uiState: uist })),

  // session state
  expState: {
    session: null,
    phaseIdx: 0,
    levelIdx: 0,
    agentPaths: null,
  },
  setExpState: (est) => set(() => ({ expState: est })),

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
