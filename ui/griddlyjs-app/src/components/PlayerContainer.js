import React, { useEffect } from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import * as utils from "../utils";
import { INTER_LEVEL_INTERVAL_MS, INTER_AGENT_INTERVAL_MS } from "../constants";
import { PlayButton } from "./PlayButton";
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
  const updateScore = useStore((state) => state.updateScore);
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

  // load the map for the current level
  const loadLevel = async () => {
    // griddlyjs.reset(
    //   gameState.gdy.Environment.Levels[
    //     expState.session.levels[levelIdxRef.current]
    //   ]
    // );
  };

  const onPlaybackEnd = () => {
    console.log("onPlaybackEnd");
    setExpState({ ...expState, replayIdx: expState.replayIdx + 1 });
  };

  const onLevelComplete = () => {
    setExpState({
      ...expState,
      levelIdx: expState.levelIdx + 1,
    });
  };

  const onPlaybackStart = () => {
    setGameState({ ...gameState, playing: false });
  };

  const onTrajectoryStep = (step) => {
    if (uiState.showFinishedScreen) {
      return;
    }

    let levelId = utils.currentLevelId(expState);
    if (levelId === null) {
      return;
    }

    let traj = { ...trajectories };
    if (!(levelId in traj)) {
      traj[levelId] = [];
    }

    traj[levelId].push(step);
    setTrajectories(traj);
  };

  const computeNameBadgePos = (agentPos) => {
    const left = 190 + agentPos.x * 60;
    const top = 95 + agentPos.y * 60 - 30;
    return { left, top };
  };

  const showPlayButton = uiState.showPlayButton && !gameState.playing;

  let opacity = 1;
  if (
    uiState.showPhaseInstructions ||
    uiState.showFinishedScreen ||
    uiState.showQuiz
  ) {
    opacity = 0;
  } else if (showPlayButton) {
    opacity = 0.5;
  }

  const nameBadgePos = computeNameBadgePos(gameState.agentPos);

  return (
    <motion.div className="game-container">
      <PlayButton />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity }}
        transition={{ duration: 0.1 }}
      >
        <InfoBar />
        <div>
          <div
            style={{
              width: 60,
              height: 24,
              position: "absolute",
              left: nameBadgePos.left,
              top: nameBadgePos.top,
              backgroundColor: "#007458",
              color: "white",
              borderRadius: 5,
              zIndex: 100,
            }}
          >
            {gameState.playing ? "You" : utils.getAgentName(expState)}
          </div>
          <Player
            gdyHash={gameState.gdyHash}
            gdy={gameState.gdy}
            levelId={utils.currentLevelId(expState)}
            avatarPath={utils.currentAvatarImg(expState)}
            hideGoals={utils.shouldHideGoals(expState)}
            griddlyjs={griddlyjs}
            rendererState={rendererState}
            onTrajectoryStep={onTrajectoryStep}
            onPlayerPosChange={(pos) => {
              setGameState({ ...gameState, agentPos: pos });
            }}
            onReward={updateScore}
            onLevelComplete={onLevelComplete}
            trajectoryString={utils.currentPlaybackTrajectory(expState)}
            waitToBeginPlayback={
              uiState.showPhaseInstructions || uiState.showPlayButton
            }
            onPlaybackStart={onPlaybackStart}
            onPlaybackEnd={onPlaybackEnd}
            beforePlaybackMs={INTER_AGENT_INTERVAL_MS}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerContainer;
