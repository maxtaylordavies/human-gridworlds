import React from "react";
import { motion } from "framer-motion";

import { useStore } from "../store";
import * as utils from "../utils";
import {
  INTER_STEP_INTERVAL_MS,
  INTER_SCENE_INTERVAL_MS,
  LINGER_ON_GOAL_MS,
} from "../constants";
import Player from "../renderer/Player";
import InfoBar from "./InfoBar";
import RewardHistory from "./RewardHistory";
import ScorePopup from "./ScorePopup";

const PlayerContainer = ({ griddlyjs }) => {
  const uiState = useStore((state) => state.uiState);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const gameState = useStore((state) => state.gameState);
  const updateScore = useStore((state) => state.updateScore);
  const updateAgentPos = useStore((state) => state.updateAgentPos);
  const updateItemHistory = useStore((state) => state.updateItemHistory);
  const rendererState = useStore((state) => state.rendererState);
  const updateTrajectory = useStore((state) => state.updateTrajectory);

  const onSimulationEnd = () => {
    // setExpState({ ...expState, replayIdx: expState.replayIdx + 1 });
  };

  const onLevelComplete = () => {
    setExpState({
      ...expState,
      levelIdx: expState.levelIdx + 1,
    });
  };

  const onTrajectoryStep = (step) => {
    if (uiState.showFinishedScreen) {
      return;
    }

    let level = utils.currentLevel(expState);
    if (level === null) {
      return;
    }

    updateTrajectory(expState.phaseIdx, expState.levelIdx, step);
  };

  let opacity = 1;
  if (uiState.showPhaseInstructions || uiState.showFinishedScreen) {
    opacity = 0;
  } else if (
    uiState.showQuiz ||
    uiState.showAgentPopup ||
    uiState.showScorePopup ||
    uiState.showTextResponseModal
  ) {
    opacity = 0.1;
  }

  const simAgent = utils.currentSimAgent(expState);
  const startPos = utils.currentStartPos(expState);
  const nameBadgePos = utils.computeNameBadgePos(expState, gameState);

  return (
    <motion.div className="game-container">
      <ScorePopup />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity }}
        transition={{ duration: 0.1 }}
        style={{ display: "flex" }}
      >
        <div>
          <InfoBar />
          <div>
            <div
              className="name-badge"
              style={{
                left: nameBadgePos.left,
                top: nameBadgePos.top,
              }}
            >
              {utils.currentAgentName(expState)}
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
              onPlayerPosChange={updateAgentPos}
              onReward={updateScore}
              onGoalReached={updateItemHistory}
              onLevelComplete={onLevelComplete}
              startPos={startPos}
              simAgent={simAgent}
              levelIdx={expState.levelIdx}
              waitToBeginSimulation={
                uiState.showPhaseInstructions ||
                uiState.showAgentPopup ||
                uiState.showQuiz ||
                uiState.showScorePopup ||
                uiState.showTextResponseModal
              }
              onSimulationEnd={onSimulationEnd}
              beforeSimulationMs={INTER_SCENE_INTERVAL_MS}
              afterSimulationMs={LINGER_ON_GOAL_MS}
              stepIntervalMs={INTER_STEP_INTERVAL_MS}
              disableInput={
                uiState.showPhaseInstructions ||
                uiState.showAgentPopup ||
                uiState.showQuiz ||
                uiState.showScorePopup ||
                uiState.showTextResponseModal
              }
            />
          </div>
        </div>
      </motion.div>
      <RewardHistory />
    </motion.div>
  );
};

export default PlayerContainer;
