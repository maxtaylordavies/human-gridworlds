import Phaser from "phaser";

import Block2DRenderer from "./Block2DRenderer";
import Sprite2DRenderer from "./Sprite2DRenderer";
import { BASE_ITEM_REWARD, MOVE_COST, OBJECT_KEY_TO_IDX } from "../constants";
import { shuffleArray } from "../utils";

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super("LoadingScene");
  }

  preload() {}

  create() {}

  update() {}
}

export class PlayerScene extends Phaser.Scene {
  constructor() {
    super("PlayerScene");

    this.stateHash = 0;
    this.loaded = false;
    this.defaultTileSize = 60;
    this.keyActionBuffer = new Map();
  }

  init = (data) => {
    try {
      this.griddlyjs = data.griddlyjs;
      this.gridHeight = this.griddlyjs.getHeight();
      this.gridWidth = this.griddlyjs.getWidth();
      this.gdy = data.gdy;
      this.levelId = data.levelId;
      this.avatarPath = data.avatarPath;
      this.playerPos = data.startPos;

      this.simAgent = data.simAgent;
      this.waitToBeginSimulation = data.waitToBeginSimulation;
      this.beforeSimulationMs = data.beforeSimulationMs;
      this.afterSimulationMs = data.afterSimulationMs;
      this.stepIntervalMs = data.stepIntervalMs;
      this.disableInput = data.disableInput;

      this.onTrajectoryStep = data.onTrajectoryStep;
      this._onPlayerPosChange = data.onPlayerPosChange;
      this.onReward = data.onReward;
      this.onGoalReachedCallback = data.onGoalReached;
      this.onTermination = data.onTermination;

      this.setPlayerPosAndImage();
      this.avatarObject = this.gdy.Environment.Player.AvatarObject;
      this.goalLocations = {};

      this.occlusionWindow = -1;
      this.occlusionPositions = [];
      if (this.gdy.Environment.OcclusionWindows !== undefined) {
        this.occlusionWindow =
          this.gdy.Environment.OcclusionWindows[this.levelId];
      }
      if (this.occlusionWindow !== -1) {
        for (let x = 0; x < this.gridWidth; x++) {
          for (let y = 0; y < this.gridHeight; y++) {
            this.occlusionPositions.push({ x, y });
          }
        }
      }

      this.hideGoals = data.hideGoals;
      if (this.hideGoals) {
        this.hideGoalItems();
      } else {
        this.revealGoalItems();
      }

      this.rendererName = data.rendererState.rendererName;
      this.renderConfig = data.rendererState.rendererConfig;
      if (this.renderConfig.Type === "BLOCK_2D") {
        this.grenderer = new Block2DRenderer(
          this,
          this.rendererName,
          this.renderConfig,
          this.avatarObject,
        );
      } else if (this.renderConfig.Type === "SPRITE_2D") {
        this.grenderer = new Sprite2DRenderer(
          this,
          this.rendererName,
          this.renderConfig,
          this.avatarObject,
        );
      }
    } catch (e) {
      this.displayError("Cannot load GDY file.", e);
    }

    this.renderData = {
      objects: {},
    };

    if (this.simAgent && !this.waitToBeginSimulation) {
      setTimeout(() => {
        this.beginSimulation();
      }, this.beforeSimulationMs);
    }
  };

  displayError = (message, error) => {
    console.error(message, error);
  };

  displayWarning = (message, error) => {
    console.warn(message, error);
  };

  updateAvatar = (avatarPath) => {
    this.gdy.Objects[0].Observers.Sprite2D[0].Image = avatarPath;
    if (this.grenderer) {
      this.grenderer.loadTemplates([this.gdy.Objects[0]]);
    }
  };

  setPlayerPosAndImage = () => {
    let rows;

    // if this is the first time this function is being called for
    // this level, we need to store the original location so we can
    // recover it when the demonstration phase is over
    if (!this.playerPos) {
      rows = this.gdy.Environment.Levels[this.levelId].split("\n");
      rows.forEach((row, i) => {
        const j = row.indexOf("p");
        if (j !== -1) {
          this.playerPos = { y: i, x: j / 4 };
        }
      });
    }

    // update the position
    rows = this.gdy.Environment.Levels[this.levelId]
      .replace("p", ".")
      .split("\n");

    const tmp = rows[this.playerPos.y].split("");

    tmp[this.playerPos.x * 4] = "p";
    rows[this.playerPos.y] = tmp.join("");

    const levelStr = rows.join("\n");

    this.griddlyjs.reset(levelStr);
    this.gdy.Environment.Levels[this.levelId] = levelStr;

    // if this is the last time this function is being called
    // for this level, then set this.playerPos back to undefined
    if (this.playerPos && !this.simAgent) {
      this.playerPos = undefined;
    }

    // update the avatar image
    this.updateAvatar(this.avatarPath);
  };

