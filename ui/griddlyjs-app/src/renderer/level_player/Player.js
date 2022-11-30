import { React, Component } from "react";
import Phaser from "phaser";

import HumanPlayerScene from "./scenes/HumanPlayerScene";
import LoadingScene from "../LoadingScene";

class Player extends Component {
  updateCanvasSize = () => {
    this.game.scale.resize(this.props.width, this.props.height);
  };

  componentDidMount() {
    const config = {
      type: Phaser.AUTO,
      parent: this.divElement,
      backgroundColor: "#000000",
      scale: {
        expandParent: false,
      },
      scene: [LoadingScene, HumanPlayerScene],
    };

    this.game = new Phaser.Game(config);
    this.updateCanvasSize();

    if (this.props.griddlyjs && this.props.gdy) {
      this.game.scene.remove("LoadingScene");
      this.game.scene.start("HumanPlayerScene", {
        gdy: this.props.gdy,
        avatarPath: this.props.avatarPath,
        occlusionWindow: this.props.occlusionWindow,
        rendererConfig: this.props.rendererConfig,
        rendererName: this.props.rendererName,
        griddlyjs: this.props.griddlyjs,
        onTrajectoryStep: this.props.onTrajectoryStep,
        onReward: this.props.onReward,
        onLevelComplete: this.props.onLevelComplete,
        trajectoryString: this.props.trajectoryString,
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
        prevProps.occlusionWindow !== this.props.occlusionWindow ||
        prevProps.beforePlaybackMs !== this.props.beforePlaybackMs
      ) {
        this.game.scene.getScene("HumanPlayerScene").scene.restart({
          gdy: this.props.gdy,
          avatarPath: this.props.avatarPath,
          occlusionWindow: this.props.occlusionWindow,
          rendererConfig: this.props.rendererConfig,
          rendererName: this.props.rendererName,
          griddlyjs: this.props.griddlyjs,
          onTrajectoryStep: this.props.onTrajectoryStep,
          onReward: this.props.onReward,
          onLevelComplete: this.props.onLevelComplete,
          trajectoryString: this.props.trajectoryString,
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
