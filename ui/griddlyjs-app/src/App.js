import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import yaml from "js-yaml";
import * as tf from "@tensorflow/tfjs";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import {
  findCompatibleRenderers,
  loadJsonFromURL,
  loadYamlFromURL,
} from "./utils";
import { hashString } from "./hash";
import "./App.scss";

const App = () => {
  // create and initialise an instance of the GriddlyJS core
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  // initialise a bunch of state
  const [playerState, setPlayerState] = useState({
    phaserWidth: 800,
    phaserHeight: 500,
  });
  const [gameState, setGameState] = useState({
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
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    levelId: 0,
    selectedLevelId: 0,
    trajectories: [],
    trajectoryString: "",
  });
  const [rendererState, setRendererState] = useState({
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  });
  const [model, setModel] = useState();
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  const playerElement = useRef(null);

  useEffect(() => {
    async function performSetUp() {
      window.addEventListener("resize", updatePhaserCanvasSize, false);
      updatePhaserCanvasSize();

      await griddlyjs.init().then(() => {
        loadJsonFromURL("config/config.json").then((defaults) => {
          loadYamlFromURL(defaults.defaultProject.gdy).then((gdy) => {
            loadProject(gdy, defaults.defaultProject.name);
          });
        });
      });
    }
    performSetUp();
  }, []);

  const loadProject = async (gdy, projectName) => {
    setLoading(true);

    await tryLoadModel(projectName);

    const gdyString = yaml.dump(gdy, { noRefs: true });
    griddlyjs.unloadGDY();
    griddlyjs.loadGDY(gdyString);
    loadRenderers(gdy);

    setGameState({
      ...gameState,
      projectName,
      gdy,
      gdyString,
      gdyHash: hashString(gdyString),
      selectedLevelId: gdy.Environment.Levels.length - 1,
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
    const trajectories = { ...gameState.trajectories };
    trajectories[gameState.selectedLevelId] = trajectoryBuffer;

    setGameState({
      ...gameState,
      trajectoryString: yaml.dump(trajectoryBuffer, { noRefs: true }),
      trajectories,
    });
  };

  const tryLoadModel = async (environmentName) => {
    return tf
      .loadGraphModel("./model/" + environmentName + "/model.json")
      .then((model) => {
        setModel(model);
      })
      .catch((error) => {
        console.log("Cannot load model for environment", environmentName);
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
        setGameState({
          ...gameState,
          trajectories: preloadedTrajectories,
        });
      })
      .catch((error) => {
        console.log(
          "Cannot load trajectories for environment",
          environmentName
        );
        setGameState({
          ...gameState,
          trajectories,
        });
      });
  };

  const updatePhaserCanvasSize = () => {
    // setPlayerState({
    //   phaserWidth: playerElement.offsetWidth,
    //   phaserHeight: (6 * window.innerHeight) / 9,
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
    <div className="main-container">
      <Player
        gdyHash={gameState.gdyHash}
        gdy={gameState.gdy}
        trajectory={gameState.trajectories[gameState.selectedLevelId]}
        griddlyjs={griddlyjs}
        rendererName={rendererState.rendererName}
        rendererConfig={rendererState.rendererConfig}
        height={playerState.phaserHeight}
        width={playerState.phaserWidth}
        selectedLevelId={gameState.selectedLevelId}
        onTrajectoryComplete={onTrajectoryComplete}
        onDisplayMessage={displayMessage}
      />
    </div>
  );
};

export default App;
