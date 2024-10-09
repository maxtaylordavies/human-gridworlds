import React, { Component } from "react";
import Phaser from "phaser";

import { LoadingScene, PlayerScene } from "./Scene";

class Player extends Component {
  constructor(props) {
    super(props);
    this.divElement = React.createRef();
    this.width = 800;
    this.height = 600;
  }

  updateCanvasSize = () => {
    this.game.scale.resize(this.width, this.height);
  };

  posEqual = (pos1, pos2) => {
    if (!pos1 && !pos2) return true;
    if (!pos1 || !pos2) return false;
    return pos1.x === pos2.x && pos1.y === pos2.y;
  };

  componentDidMount() {
    const config = {
      type: Phaser.AUTO,
      parent: this.divElement,
      backgroundColor: "#000000",
      scale: {
        expandParent: false,
      },
      scene: [LoadingScene, PlayerScene],
    };

    this.game = new Phaser.Game(config);
    this.updateCanvasSize();

    if (this.props.griddlyjs && this.props.gdy) {
      this.game.scene.remove("LoadingScene");
      this.game.scene.start("PlayerScene", {
        gdy: this.props.gdy,
        levelId: this.props.levelId,
        avatarPath: this.props.avatarPath,
        hideGoals: this.props.hideGoals,
        rendererState: this.props.rendererState,
        griddlyjs: this.props.griddlyjs,
        onTrajectoryStep: this.props.onTrajectoryStep,
        onPlayerPosChange: this.props.onPlayerPosChange,
        onReward: this.props.onReward,
        onGoalReached: this.props.onGoalReached,
        onLevelComplete: this.props.onLevelComplete,
        startPos: this.props.startPos,
        simAgent: this.props.simAgent,
        waitToBeginSimulation: this.props.waitToBeginSimulation,
        onSimulationEnd: this.props.onSimulationEnd,
        beforeSimulationMs: this.props.beforeSimulationMs,
        afterSimulationMs: this.props.afterSimulationMs,
        stepIntervalMs: this.props.stepIntervalMs,
        disableInput: this.props.disableInput,
      });
    }
  }

  componentDidUpdate(prevProps) {
    this.updateCanvasSize();
    if (this.props.griddlyjs) {
      if (
        prevProps.levelId !== this.props.levelId ||
        prevProps.gdyHash !== this.props.gdyHash ||
        prevProps.avatarPath !== this.props.avatarPath ||
        prevProps.hideGoals !== this.props.hideGoals ||
        prevProps.levelIdx !== this.props.levelIdx ||
        !this.posEqual(prevProps.startPos, this.props.startPos) ||
        prevProps.simAgent !== this.props.simAgent ||
        prevProps.waitToBeginSimulation !== this.props.waitToBeginSimulation ||
        prevProps.beforeSimulationMs !== this.props.beforeSimulationMs ||
        prevProps.stepIntervalMs !== this.props.stepIntervalMs ||
        prevProps.disableInput !== this.props.disableInput
      ) {
        this.game.scene.getScene("PlayerScene").scene.restart({
          gdy: this.props.gdy,
          levelId: this.props.levelId,
          avatarPath: this.props.avatarPath,
          hideGoals: this.props.hideGoals,
          rendererState: this.props.rendererState,
          griddlyjs: this.props.griddlyjs,
          onTrajectoryStep: this.props.onTrajectoryStep,
          onPlayerPosChange: this.props.onPlayerPosChange,
          onReward: this.props.onReward,
          onGoalReached: this.props.onGoalReached,
          onLevelComplete: this.props.onLevelComplete,
          startPos: this.props.startPos,
          simAgent: this.props.simAgent,
          waitToBeginSimulation: this.props.waitToBeginSimulation,
          onSimulationEnd: this.props.onSimulationEnd,
          beforeSimulationMs: this.props.beforeSimulationMs,
          afterSimulationMs: this.props.afterSimulationMs,
          stepIntervalMs: this.props.stepIntervalMs,
          disableInput: this.props.disableInput,
        });
      }
    }
  }

  render() {
    return (
      <div
        ref={(divElement) => {
          this.divElement = divElement;
        }}
      ></div>
    );
  }
}

export default Player;