  onPlayerPosChange = (pos) => {
    this.playerPos = pos;
    this._onPlayerPosChange(pos);
  };

  _addObject = (object) => {
    this._removeObject(object.id);

    const objectTemplateName = object.name + object.renderTileId;
    const sprite = this.grenderer.addObject(
      object.name,
      objectTemplateName,
      object.location.x,
      object.location.y,
      object.orientation,
    );

    this.renderData.objects[object.id] = {
      object,
      sprite,
    };
  };

  _updateObject = (object) => {
    const objectTemplateName = object.name + object.renderTileId;
    const currentObjectData = this.renderData.objects[object.id];

    this.grenderer.updateObject(
      currentObjectData.sprite,
      object.name,
      objectTemplateName,
      object.location.x,
      object.location.y,
      object.orientation,
    );

    this.renderData.objects[object.id] = {
      ...currentObjectData,
      object,
    };
  };

  _removeObject = (id) => {
    if (id in this.renderData.objects) {
      this.renderData.objects[id].sprite.destroy();
      delete this.renderData.objects[id];
    }
  };

  updateState = (state) => {
    state = this.computeOcclusions(state);

    state.objects.forEach((object, i) => {
      if (object.name === "player") {
        this.onPlayerPosChange(object.location);

        let goalReached = "";
        for (const k in this.goalLocations) {
          const loc = this.goalLocations[k];
          if (loc.x === object.location.x && loc.y === object.location.y) {
            goalReached = k;
          }
        }

        if (goalReached) {
          this.onGoalReachedCallback(goalReached);
        }
      } else if (object.name.startsWith("goal")) {
        this.goalLocations[object.name] = object.location;
      }
    });

    const newObjectIds = state.objects.map((object) => {
      return object.id;
    });

    this.grenderer.recenter(
      this.griddlyjs.getWidth(),
      this.griddlyjs.getHeight(),
    );

    this.grenderer.beginUpdate(state.objects);

    state.objects.forEach((object, i) => {
      if (object.id in this.renderData.objects) {
        this._updateObject(object);
      } else {
        this._addObject(object);
      }
    });

    for (const k in this.renderData.objects) {
      const id = this.renderData.objects[k].object.id;
      if (!newObjectIds.includes(id)) {
        this._removeObject(k);
      }
    }
  };

  hideGoalItems = () => {
    this.gdy.Objects.forEach((object, i) => {
      if (object.Name.includes("goal")) {
        this.gdy.Objects[i].Observers.Sprite2D[0].Image =
          "custom/items/mystery-box.png";
      }
    });
  };

  revealGoalItems = () => {
    this.gdy.Objects.forEach((object, i) => {
      if (object.Name.includes("goal")) {
        this.gdy.Objects[i].Observers.Sprite2D[0].Image =
          `custom/items/${object.Name}.png`;
      }
    });
  };

  toMovementKey(vector) {
    return `${vector.x},${vector.y}`;
  }

