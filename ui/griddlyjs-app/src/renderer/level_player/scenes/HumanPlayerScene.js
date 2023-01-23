import Phaser from "phaser";

import Block2DRenderer from "../../Block2DRenderer";
import Sprite2DRenderer from "../../Sprite2DRenderer";
import { COLOR_LOADING_TEXT } from "../../ThemeConsts";
import { INTER_STEP_INTERVAL_MS } from "../../../constants";

class HumanPlayerScene extends Phaser.Scene {
  constructor() {
    super("HumanPlayerScene");

    this.stateHash = 0;
    this.loaded = false;
    this.defaultTileSize = 24;
    this.levelStringOrId = "";

    this.keyboardIntervals = new Map();
  }

  init = (data) => {
    try {
      this.griddlyjs = data.griddlyjs;

      this.gridHeight = this.griddlyjs.getHeight();
      this.gridWidth = this.griddlyjs.getWidth();

      this.gdy = data.gdy;
      this.levelIdx = data.levelIdx;
      this.avatarPath = data.avatarPath;
      this.trajectoryString = data.trajectoryString;

      this.setPlayerPosAndImage();

      this.onTrajectoryStep = data.onTrajectoryStep;
      this.onReward = data.onReward;
      this.onLevelComplete = data.onLevelComplete;
      this.onPlaybackStart = data.onPlaybackStart;
      this.onPlaybackEnd = data.onPlaybackEnd;

      this.occlusionWindow =
        this.gdy.Environment.OcclusionWindows[this.levelIdx];
      this.occlusionPositions = [];
      if (this.occlusionWindow !== -1) {
        for (let x = 0; x < this.gridWidth; x++) {
          for (let y = 0; y < this.gridHeight; y++) {
            this.occlusionPositions.push({ x, y });
          }
        }
      }

      this.beforePlaybackMs = data.beforePlaybackMs;

      this.rendererName = data.rendererName;
      this.renderConfig = data.rendererConfig;

      this.avatarObject = this.gdy.Environment.Player.AvatarObject;

      if (this.renderConfig.Type === "BLOCK_2D") {
        this.grenderer = new Block2DRenderer(
          this,
          this.rendererName,
          this.renderConfig,
          this.avatarObject
        );
      } else if (this.renderConfig.Type === "SPRITE_2D") {
        this.grenderer = new Sprite2DRenderer(
          this,
          this.rendererName,
          this.renderConfig,
          this.avatarObject
        );
      }
    } catch (e) {
      this.displayError("Cannot load GDY file.", e);
    }

    this.renderData = {
      objects: {},
    };

    if (this.trajectoryString) {
      setTimeout(() => {
        this.beginPlayback();
      }, this.beforePlaybackMs);
    }
  };

  displayError = (message, error) => {
    console.error(message, error);
  };

  displayWarning = (message, error) => {
    console.warn(message, error);
  };

  setPlayerPosAndImage = () => {
    let rows;

    // if this is the first time this function is being called for
    // this level, we need to store the original location so we can
    // recover it when the demonstration phase is over
    if (this.playerPos === undefined) {
      rows = this.gdy.Environment.Levels[this.levelIdx].split("\n");
      rows.forEach((row, i) => {
        const j = row.indexOf("p");
        if (j !== -1) {
          this.playerPos = { y: i, x: j / (row.length / this.gridWidth) };
        }
      });
    }

    // if this.trajectoryString is a non-empty string, then we're in
    // demonstration phase rather than interactive phase
    const pos = this.trajectoryString
      ? this.gdy.Environment.DemonstratorStartPositions[this.levelIdx]
      : this.playerPos;

    // update the position
    rows = this.gdy.Environment.Levels[this.levelIdx]
      .replace("p", ".")
      .split("\n");

    const tmp = rows[pos.y].split("");
    tmp[pos.x * (tmp.length / this.gridWidth)] = "p";
    rows[pos.y] = tmp.join("");

    const levelStr = rows.join("\n");

    this.griddlyjs.reset(levelStr);
    this.gdy.Environment.Levels[this.levelIdx] = levelStr;

    // if this is the last time this function is being called
    // for this level, then set this.playerPos back to undefined
    if (this.playerPos && !this.trajectoryString) {
      this.playerPos = undefined;
    }

    // update the avatar image
    this.gdy.Objects[0].Observers.Sprite2D[0].Image = this.avatarPath;
  };

