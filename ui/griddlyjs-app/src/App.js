import React, { Component } from "react";
import {
  Col,
  Container,
  Row,
} from "react-bootstrap";
import yaml, { YAMLException } from "js-yaml";
import * as tf from "@tensorflow/tfjs";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import { findCompatibleRenderers } from "./utils";
import { hashString } from "./hash";
import "./App.scss";


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

  loadConfig = async () => {
    return fetch("config/config.json").then((response) => response.json());
  };

  loadGDYURL = async (url) => {
    console.log(`LOADING URL ${url}`)
    return fetch(url).then((response) => {
      return response.text().then((text) => yaml.load(text));
    });
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
    const renderers = findCompatibleRenderers(
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

  updateGDY = (gdyString, projectName) => {
    this.closeAllMessages();

    try {
      const gdy = yaml.load(gdyString);

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
      const width = this.tabPlayerContentElement.offsetWidth
      return {
        ...state,
        levelPlayer: {
          phaserWidth: width,
          phaserHeight: (6 * window.innerHeight) / 9,
        },
        // levelEditor: {
        //   phaserWidth: width,
        //   phaserHeight: (6 * window.innerHeight) / 9,
        // },
        // policyDebugger: {
        //   phaserWidth: width,
        //   phaserHeight: (6 * window.innerHeight) / 9,
        // },
        // levelSelector: {
        //   phaserWidth: (2 * window.innerWidth) / 3,
        //   phaserHeight: 150,
        // },
      };
    });
  };

  async componentDidMount() {
    window.addEventListener("resize", this.updatePhaserCanvasSize, false);
    this.updatePhaserCanvasSize();

    return await this.griddlyjs.init().then(() => {
      this.loadConfig().then((defaults) => {
        this.loadGDYURL(defaults.defaultProject.gdy).then((gdy) => {
          this.loadProject({ gdy }, defaults.defaultProject.name);
        });
      });
    });
  }

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
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
