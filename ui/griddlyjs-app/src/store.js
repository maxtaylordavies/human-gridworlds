import { create } from "zustand";

import * as utils from "./utils";

export const useStore = create((set) => ({
  // general UI state
  uiState: {
    showInitialInstructions: true,
    showPhaseInstructions: false,
    showQuiz: false,
    showAgentPopup: false,
    showScorePopup: false,
    showTextResponseModal: false,
    showFinishedScreen: false,
  },
  setUiState: (uist) =>
    set((state) => {
      // if showScorePopup is being set to false, don't do anything else!
      if (!uist.showScorePopup && state.uiState.showScorePopup) {
        return { uiState: { ...state.uiState, showScorePopup: false } };
      }

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
        const playing = exp.session.phases[exp.phaseIdx].agents.length === 0;
        return {
          uiState: {
            ...uist,
            showAgentPopup: !playing,
          },
          expState: exp,
          gameState: { ...state.gameState, playing: playing },
        };
      }

      // if showTextResponseModal is being set to false, show either phaseInstructions or experimentFinished
      if (!uist.showTextResponseModal && state.uiState.showTextResponseModal) {
        if (
          state.expState.phaseIdx >=
          state.expState.session.phases.length - 1
        ) {
          return {
            uiState: { ...uist, showFinishedScreen: true },
          };
        }
        return {
          uiState: { ...uist, showPhaseInstructions: true },
        };
      }

      return { uiState: uist };
    }),

  // experiment/session state
  expState: {
    session: null, // session object
    phaseIdx: 0, // index of phase we're in
    levelIdx: 0, // index of level we're in (within the current phase)
    startPosIdx: 0, // index of start position we're in (within the current level)
    agentIdx: 0, // index of simulated agent we're showing (within the current level)
  },
  setExpState: (est) =>
    set((state) => {
      let uist = { ...state.uiState };
      let gst = { ...state.gameState };

      // // if replayIdx is being incremented, check if we're at the end of the
      // // replays for the current agent - if so, show the quiz
      // if (est.replayIdx > state.expState.replayIdx) {
      //   const phase = est.session.phases[est.phaseIdx];
      //   if (est.replayIdx >= phase.agentReplays[est.agentIdx].replays.length) {
      //     if (phase.objectsHidden) {
      //       est.agentIdx += 1;
      //     } else {
      //       uist.showQuiz = true;
      //     }
      //   }
      // }

      if (est.startPosIdx > state.expState.startPosIdx) {
        const phase = est.session.phases[est.phaseIdx];
        const level = phase.levels[est.levelIdx];

        const allStartsDone =
          level.startPositions === null ||
          est.startPosIdx >= level.startPositions.length;

        if (allStartsDone) {
          est.startPosIdx = 0;
          if (state.gameState.playing) {
            est.levelIdx += 1;
          } else {
            est.agentIdx += 1;
            // if (phase.objectsHidden) {
            //   est.agentIdx += 1;
            // } else {
            //   uist.showQuiz = true;
            // }
          }
        }
      }

      // if agentIdx is being incremented, check if we're at the end of the
      // agents for the current level. if we're not, set startPosIdx to 0 and
      // continue. if we are, check if it's an interactive phase. if it is,
      // set playing to true; otherwise, increment phaseIdx
      if (est.agentIdx > state.expState.agentIdx) {
        const phase = est.session.phases[est.phaseIdx];
        if (est.agentIdx >= phase.agents.length) {
          if (phase.interactive) {
            return {
              expState: est,
              gameState: { ...gst, playing: true },
              uiState: uist,
            };
          }
          est.levelIdx += 1;
        } else {
          uist.showAgentPopup = true;
        }
      }

      // if levelIdx is being incremented, check if we're at the end of the
      // current phase. if we are, and it's the first phase, then show the
      // quiz; otherwise, increment phaseIdx
      if (est.levelIdx > state.expState.levelIdx) {
        est.startPosIdx = 0;
        est.agentIdx = 0;

        const phase = est.session.phases[est.phaseIdx];
        if (est.levelIdx >= phase.levels.length) {
          est.levelIdx = 0;
          // if (est.phaseIdx === 0) {
          //   return {
          //     uiState: { ...uist, showQuiz: true },
          //   };
          // }
          est.phaseIdx += 1;
        } else if (phase.agents.length > 0) {
          gst.playing = false;
        }
      }

      // if phaseIdx is being incremented, first check if we've
      // reached the end of the experiment - otherwise reset
      // levelIdx to 0 and set showPhaseInstructions to true
      if (est.phaseIdx > state.expState.phaseIdx) {
        est = { ...est, levelIdx: 0, agentIdx: 0, startPosIdx: 0 };
        if (est.phaseIdx >= est.session.phases.length) {
          return {
            uiState: { ...state.uiState, showTextResponseModal: true },
          };
        } else if (est.phaseIdx === 3) {
          return {
            uiState: { ...state.uiState, showTextResponseModal: true },
            expState: est,
          };
        } else {
          return {
            uiState: { ...state.uiState, showPhaseInstructions: true },
            expState: est,
          };
        }
      }

      return { expState: est, uiState: uist, gameState: gst };
    }),

  // game state
  gameState: {
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: true,
    agentPos: { x: 0, y: 0 },
    score: 0,
    rewardHistory: [],
    itemHistory: [],
    agentHistory: [],
  },
  setGameState: (gst) =>
    set(() => {
      return { gameState: gst };
    }),
  updateScore: (delta) =>
    set((state) => {
      const rh = [...state.gameState.rewardHistory];
      const ah = [...state.gameState.agentHistory];

      const name = utils.currentAgentName(state.expState);
      const newScore =
        name === "you" ? state.gameState.score + delta : state.gameState.score;

      if (delta > 0) {
        rh.push(delta);
        ah.push({
          name,
          phi: utils.currentPhi(state.expState),
        });
      }
      return {
        gameState: {
          ...state.gameState,
          score: newScore,
          rewardHistory: rh,
          agentHistory: ah,
        },
      };
    }),
  updateAgentPos: (pos) =>
    set((state) => {
      return {
        gameState: { ...state.gameState, agentPos: pos },
      };
    }),
  updateItemHistory: (item) =>
    set((state) => {
      if (utils.shouldHideGoals(state.expState)) {
        item = "mystery-box";
      }
      return {
        gameState: {
          ...state.gameState,
          itemHistory: [...state.gameState.itemHistory, item],
        },
      };
    }),
  updateAgentEmoji: (emoji) =>
    set((state) => {
      return {
        gameState: {
          ...state.gameState,
        },
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
  resultsState: {
    trajectories: {},
    quizResponses: {},
    textResponses: [],
  },
  updateTrajectory: (agentName, phaseIdx, levelIdx, startPosIdx, step) =>
    set((state) => {
      const trajectories = { ...state.resultsState.trajectories };
      if (!(agentName in trajectories)) {
        trajectories[agentName] = {};
      }
      if (!(phaseIdx in trajectories[agentName])) {
        trajectories[agentName][phaseIdx] = {};
      }
      if (!(levelIdx in trajectories[agentName][phaseIdx])) {
        trajectories[agentName][phaseIdx][levelIdx] = {};
      }
      if (!(startPosIdx in trajectories[agentName][phaseIdx][levelIdx])) {
        trajectories[agentName][phaseIdx][levelIdx][startPosIdx] = [];
      }
      trajectories[agentName][phaseIdx][levelIdx][startPosIdx].push(step);
      return {
        resultsState: { ...state.resultsState, trajectories: trajectories },
      };
    }),
  saveQuizResponse: (agent, response) =>
    set((state) => {
      const qr = { ...state.resultsState.quizResponses };
      if (!(agent in qr)) {
        qr[agent] = [];
      }
      qr[agent].push(response);
      return {
        resultsState: { ...state.resultsState, quizResponses: qr },
      };
    }),
  saveTextResponse: (response) =>
    set((state) => {
      const resps = [...state.resultsState.textResponses];
      resps.push(response);
      return {
        resultsState: { ...state.resultsState, textResponses: resps },
      };
    }),
}));
