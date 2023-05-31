import React, { Component } from "react";
import Phaser from "phaser";

import { LoadingScene, PlayerScene } from "./Scene";

class Player extends Component {
  constructor(props) {
    super(props);
    this.divElement = React.createRef();
    this.width = 800;
    this.height = 500;
  }

  updateCanvasSize = () => {
    this.game.scale.resize(this.width, this.height);
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
        rendererState: this.props.rendererState,
        griddlyjs: this.props.griddlyjs,
        onTrajectoryStep: this.props.onTrajectoryStep,
        onReward: this.props.onReward,
        onLevelComplete: this.props.onLevelComplete,
        trajectoryString: this.props.trajectoryString,
        waitToBeginPlayback: this.props.waitToBeginPlayback,
        onPlaybackStart: this.props.onPlaybackStart,
        onPlaybackEnd: this.props.onPlaybackEnd,
        beforePlaybackMs: this.props.beforePlaybackMs,
      });
    }
  }

  componentDidUpdate(prevProps) {
    this.updateCanvasSize();
    if (this.props.griddlyjs) {
      if (
        prevProps.gdyHash !== this.props.gdyHash ||
        prevProps.avatarPath !== this.props.avatarPath ||
        prevProps.trajectoryString !== this.props.trajectoryString ||
        prevProps.waitToBeginPlayback !== this.props.waitToBeginPlayback ||
        prevProps.beforePlaybackMs !== this.props.beforePlaybackMs
      ) {
        this.game.scene.getScene("PlayerScene").scene.restart({
          gdy: this.props.gdy,
          levelId: this.props.levelId,
          avatarPath: this.props.avatarPath,
          rendererState: this.props.rendererState,
          griddlyjs: this.props.griddlyjs,
          onTrajectoryStep: this.props.onTrajectoryStep,
          onReward: this.props.onReward,
          onLevelComplete: this.props.onLevelComplete,
          trajectoryString: this.props.trajectoryString,
          waitToBeginPlayback: this.props.waitToBeginPlayback,
          onPlaybackStart: this.props.onPlaybackStart,
          onPlaybackEnd: this.props.onPlaybackEnd,
          beforePlaybackMs: this.props.beforePlaybackMs,
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