  setupKeyboardMapping = () => {
    this.input.keyboard.clearCaptures();
    this.input.keyboard.removeAllListeners();
    this.input.keyboard.removeAllKeys(true);

    const actionInputMappings = this.griddlyjs.getActionInputMappings();
    const actionNames = this.griddlyjs.getActionNames();

    const movementKeySets = [
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
            mappedKey.removeAllListeners();
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
    // this.input.on(Phaser.Input.Events.POINTER_DOWN_OUTSIDE, () => {
    //   this.input.keyboard.enabled = false;
    // });

    // When we click back in the scene we collect keys
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      document.activeElement.blur();
      this.input.keyboard.enabled = true;
    });
  };

  stopRecordingOrSimulation = () => {
    if (this.isRecordingTrajectory) {
      this.endRecording();
    }

    if (this.isRunningSimulation) {
      this.endSimulation();
    }
  };

  beginSimulation = () => {
    this.keyActionBuffer.forEach((t, key) => {
      clearTimeout(t);
    });
    this.keyActionBuffer.clear();
    this.isRunningSimulation = true;
    this.cooldown = false;
    this.resetLevel();
  };

  endSimulation = () => {
    this.isRunningSimulation = false;
    this.resetLevel();
    this.onTermination();
  };

  resetLevel = (seed = 100) => {
    this.griddlyjs.seed(seed);
    this.griddlyjs.reset();
    this.currentState = this.griddlyjs.getState();
    this.keyActionBuffer.clear();
  };

  getGoalUtil = (goalId, goalPos, playerPos, theta) => {
    const itemUtil = BASE_ITEM_REWARD * theta[OBJECT_KEY_TO_IDX[goalId]];
    const distance = this.manhattanDistance(playerPos, goalPos);
    return itemUtil - MOVE_COST * distance;
  };

  sampleSimAction = () => {
    const actionUtils = { L: [], U: [], R: [], D: [] };
    Object.entries(this.goalLocations).forEach(([goalId, goalPos]) => {
      const goalUtil = this.getGoalUtil(
        goalId,
        goalPos,
        this.playerPos,
        this.simAgent.theta,
      );
      if (this.playerPos.x < goalPos.x) {
        actionUtils.R.push(goalUtil);
      } else if (this.playerPos.x > goalPos.x) {
        actionUtils.L.push(goalUtil);
      }
      if (this.playerPos.y < goalPos.y) {
        actionUtils.D.push(goalUtil);
      } else if (this.playerPos.y > goalPos.y) {
        actionUtils.U.push(goalUtil);
      }
    });

    // filter out actions that are not moving towards any goal
    // and then get the exponential of the max utility for each action
    const expUtils = Object.fromEntries(
      Object.entries(actionUtils)
        .filter(([action, utils]) => utils.length > 0)
        .map(([action, utils]) => [action, Math.exp(Math.max(...utils) / 0.1)]),
    );

    // convert to probability values
    const sumExpUtil = Object.values(expUtils).reduce((a, b) => a + b);
    const actionProbs = Object.fromEntries(
      Object.entries(expUtils).map(([action, expUtil]) => [
        action,
        expUtil / sumExpUtil,
      ]),
    );

    // now we need to sample an action based on these probabilities
    const r = Math.random();
    let sum = 0;
    for (const [a, p] of shuffleArray(Object.entries(actionProbs))) {
      sum += p;
      if (r <= sum) {
        return [0, ["L", "U", "R", "D"].indexOf(a) + 1];
      }
    }

    return [0, 0];
  };

  doSimulationStep = () => {
    if (!this.cooldown) {
      this.cooldown = true;

      const action = this.sampleSimAction();

      const stepResult = this.griddlyjs.step(action);
      this.onReward(+stepResult.reward);
      this.currentState = this.griddlyjs.getState();

      if (stepResult.terminated) {
        this.cooldown = true;
        setTimeout(() => this.endSimulation(), this.afterSimulationMs);
      } else {
        setTimeout(() => {
          this.cooldown = false;
        }, this.stepIntervalMs);
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

  positionDelta = (startPos, endPos) => {
    return { x: endPos.x - startPos.x, y: endPos.y - startPos.y };
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
      let windowCentre = this.isRunningSimulation
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
    if (this.simAgent) {
      return;
    }

    this.onTrajectoryStep(action[1]);
    const stepResult = this.griddlyjs.step(action);
    this.onReward(+stepResult.reward);
    this.currentState = this.griddlyjs.getState();

    if (stepResult.terminated) {
      setTimeout(() => {
        this.onTermination();
        this.resetLevel();
      }, 500);
    }
  };

  dispatchAction = (action) => {
    if (this.isRunningSimulation) {
      return;
    }

    clearTimeout(this.keyActionBuffer.get(action[1]));
    this.keyActionBuffer.set(
      action[1],
      setTimeout(() => this.doUserAction(action)),
    );
  };

  processUserKeydown = (event) => {
    if (this.disableInput || this.isRunningSimulation) {
      return;
    }

    const actionMapping = this.keyMap.get(event.keyCode);
    const action = [actionMapping.actionTypeId, actionMapping.actionId];
    this.dispatchAction(action);
  };

  processUserKeyup = (event) => {
    if (this.disableInput || this.isRunningSimulation) {
      return;
    }

    if (this.keyActionBuffer.has(event.keyCode)) {
      clearTimeout(this.keyActionBuffer.get(event.keyCode));
    }
  };

  preload = () => {
    this.input.mouse.disableContextMenu();
    if (this.grenderer) {
      this.grenderer.loadTemplates(this.gdy.Objects);
    }
  };

  create = () => {
    this.loaded = true;

    if (this.grenderer) {
      this.mapping = this.setupKeyboardMapping();
      this.grenderer.init(this.gridWidth, this.gridHeight);
      this.updateState(this.griddlyjs.getState());
    }
  };

  update = () => {
    if (this.loaded) {
      if (this.grenderer) {
        if (
          this.currentLevelStringOrId !== this.griddlyjs.getLevelStringOrId()
        ) {
          // this.stopRecordingOrSimulation();
          this.currentLevelStringOrId = this.griddlyjs.getLevelStringOrId();
          this.currentState = this.griddlyjs.getState();
        }

        if (this.isRunningSimulation) {
          this.doSimulationStep();
        }

        if (this.currentState && this.stateHash !== this.currentState.hash) {
          this.stateHash = this.currentState.hash;
          this.updateState(this.currentState);
        }
      }
    }
  };
}
