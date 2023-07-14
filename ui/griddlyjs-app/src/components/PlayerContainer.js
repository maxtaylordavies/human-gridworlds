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
// import { EmojiBubble } from "./EmojiBubble";

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

  const onPlaybackEnd = () => {
    setExpState({ ...expState, replayIdx: expState.replayIdx + 1 });
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

    let levelId = utils.currentLevelId(expState);
    if (levelId === null) {
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

  const startPos = utils.currentStartPos(expState);
  const nameBadgePos = utils.computeNameBadgePos(expState, gameState);
  const replay = utils.currentReplay(expState);

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
            {/* <EmojiBubble
              pos={{
                left: nameBadgePos.left + 60,
                top: nameBadgePos.top - 45,
              }}
            /> */}
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
              trajectoryString={replay?.trajectory || ""}
              startPos={startPos}
              levelIdx={expState.levelIdx}
              replayIdx={expState.replayIdx}
              waitToBeginPlayback={
                uiState.showPhaseInstructions ||
                uiState.showAgentPopup ||
                uiState.showQuiz ||
                uiState.showScorePopup ||
                uiState.showTextResponseModal
              }
              onPlaybackEnd={onPlaybackEnd}
              beforePlaybackMs={INTER_SCENE_INTERVAL_MS}
              afterPlaybackMs={LINGER_ON_GOAL_MS}
              stepIntervalMs={replay?.stepInterval || INTER_STEP_INTERVAL_MS}
              disableInput={
                uiState.showPhaseInstructions ||
                uiState.showAgentPopup ||
                uiState.showQuiz ||
                uiState.showScorePopup ||
                uiState.showTextResponseModal ||
                replay !== null
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
