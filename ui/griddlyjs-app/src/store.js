import create from "zustand";

export const useStore = create((set) => ({
  // general app state
  appState: {
    waiting: true,
    showQuiz: false,
    finished: false,
  },
  setAppState: (ast) => set(() => ({ appState: ast })),

  // session state
  sessionState: {
    session: null,
    phaseIdx: 0,
    levelCount: 0,
    agentPaths: null,
  },
  setSessionState: (sst) => {
    console.log("setSessionState", sst);
    set(() => ({ sessionState: sst }));
  },

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    goalImages: [],
    playing: false,
    score: 100,
  },
  setGameState: (gst) => set(() => ({ gameState: gst })),

  // playback and renderer state
  playbackState: {
    pathsToShow: null,
    currentPathIdx: -1,
    waiting: true,
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
