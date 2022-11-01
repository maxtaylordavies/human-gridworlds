// import logo from './logo.svg';
import yaml, { YAMLException } from "js-yaml";
import React, { Component } from "react";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import "./App.scss";

import {
  Col,
  Container,
  Row,
  Tabs,
  Tab,
} from "react-bootstrap";

import { hashString } from "./Utils";

import * as tf from "@tensorflow/tfjs";

class App extends Component {
  constructor() {
    super();

    this.state = {
      levelPlayer: {
        phaserWidth: 500,
        phaserHeight: 250,
      },
      gdyHash: 0,
      gdyString: "",
      levelId: 0,
      rendererName: "",
      messages: {},
      selectedLevelId: 0,
      trajectories: [],
      projects: {
        names: [],
        templates: {},
        blankTemplate: "",
      },
      newProject: {
        name: "",
        showModal: false,
        template: "",
      },
      projectName: "",
    };

    this.griddlyjs = new GriddlyJSCore();

    this.newLevelString = `. . .
. . .
. . . 
`;
  }

  loadGDYURL = async (url) => {
    console.log(`LOADING URL ${url}`)
    return fetch(url).then((response) => {
      return response.text().then((text) => yaml.load(text));
    });
  };

  setEditorLevelString = (levelString) => {
    this.setState((state) => {
      return {
        ...state,
        levelString: levelString,
      };
    });
  };

  playLevel = (levelString) => {
    this.griddlyjs.reset(levelString);
  };

  // onTrajectoryComplete = (trajectoryBuffer) => {
  //   this.setState((state) => {
  //     const trajectories = { ...state.trajectories };
  //     trajectories[state.selectedLevelId] = trajectoryBuffer;
  //     this.editorHistory.updateState(this.state.projectName, {
  //       trajectories,
  //     });

  //     state.trajectoryString = yaml.dump(trajectoryBuffer, { noRefs: true });

  //     return {
  //       ...state,
  //       trajectories,
  //     };
  //   });
  // };

  findCompatibleRenderers = (observers, objects) => {
    const compatibleRenderers = new Map([
      [
        "Sprite2D",
        {
          Type: "SPRITE_2D",
          TileSize: 24,
          RotateAvatarImage: true,
        },
      ],
      [
        "Block2D",
        {
          Type: "BLOCK_2D",
          TileSize: 24,
          RotateAvatarImage: true,
        },
      ],
    ]);

    for (const [rendererName, config] of compatibleRenderers) {
      if (rendererName in observers) {
        compatibleRenderers.set(rendererName, {
          ...config,
          ...observers[rendererName],
        });
      }
    }

    // Search through observers for custom observer types
    for (const observerName in observers) {
      const observer = observers[observerName];

      // Ignore the default observers
      if (
        observerName !== "Sprite2D" &&
        observerName !== "Block2D" &&
        observerName !== "Entity" &&
        observerName !== "ASCII" &&
        observerName !== "Vector"
      ) {
        const observerType = observer.Type;

        // Only consider fully observable sprite and block observers
        if (observerType === "SPRITE_2D" || observerType === "BLOCK_2D") {
          if (
            !observer.Width &&
            !observer.Height &&
            !observer.OffsetX &&
            !observer.OffsetY &&
            !observer.Shader
          ) {
            compatibleRenderers.set(observerName, observer);
          }
        }
      }
    }

    const observersInObjects = new Set();

    // Search through objects for observer names
    for (const o in objects) {
      const object = objects[o];

      // Remove any observers that are missing definitions in objects and warn about them
      for (const observerName in object.Observers) {
        observersInObjects.add(observerName);
      }
    }

    for (const [rendererName, config] of compatibleRenderers) {
      if (!observersInObjects.has(rendererName)) {
        compatibleRenderers.delete(rendererName);
      }
    }

    return compatibleRenderers;
  };

  tryLoadModel = async (environmentName) => {
    return tf
      .loadGraphModel("./model/" + environmentName + "/model.json")
      .catch((error) => {
        console.log("Cannot load model for environment", environmentName);
      })
      .then((model) => {
        this.setState((state) => {
          return {
            ...state,
            model,
          };
        });
      });
  };