  updateState = (state) => {
    state = this.computeOcclusions(state);

    const newObjectIds = state.objects.map((object) => {
      return object.id;
    });

    this.grenderer.recenter(
      this.griddlyjs.getWidth(),
      this.griddlyjs.getHeight()
    );

    this.grenderer.beginUpdate(state.objects);

    state.objects.forEach((object) => {
      const objectTemplateName = object.name + object.renderTileId;
      if (object.id in this.renderData.objects) {
        const currentObjectData = this.renderData.objects[object.id];

        this.grenderer.updateObject(
          currentObjectData.sprite,
          object.name,
          objectTemplateName,
          object.location.x,
          object.location.y,
          object.orientation
        );

        this.renderData.objects[object.id] = {
          ...currentObjectData,
          object,
        };
      } else {
        const sprite = this.grenderer.addObject(
          object.name,
          objectTemplateName,
          object.location.x,
          object.location.y,
          object.orientation
        );

        this.renderData.objects[object.id] = {
          object,
          sprite,
        };
      }
    });

    for (const k in this.renderData.objects) {
      const id = this.renderData.objects[k].object.id;
      if (!newObjectIds.includes(id)) {
        this.renderData.objects[k].sprite.destroy();
        delete this.renderData.objects[k];
      }
    }
  };

  toMovementKey(vector) {
    return `${vector.x},${vector.y}`;
  }

  getGlobalVariableDebugText() {
    const globalVariables = this.griddlyjs.getGlobalVariables();

    const globalVariableDescription = [];
    const playerVariableDescription = [];
    for (const variableName in globalVariables) {
      const variableData = globalVariables[variableName];
      if (Object.keys(variableData).length === 1) {
        // We have a global variable
        const variableValue = variableData[0];
        globalVariableDescription.push(variableName + ": " + variableValue);
      } else {
        // We have a player variable
        if (this.griddlyjs.playerCount === 1) {
          const variableValue = variableData[1];
          playerVariableDescription.push(variableName + ": " + variableValue);
        } else {
          let variableValues = "";
          for (let p = 0; p < this.griddlyjs.playerCount; p++) {
            const variableValue = variableData[p + 1];
            variableValues += "\t" + (p + 1) + ": " + variableValue;
          }

          playerVariableDescription.push(variableName + ":" + variableValues);
        }
      }
    }

    return [
      "Global Variables:",
      ...globalVariableDescription,
      "",
      "Player Variables:",
      ...playerVariableDescription,
    ];
  }

  toggleVariableDebugModal() {
    this.variableDebugModalActive = !this.variableDebugModalActive;
    this.variableDebugModal.setVisible(this.variableDebugModalActive);
  }

  toggleControlsModal() {
    this.controlsModalActive = !this.controlsModalActive;
    this.controlsModal.setVisible(this.controlsModalActive);
  }

