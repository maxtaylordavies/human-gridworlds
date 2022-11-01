import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import yaml, { YAMLException } from "js-yaml";
import * as tf from "@tensorflow/tfjs";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import { findCompatibleRenderers } from "./utils";
import { hashString } from "./hash";
import "./App.scss";

const newLevelString = `. . .
. . .
. . . 
`;

const App = () => {
  const [playerState, setPlayerState] = useState({
    phaserWidth: 500,
    phaserHeight: 250,
  });
  const [gameState, setGameState] = useState({
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    levelId: 0,
    selectedLevelId: 0,
  });
  const [projectState, setProjectState] = useState({
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
  });
  const [rendererState, setRendererState] = useState({
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  });
  const [trajectoryState, setTrajectoryState] = useState({
    trajectories: [],
    trajectoryString: "",
  });
  const [model, setModel] = useState();
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  useEffect(() => {
    async function performSetUp() {
      window.addEventListener("resize", updatePhaserCanvasSize, false);
      updatePhaserCanvasSize();

      await griddlyjs.init().then(() => {
        loadConfig().then((defaults) => {
          loadGDYURL(defaults.defaultProject.gdy).then((gdy) => {
            _loadProject(gdy, defaults.defaultProject.name);
          });
        });
      });
    }
    performSetUp();
  }, []);

  // const setEditorLevelString = (levelString) => {
  //   setState({
  //     ...state,
  //     levelString: levelString,
  //   });
  // };

  // const playLevel = (levelString) => {
  //   griddlyjs.reset(levelString);
  // };

  const onTrajectoryComplete = (trajectoryBuffer) => {
    const trajectories = { ...trajectoryState.trajectories };
    trajectories[gameState.selectedLevelId] = trajectoryBuffer;

    setTrajectoryState({
      trajectoryString: yaml.dump(trajectoryBuffer, { noRefs: true }),
      trajectories,
    });
  };

  const loadConfig = async () => {
    return fetch("config/config.json").then((response) => response.json());
  };

  const loadGDYURL = async (url) => {
    return fetch(url).then((response) => {
      return response.text().then((text) => yaml.load(text));
    });
  };

  const tryLoadModel = async (environmentName) => {
    return tf
      .loadGraphModel("./model/" + environmentName + "/model.json")
      .catch((error) => {
        console.log("Cannot load model for environment", environmentName);
      })
      .then((model) => {
        setModel(model);
      });
  };

  const tryLoadTrajectories = async (environmentName, trajectories) => {
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

        setTrajectoryState({
          ...trajectoryState,
          trajectories: preloadedTrajectories,
        });
      })
      .catch((error) => {
        console.log(
          "Cannot load trajectories for environment",
          environmentName
        );
        setTrajectoryState({
          ...trajectoryState,
          trajectories,
        });
      });
  };

  const _loadProject = async (gdy, projectName) => {
    setLoading(true);

    await tryLoadModel(projectName);

    const gdyString = yaml.dump(gdy, { noRefs: true });
    griddlyjs.unloadGDY();
    griddlyjs.loadGDY(gdyString);
    loadRenderers(gdy);

    setGameState({
      ...gameState,
      gdy,
      gdyString,
      gdyHash: hashString(gdyString),
      selectedLevelId: gdy.Environment.Levels.length - 1,
    });
    setProjectState({
      ...projectState,
      projectName,
    });

    setLoading(false);
  };

  const loadRenderers = (gdy) => {
    const renderers = findCompatibleRenderers(
      gdy.Environment.Observers || {},
      gdy.Objects
    );

    if (renderers.size === 0) {
      displayMessage(
        "This GDY file does not contain any configurations for fully observable Sprite2D or Block2D renderers. We therefore don't know how to render this environment!",
        "error"
      );
    }

    const [rendererName] = renderers.keys();
    const rendererConfig = renderers.get(rendererName);

    setRendererState({
      renderers: renderers,
      rendererName: rendererName,
      rendererConfig: rendererConfig,
    });
  };

  const updatePhaserCanvasSize = () => {
    // const width = tabPlayerContentElement.offsetWidth;
    // setState({
    //   ...state,
    //   levelPlayer: {
    //     phaserWidth: width,
    //     phaserHeight: (6 * window.innerHeight) / 9,
    //   },
    //   // levelEditor: {
    //   //   phaserWidth: width,
    //   //   phaserHeight: (6 * window.innerHeight) / 9,
    //   // },
    //   // policyDebugger: {
    //   //   phaserWidth: width,
    //   //   phaserHeight: (6 * window.innerHeight) / 9,
    //   // },
    //   // levelSelector: {
    //   //   phaserWidth: (2 * window.innerWidth) / 3,
    //   //   phaserHeight: 150,
    //   // },
    // });
  };

  const displayMessage = (content, type, error) => {
    if (error) {
      console.error(error);
    }

    let msgs = { ...messages };
    msgs[hashString(content + type)] = {
      content,
      type,
    };
    setMessages(msgs);
  };

  const closeMessage = (messageHash) => {
    let msgs = { ...messages };
    delete msgs[messageHash];
    setMessages(msgs);
  };

  const closeAllMessages = () => {
    Object.entries(messages).map(([key, message]) => {
      closeMessage(key);
    });
  };

  return (
    <Container fluid className="griddlyjs-ide-container">
      <Row>
        <Col md={6}>
          <Row>
            <Col md={12}>
              <div
              // ref={(tabPlayerContentElement) => {
              //   tabPlayerContentElement = tabPlayerContentElement;
              // }}
              >
                <Player
                  gdyHash={gameState.gdyHash}
                  gdy={gameState.gdy}
                  trajectory={
                    trajectoryState.trajectories[gameState.selectedLevelId]
                  }
                  griddlyjs={griddlyjs}
                  rendererName={rendererState.rendererName}
                  rendererConfig={rendererState.rendererConfig}
                  height={playerState.phaserHeight}
                  width={playerState.phaserWidth}
                  selectedLevelId={gameState.selectedLevelId}
                  onTrajectoryComplete={onTrajectoryComplete}
                  onDisplayMessage={displayMessage}
                ></Player>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