  tryLoadTrajectories = async (environmentName, trajectories) => {
    return fetch("./trajectories/" + environmentName + ".yaml")
      .then((response) => {
        return response.text().then((text) => {
          if (text.startsWith("<!") || response.status !== 200) {
            return [];
          } else {
            return yaml.load(text);
          }
        });
      })
      .then((preloadedTrajectories) => {
        for (const levelId in trajectories) {
          if (trajectories[levelId]) {
            preloadedTrajectories[levelId] = trajectories[levelId];
          }
        }

        this.setState((state) => {
          return {
            ...state,
            trajectories: preloadedTrajectories,
          };
        });
      })
      .catch((error) => {
        console.log(
          "Cannot load trajectories for environment",
          environmentName
        );
        this.setState((state) => {
          return {
            ...state,
            trajectories,
          };
        });
      });
  };

  loadProject = async (editorState, projectName) => {
    try {
      const gdy = editorState.gdy;
      const gdyString = yaml.dump(gdy, { noRefs: true });
      const lastLevelId = gdy.Environment.Levels.length - 1;

      this.tryLoadModel(projectName);

      this.tryLoadTrajectories(projectName, editorState.trajectories);


      this.setState((state) => {
        return {
          ...state,
          loading: true,
        };
      });

      setTimeout(() => {
        try {
          this.updateGDY(gdyString, projectName);
        } catch (e) {
          this.displayMessage("Could not load GDY", "error", e);
          this.setState((state) => {
            return {
              ...state,
              projectName,
              gdyHash: hashString(gdyString),
              gdyString: gdyString,
              gdy: gdy,
              selectedLevelId: lastLevelId,
            };
          });
        }
      });
    } catch (e) {
      this.displayMessage("Could not load GDY", "error", e);
      this.setState((state) => {
        return {
          ...state,
          projectName,
          gdyString: editorState.gdyString,
          trajectoryString: editorState.trajectoryString,
        };
      });
    }
  };

  loadRenderers = (gdy) => {
    const renderers = this.findCompatibleRenderers(
      gdy.Environment.Observers || {},
      gdy.Objects
    );

    if (renderers.size === 0) {
      this.displayMessage(
        "This GDY file does not contain any configurations for fully observable Sprite2D or Block2D renderers. We therefore don't know how to render this environment!",
        "error"
      );
    }

    const [rendererName] = renderers.keys();
    const rendererConfig = renderers.get(rendererName);

    this.setState((state) => {
      return {
        ...state,
        renderers: renderers,
        rendererName: rendererName,
        rendererConfig: rendererConfig,
      };
    });
  };

  checkGriddlyJSCompatibility = (gdy) => {
    // Check for avatar object
    if (
      !("Player" in gdy.Environment) ||
      !("AvatarObject" in gdy.Environment.Player)
    ) {
      throw new Error(
        "Currently only Single-Player environments where an avatar is controlled by the agent are compatible with GriddlyJS. \n\n Perhaps you forgot to set the AvatarObject?"
      );
    }

    if (!("Levels" in gdy.Environment)) {
      throw new Error("Please define at least one level.");
    }
  };

  updateGDY = (gdyString, projectName) => {
    this.closeAllMessages();

    try {
      const gdy = yaml.load(gdyString);
      this.checkGriddlyJSCompatibility(gdy);

      try {
        this.griddlyjs.unloadGDY();
        this.griddlyjs.loadGDY(gdyString);

        this.loadRenderers(gdy);
        this.setState((state) => {
          return {
            ...state,
            projectName,
            gdyHash: hashString(gdyString),
            gdyString: gdyString,
            gdy: gdy,
            griddlyjs: this.griddlyjs,
            loading: false,
          };
        });
      } catch (e) {
        this.displayMessage("Unable to load GDY \n\n" + e.message, "error", e);
        this.setState((state) => {
          return {
            ...state,
            projectName,
            // gdyHash: hashString(gdyString),
            // gdy: gdy,
            gdyString: gdyString,
            loading: false,
          };
        });
      }
    } catch (e) {
      this.setState((state) => {
        return {
          ...state,
          projectName,
          gdyHash: hashString(gdyString),
          gdyString: gdyString,
          loading: false,
        };
      });
      if (e instanceof YAMLException) {
        this.displayMessage(
          "There are syntax errors in your GDY: " + e.message,
          "error",
          e
        );
      } else {
        this.displayMessage("Unable to load GDY \n\n" + e.message, "error", e);
      }
    }
  };