  setupKeyboardMapping = () => {
    const actionInputMappings = this.griddlyjs.getActionInputMappings();
    const actionNames = this.griddlyjs.getActionNames();

    const actionKeyOrder = [
      Phaser.Input.Keyboard.KeyCodes.THREE,
      Phaser.Input.Keyboard.KeyCodes.TWO,
      Phaser.Input.Keyboard.KeyCodes.ONE,
      Phaser.Input.Keyboard.KeyCodes.L,
      Phaser.Input.Keyboard.KeyCodes.O,
      Phaser.Input.Keyboard.KeyCodes.M,
      Phaser.Input.Keyboard.KeyCodes.K,
      Phaser.Input.Keyboard.KeyCodes.N,
      Phaser.Input.Keyboard.KeyCodes.J,
      Phaser.Input.Keyboard.KeyCodes.U,
      Phaser.Input.Keyboard.KeyCodes.B,
      Phaser.Input.Keyboard.KeyCodes.H,
      Phaser.Input.Keyboard.KeyCodes.Y,
      Phaser.Input.Keyboard.KeyCodes.V,
      Phaser.Input.Keyboard.KeyCodes.G,
      Phaser.Input.Keyboard.KeyCodes.T,
      Phaser.Input.Keyboard.KeyCodes.C,
      Phaser.Input.Keyboard.KeyCodes.F,
      Phaser.Input.Keyboard.KeyCodes.R,
      Phaser.Input.Keyboard.KeyCodes.Q,
      Phaser.Input.Keyboard.KeyCodes.E,
    ];

    const movementKeySets = [
      {
        "0,-1": Phaser.Input.Keyboard.KeyCodes.W,
        "-1,0": Phaser.Input.Keyboard.KeyCodes.A,
        "0,1": Phaser.Input.Keyboard.KeyCodes.S,
        "1,0": Phaser.Input.Keyboard.KeyCodes.D,
      },
      {
        "0,-1": Phaser.Input.Keyboard.KeyCodes.UP,
        "-1,0": Phaser.Input.Keyboard.KeyCodes.LEFT,
        "0,1": Phaser.Input.Keyboard.KeyCodes.DOWN,
        "1,0": Phaser.Input.Keyboard.KeyCodes.RIGHT,
      },
    ];

    this.keyMap = new Map();

    actionNames.forEach((actionName, actionTypeId) => {
      const actionMapping = actionInputMappings[actionName];
      if (!actionMapping.internal) {
        const inputMappings = Object.entries(actionMapping.inputMappings);

        const actionDirections = new Set();
        inputMappings.forEach((inputMapping) => {
          // check that all the vectorToDest are different
          const mapping = inputMapping[1];
          actionDirections.add(this.toMovementKey(mapping.vectorToDest));
        });

        const directional = actionDirections.size !== 1;

        if (directional && movementKeySets.length > 0) {
          // pop movement keys
          const movementKeys = movementKeySets.pop();

          inputMappings.forEach((inputMapping) => {
            const actionId = Number(inputMapping[0]);
            const mapping = inputMapping[1];

            let key;
            if (this.toMovementKey(mapping.vectorToDest) in movementKeys) {
              key = movementKeys[this.toMovementKey(mapping.vectorToDest)];
            } else if (
              this.toMovementKey(mapping.orientationVector) in movementKeys
            ) {
              key = movementKeys[this.toMovementKey(mapping.orientationVector)];
            }

            const mappedKey = this.input.keyboard.addKey(key, false);
            mappedKey.on("down", this.processUserKeydown);
            mappedKey.on("up", this.processUserKeyup);

            this.keyMap.set(key, {
              actionName,
              actionTypeId,
              actionId,
              description: mapping.description,
            });
          });
        } else {
          // We have an action Key

          inputMappings.forEach((inputMapping) => {
            const key = actionKeyOrder.pop();

            const actionId = Number(inputMapping[0]);
            const mapping = inputMapping[1];

            const mappedKey = this.input.keyboard.addKey(key, false);
            mappedKey.on("down", this.processUserKeydown);
            mappedKey.on("up", this.processUserKeyup);

            this.keyMap.set(key, {
              actionName,
              actionTypeId,
              actionId,
              description: mapping.description,
            });
          });
        }
      }
    });

    // When the mouse leaves the window we stop collecting keys
    this.input.on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
      this.input.keyboard.enabled = false;
    });

    // When we click back in the scene we collect keys
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      document.activeElement.blur();
      this.input.keyboard.enabled = true;
    });
  };

  stopRecordingOrPlayback = () => {
    if (this.isRecordingTrajectory) {
      this.endRecording();
    }

    if (this.isRunningTrajectory) {
      this.endPlayback();
    }
  };

  beginPlayback = () => {
    this.keyboardIntervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.keyboardIntervals.clear();

    this.isRunningTrajectory = true;
    this.currentTrajectoryBuffer = {
      seed: 100,
      steps: this.trajectoryString.split(",").map((char) => [0, +char]),
    };

    this.trajectoryActionIdx = 0;
    // this.resetLevel();
    this.onPlaybackStart();
  };

  endPlayback = () => {
    this.trajectoryActionIdx = 0;
    this.isRunningTrajectory = false;
    // this.resetLevel();
    // this.trajectoriesPlayedBack = 0;
    this.onPlaybackEnd();
  };

  resetLevel = (seed = 100) => {
    this.griddlyjs.seed(seed);
    // this.griddlyjs.reset();
    this.currentState = this.griddlyjs.getState();
  };

  processTrajectory = () => {
    if (this.currentTrajectoryBuffer.steps.length === 0) {
      this.isRunningTrajectory = false;
      return;
    }

    if (!this.cooldown) {
      this.cooldown = true;
      setTimeout(() => {
        this.cooldown = false;
      }, INTER_STEP_INTERVAL_MS);

      const action =
        this.currentTrajectoryBuffer.steps[this.trajectoryActionIdx++];
      const stepResult = this.griddlyjs.step(action);
      this.currentState = this.griddlyjs.getState();

      if (
        stepResult.terminated ||
        this.trajectoryActionIdx === this.currentTrajectoryBuffer.steps.length
      ) {
        // setTimeout(() => this.endPlayback(), 1000);
        this.endPlayback();
      }
    }
  };

  createFog = ({ x, y }) => {
    return {
      id: (Math.random() + 1).toString(36).substring(2),
      location: { x, y },
      name: "fog",
      orientation: "NONE",
      playerId: 0,
      renderTileId: 0,
      zidx: 10,
    };
  };

  manhattanDistance = (pos1, pos2) => {
    return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
  };

  euclideanDistance = (pos1, pos2) => {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
  };

  computeOcclusions = (state) => {
    let players = state.objects.filter((obj) => obj.name === "player");
    if (players.length === 0) {
      return state;
    }

    // remove existing fog
    state.objects = state.objects.filter((obj) => obj.name !== "fog");

    const filterFunc = (pos) => {
      let windowCentre = this.isRunningTrajectory
        ? { x: (this.gridWidth - 1) / 2, y: (this.gridHeight - 1) / 2 }
        : players[0].location;
      return this.euclideanDistance(windowCentre, pos) >= this.occlusionWindow;
    };

    // add new fog
    state.objects = [
      ...state.objects,
      ...this.occlusionPositions.filter(filterFunc).map(this.createFog),
    ];

    return state;
  };

  doUserAction = (action) => {
    this.onTrajectoryStep(action);
    const stepResult = this.griddlyjs.step(action);
    this.onReward(+stepResult.reward);
    this.globalVariableDebugText = this.getGlobalVariableDebugText();
    this.currentState = this.griddlyjs.getState();

    if (stepResult.terminated) {
      this.onLevelComplete();
      // this.resetLevel();
    }
  };

  processUserKeydown = (event) => {
    if (!this.isRunningTrajectory) {
      if (this.keyboardIntervals.has(event.keyCode)) {
        clearInterval(this.keyboardIntervals.get(event.keyCode));
      }

      const actionMapping = this.keyMap.get(event.keyCode);
      const action = [actionMapping.actionTypeId, actionMapping.actionId];
      this.doUserAction(action);

      // this.keyboardIntervals.set(
      //   event.keyCode,
      //   setInterval(() => this.doUserAction(action), 100)
      // );
    }
  };

  processUserKeyup = (event) => {
    if (this.keyboardIntervals.has(event.keyCode)) {
      clearInterval(this.keyboardIntervals.get(event.keyCode));
    }
  };

  preload = () => {
    const envName = this.gdy.Environment.Name;

    this.input.mouse.disableContextMenu();

    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "",
      {
        fontFamily: "Droid Sans Mono",
        font: "32px",
        fill: COLOR_LOADING_TEXT,
        align: "center",
      }
    );

    this.loadingText.setX(this.cameras.main.width / 2);
    this.loadingText.setY(this.cameras.main.height / 2);
    this.loadingText.setOrigin(0.5, 0.5);
    if (this.grenderer) {
      this.grenderer.loadTemplates(this.gdy.Objects);
    }
  };

  create = () => {
    this.loadingText.destroy();
    this.loaded = true;

    if (this.grenderer) {
      this.mapping = this.setupKeyboardMapping();
      this.grenderer.init(this.gridWidth, this.gridHeight);
      this.updateState(this.griddlyjs.getState());
    }
  };

  update = () => {
    if (!this.loaded) {
      this.loadingText.setX(this.cameras.main.width / 2);
      this.loadingText.setY(this.cameras.main.height / 2);
      this.loadingText.setOrigin(0.5, 0.5);
    } else {
      if (this.grenderer) {
        if (
          this.currentLevelStringOrId !== this.griddlyjs.getLevelStringOrId()
        ) {
          // this.stopRecordingOrPlayback();
          this.currentLevelStringOrId = this.griddlyjs.getLevelStringOrId();
          this.currentState = this.griddlyjs.getState();
        }

        if (this.isRunningTrajectory) {
          this.processTrajectory();
        }

        if (this.currentState && this.stateHash !== this.currentState.hash) {
          this.stateHash = this.currentState.hash;
          this.updateState(this.currentState);
        }
      }
    }
  };
}

export default HumanPlayerScene;
