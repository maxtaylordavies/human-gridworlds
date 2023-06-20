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
  const updateScore = useStore((state) => state.updateScore);
  const [rendererState, setRendererState] = useStore((state) => [
    state.rendererState,
    state.setRendererState,
  ]);
  const [trajectories, setTrajectories] = useStore((state) => [
    state.trajectories,
    state.setTrajectories,
  ]);

  const onPlaybackEnd = () => {
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
    const top = 75 + agentPos.y * 60;
    return { left, top };
  };

  let opacity = 1;
  if (
    uiState.showPhaseInstructions ||
    uiState.showFinishedScreen ||
    uiState.showQuiz
  ) {
    opacity = 0;
  } else if (uiState.showAgentPopup) {
    opacity = 0.2;
  }

  const nameBadgePos = computeNameBadgePos(gameState.agentPos);

  return (
    <motion.div className="game-container">
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
              uiState.showPhaseInstructions || uiState.showAgentPopup
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