  updatePhaserCanvasSize = () => {
    this.setState((state) => {
      // const width = Math.max(
      //   this.tabPlayerContentElement.offsetWidth,
      //   this.tabEditorContentElement.offsetWidth,
      //   this.tabDebuggerContentElement
      //     ? this.tabDebuggerContentElement.offsetWidth
      //     : 0
      // );
      const width = this.tabPlayerContentElement.offsetWidth
      return {
        ...state,
        levelPlayer: {
          phaserWidth: width,
          phaserHeight: (6 * window.innerHeight) / 9,
        },
        levelEditor: {
          phaserWidth: width,
          phaserHeight: (6 * window.innerHeight) / 9,
        },
        policyDebugger: {
          phaserWidth: width,
          phaserHeight: (6 * window.innerHeight) / 9,
        },
        levelSelector: {
          phaserWidth: (2 * window.innerWidth) / 3,
          phaserHeight: 150,
        },
      };
    });
  };

  loadConfig = async () => {
    return fetch("config/config.json").then((response) => response.json());
  };


  setTemplates = (templates, blankTemplate) => {
    this.setState((state) => {
      const newProjects = { ...this.state.projects, templates, blankTemplate };
      return {
        ...state,
        projects: newProjects,
      };
    });
  };

  async componentDidMount() {
    window.addEventListener("resize", this.updatePhaserCanvasSize, false);
    this.updatePhaserCanvasSize();

    return await this.griddlyjs.init().then(() => {
      this.loadConfig().then((defaults) => {
        this.setTemplates(defaults.templates, defaults.blankTemplate);
        this.loadGDYURL(defaults.defaultProject.gdy).then((gdy) => {
          this.loadProject({ gdy }, defaults.defaultProject.name);
        });
      });
    });
  }

  setKey = (k) => {
    this.setState((state) => {
      return {
        ...state,
        key: k,
      };
    });

    this.updatePhaserCanvasSize();
  };

  displayMessage = (content, type, error) => {
    if (error) {
      console.error(error);
    }
    this.setState((state) => {
      const messageHash = hashString(content + type);
      state.messages[messageHash] = {
        content,
        type,
      };

      return {
        ...state,
      };
    });
  };

  closeMessage = (messageHash) => {
    this.setState((state) => {
      delete state.messages[messageHash];
      return {
        ...state,
      };
    });
  };

  closeAllMessages = () => {
    Object.entries(this.state.messages).map(([key, message]) => {
      this.closeMessage(key);
    });
  };

  render() {
    return (
      <Container fluid className="griddlyjs-ide-container">
        <Row>
          <Col md={6}>
            <Tabs
              id="controlled-tab-example"
              activeKey={this.state.key}
              onSelect={(k, e) => {
                e.preventDefault();
                this.setKey(k);
              }}
              className="mb-3"
              transition={false}
            >
              <Tab eventKey="play" title="Play">
                <Row>
                  <Col md={12}>
                    <div
                      ref={(tabPlayerContentElement) => {
                        this.tabPlayerContentElement = tabPlayerContentElement;
                      }}
                    >
                      <Player
                        gdyHash={this.state.gdyHash}
                        gdy={this.state.gdy}
                        trajectory={
                          this.state.trajectories[this.state.selectedLevelId]
                        }
                        griddlyjs={this.state.griddlyjs}
                        rendererName={this.state.rendererName}
                        rendererConfig={this.state.rendererConfig}
                        height={this.state.levelPlayer.phaserHeight}
                        width={this.state.levelPlayer.phaserWidth}
                        selectedLevelId={this.state.selectedLevelId}
                        onTrajectoryComplete={this.onTrajectoryComplete}
                        onDisplayMessage={this.displayMessage}
                      ></Player>
                    </div>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
