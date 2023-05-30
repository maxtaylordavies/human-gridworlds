import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import yaml from "js-yaml";

import * as api from "./api";
import * as utils from "./utils";
import { useStore } from "./store";
import { hashString } from "./hash";
import { INTER_LEVEL_INTERVAL_MS, INTER_AGENT_INTERVAL_MS } from "./constants";
import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import InfoBar from "./components/InfoBar";
import InstructionModal from "./components/InstructionModal";
import ExperimentCompleteModal from "./components/ExperimentCompleteModal";
import LevelPopup from "./components/LevelPopup";
import QuizModal from "./components/QuizModal";
import "./App.scss";

const App = () => {
  // create and initialise an instance of the GriddlyJS core
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  // get state from zustand store
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const [gameState, setGameState] = useStore((state) => [
    state.gameState,
    state.setGameState,
  ]);
  const [playbackState, setPlaybackState] = useStore((state) => [
    state.playbackState,
    state.setPlaybackState,
  ]);
  const [rendererState, setRendererState] = useStore((state) => [
    state.rendererState,
    state.setRendererState,
  ]);
  const [trajectories, setTrajectories] = useStore((state) => [
    state.trajectories,
    state.setTrajectories,
  ]);

  // create refs for state values that will be updated inside callback functions
  const phaseIdxRef = useRef();
  phaseIdxRef.current = expState.phaseIdx;
  const levelIdxRef = useRef();
  levelIdxRef.current = expState.levelIdx;
  const trajectoriesRef = useRef();
  trajectoriesRef.current = trajectories;

  useEffect(() => {
    performSetUp();
  }, []);

  useEffect(() => {
    console.log("session: ", expState.session);
    if (expState.session) {
      // fetch data
      fetchData();
      // initialise trajectories
      // setTrajectories(session.levels.reduce((o, l) => ({ ...o, [l]: [] }), {}));
      setTrajectories({});
    }
  }, [expState.session]);

  useEffect(() => {
    if (!gameState.gdy) {
      return;
    }

    const goalImages = gameState.gdy.Objects.filter((obj) =>
      obj.Name.includes("goal")
    ).map((obj) => obj.Observers.Sprite2D[0].Image);
    setGameState({ ...gameState, goalImages });

    loadLevel();
  }, [gameState.gdy]);

  useEffect(() => {
    // if we've run through all the levels specified in the session,
    // then finish the experiment
    if (
      expState.session &&
      levelIdxRef.current >= expState.session.levels.length
    ) {
      setUIState({ ...uiState, showFinishedScreen: true });
      // otherwise, load the next level
    } else if (gameState.gdy) {
      loadLevel();
      updatePathsToShow();
    }
  }, [levelIdxRef.current]);

  useEffect(() => {
    updatePathsToShow();
  }, [expState.session, expState.agentPaths]);

  useEffect(() => {
    if (playbackState.pathsToShow?.length > 0) {
      updateCurrentPathIdx();
    }
  }, [playbackState.pathsToShow]);

  useEffect(() => {
    if (!uiState.showQuiz && !uiState.showInitialInstructions) {
      nextLevel();
    }
  }, [uiState.showQuiz]);

  useEffect(() => {
    const onFinished = async () => {
      await uploadTrajectories();
      await uploadFinalScore();
      utils.removeFromLocalStorage("sid");
    };

    // if gameplay is showFinishedScreen, we can upload the trajectories and final score
    // and remove the session id from localstorage
    if (uiState.showFinishedScreen) {
      onFinished();
    }
  }, [uiState.showFinishedScreen]);

  // initialise griddly, create a session on the server, and
  // then store the session in local state
  const performSetUp = async () => {
    const onSession = (sess) => {
      console.log("sess: ", sess);
      setExpState({ ...expState, session: sess });
      utils.writeToLocalStorage("sid", sess.id);
      utils.writeToLocalStorage("eid", sess.experimentId);
    };

    await griddlyjs.init().then(() => {
      console.log("griddlyjs initialised");

      // check for existing session_id in url or localstorage
      // if we find one, then get the corresponding session from
      // the server (rather than creating a new session)
      const sid = utils.getValueFromUrlOrLocalstorage("sid");
      if (sid) {
        console.log(`found session_id ${sid}, retrieving`);
        api.getSession(sid, onSession, console.Error);
      } else {
        // otherwise, we create a new session on the server, passing
        // in existing experiment_id and human_id if they exist
        api.createSession(
          utils.getValueFromUrlOrLocalstorage("eid"),
          utils.getProlificMetadata(),
          onSession,
          console.error
        );
      }
    });
  };

  // fetch the game spec file and the expert agents' trajectory data
  const fetchData = async () => {
    if (!expState.session) {
      return;
    }
    api.loadGameSpec(expState.session.griddlySpecName, (gdy) => {
      loadGame(setRewards(gdy));
      api.loadAgentPaths(expState.session, (paths) => {
        setExpState({ ...expState, agentPaths: paths });
      });
    });
  };

  const setRewards = (gdy) => {
    // let u = session.utility["terrains"].concat(session.utility["goals"]);
    // let j = 0;

    // gdy.Actions[0].Behaviours = gdy.Actions[0].Behaviours.map((b) => {
    //   let src = {
    //     ...b.Src,
    //     Commands: b.Src.Commands.map((cmd) =>
    //       cmd.reward === undefined ? cmd : { reward: u[j++] }
    //     ),
    //   };
    //   return { ...b, Src: src };
    // });

    return gdy;
  };

  // load the game spec into griddly
  const loadGame = async (gdy) => {
    const gdyString = yaml.dump(gdy, { noRefs: true });
    griddlyjs.unloadGDY();
    griddlyjs.loadGDY(gdyString);
    loadRenderers(gdy);

    setGameState({
      ...gameState,
      gdy,
      gdyString,
      gdyHash: hashString(gdyString),
    });
  };

  // load the map for the current level
  const loadLevel = async () => {
    griddlyjs.reset(
      gameState.gdy.Environment.Levels[
        expState.session.levels[levelIdxRef.current]
      ]
    );
  };

  const updatePathsToShow = () => {
    if (expState.session && expState.agentPaths) {
      if (expState.session.levels && expState.agentPaths.paths) {
        setPlaybackState({
          ...playbackState,
          pathsToShow:
            expState.agentPaths.paths[
              expState.session.levels[levelIdxRef.current]
            ] || [],
        });
      }
    }
  };

  const updateCurrentPathIdx = () => {
    let i = playbackState.currentPathIdx + 1;

    while (i < playbackState.pathsToShow.length) {
      if (playbackState.pathsToShow[i]) {
        break;
      }
      i += 1;
    }

    if (i >= playbackState.pathsToShow.length) {
      i = -1;
      setGameState({ ...gameState, playing: true });
    }

    setPlaybackState({ ...playbackState, currentPathIdx: i });
  };

  const loadRenderers = (gdy) => {
    const renderers = utils.findCompatibleRenderers(
      gdy.Environment.Observers || {},
      gdy.Objects
    );

    const [rendererName] = renderers.keys();
    const rendererConfig = renderers.get(rendererName);

    setRendererState({
      renderers: renderers,
      rendererName: rendererName,
      rendererConfig: rendererConfig,
    });
  };

  const onTrajectoryStep = (step) => {
    if (uiState.showFinishedScreen) {
      return;
    }

    let traj = { ...trajectoriesRef.current };
    traj[expState.session.levels[levelIdxRef.current]].push(step);
    setTrajectories(traj);
  };

  const uploadTrajectories = async () => {
    let traj = { ...trajectoriesRef.current };
    Object.keys(traj).forEach((k) => {
      traj[k] = traj[k].map((x) => x[1]).join(",");
    });
    await api.storeTrajectories(expState.session, traj);
  };

  const uploadFinalScore = async () => {
    await api.storeFinalScore(expState.session, gameState.score);
  };

  const uploadFreeTextResponse = async (response) => {
    await api.storeFreeTextResponse(expState.session, response);
  };

  const onPlaybackStart = () => {
    setGameState({ ...gameState, playing: false });
  };

  const nextLevel = () => {
    setExpState({
      ...expState,
      levelIdx: expState.levelIdx + 1,
    });
  };

  const onLevelComplete = () => {
    if (levelIdxRef.current === 0) {
      setUIState({ ...uiState, showQuiz: true });
    } else {
      nextLevel();
    }
  };

  const isReady = () => {
    return (
      expState.session !== null &&
      playbackState.pathsToShow !== null &&
      gameState.gdy !== null
    );
  };

  return !isReady() ? (
    <div>loading...</div>
  ) : (
    <div className="main-container">
      {!uiState.showInitialInstructions && (
        <motion.div
          className="game-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: uiState.showFinishedScreen ? 0.1 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <InfoBar />
          <Player
            gdyHash={gameState.gdyHash}
            gdy={gameState.gdy}
            levelId={utils.currentLevelId(expState)}
            avatarPath={
              expState.session.agentAvatars[
                expState.session.agentIds[playbackState.currentPathIdx]
              ] || "sprite2d/player.png"
            }
            griddlyjs={griddlyjs}
            rendererState={rendererState}
            onTrajectoryStep={onTrajectoryStep}
            onReward={(val) => {
              if (levelIdxRef.current > 0) {
                setGameState({
                  ...gameState,
                  score: gameState.score + val,
                });
              }
            }}
            onLevelComplete={onLevelComplete}
            trajectoryString={
              playbackState.currentPathIdx < playbackState.pathsToShow.length
                ? playbackState.pathsToShow[playbackState.currentPathIdx]
                : ""
            }
            waitToBeginPlayback={uiState.showLevelPopup}
            onPlaybackStart={onPlaybackStart}
            onPlaybackEnd={updateCurrentPathIdx}
            beforePlaybackMs={INTER_AGENT_INTERVAL_MS}
          />
        </motion.div>
      )}
      <InstructionModal />
      <LevelPopup duration={INTER_LEVEL_INTERVAL_MS} delay={250} />
      <QuizModal />
      <ExperimentCompleteModal submitResponse={uploadFreeTextResponse} />
    </div>
  );
};

export default App;
