import React, { useEffect } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import * as utils from "../utils";
import { INTER_LEVEL_INTERVAL_MS, INTER_AGENT_INTERVAL_MS } from "../constants";
import Player from "../renderer/Player";
import InfoBar from "./InfoBar";

const PlayerContainer = ({ griddlyjs }) => {
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
    // // if we've run through all the levels specified in the session,
    // // then finish the experiment
    // if (
    //   expState.session &&
    //   levelIdxRef.current >= expState.session.levels.length
    // ) {
    //   setUIState({ ...uiState, showFinishedScreen: true });
    //   // otherwise, load the next level
    // } else if (gameState.gdy) {
    //   loadLevel();
    //   updatePathsToShow();
    // }
  }, [expState.levelIdx]);

  useEffect(() => {
    if (playbackState.pathsToShow?.length > 0) {
      updateCurrentPathIdx();
    }
  }, [playbackState.pathsToShow]);

  // load the map for the current level
  const loadLevel = async () => {
    // griddlyjs.reset(
    //   gameState.gdy.Environment.Levels[
    //     expState.session.levels[levelIdxRef.current]
    //   ]
    // );
  };

  const incrementLevelIdx = () => {
    setExpState({
      ...expState,
      levelIdx: expState.levelIdx + 1,
    });
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

  const onLevelComplete = () => {
    // if (levelIdxRef.current === 0) {
    //   setUIState({ ...uiState, showQuiz: true });
    // } else {
    //   incrementLevelIdx();
    // }
    incrementLevelIdx();
  };

  const onPlaybackStart = () => {
    setGameState({ ...gameState, playing: false });
  };

  const onTrajectoryStep = (step) => {
    if (uiState.showFinishedScreen) {
      return;
    }

    let traj = { ...trajectories };
    traj[expState.session.levels[expState.levelIdx]].push(step);
    setTrajectories(traj);
  };

  return (
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
        // avatarPath={
        //   expState.session.agentAvatars[
        //     expState.session.agentIds[playbackState.currentPathIdx]
        //   ] || "sprite2d/player.png"
        // }
        avatarPath={"sprite2d/player.png"}
        griddlyjs={griddlyjs}
        rendererState={rendererState}
        onTrajectoryStep={onTrajectoryStep}
        onReward={(val) => {
          setGameState({
            ...gameState,
            score: gameState.score + val,
          });
        }}
        onLevelComplete={onLevelComplete}
        // trajectoryString={
        //   playbackState.currentPathIdx < playbackState.pathsToShow.length
        //     ? playbackState.pathsToShow[playbackState.currentPathIdx]
        //     : ""
        // }
        trajectoryString={""}
        waitToBeginPlayback={uiState.showLevelPopup}
        onPlaybackStart={onPlaybackStart}
        onPlaybackEnd={updateCurrentPathIdx}
        beforePlaybackMs={INTER_AGENT_INTERVAL_MS}
      />
    </motion.div>
  );
};

export default PlayerContainer;
