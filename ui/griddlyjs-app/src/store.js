import create from "zustand";

export const useStore = create((set) => ({
  // general app state
  appState: {
    waiting: true,
    showQuiz: false,
    finished: false,
  },
  setAppState: (appState) => set({ appState }),

  // session state
  sessionState: {
    session: null,
    phaseIdx: 0,
    levelCount: 0,
    agentPaths: null,
  },
  setSessionState: (sessionState) => set({ sessionState }),

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    goalImages: [],
    playing: false,
    score: 100,
  },
  setGameState: (gameState) => set({ gameState }),

  // playback and renderer state
  playbackState: {
    pathsToShow: null,
    currentPathIdx: -1,
    waiting: true,
  },
  setPlaybackState: (playbackState) => set({ playbackState }),
  rendererState: {
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  },
  setRendererState: (rendererState) => set({ rendererState }),

  // results state
  trajectories: {},
  setTrajectories: (trajectories) => set({ trajectories }),
}));
