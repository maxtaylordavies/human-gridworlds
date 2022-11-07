import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import yaml from "js-yaml";
import * as tf from "@tensorflow/tfjs";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import * as api from "./api";
import { findCompatibleRenderers } from "./utils";
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
  const [session, setSession] = useState();
  const [agentPaths, setAgentPaths] = useState();
  const [gameState, setGameState] = useState({
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    levelId: 0,
    trajectoriesRaw: [0, 1].reduce((o, l) => ({ ...o, [l]: [] }), {}),
    trajectoriesString: [0, 1].reduce((o, l) => ({ ...o, [l]: "" }), {}),
  });
  const [rendererState, setRendererState] = useState({
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  });
  const [messages, setMessages] = useState({});
  const [levelCount, setLevelCount] = useState();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    performSetUp();
  }, []);

  useEffect(() => {
    if (session) {
      // fetch data
      fetchData();

      // initialise trajectory objects
      const traw = session.levels.reduce((o, l) => ({ ...o, [l]: [] }), {});
      const tstrings = session.levels.reduce((o, l) => ({ ...o, [l]: "" }), {});

      setGameState({
        ...gameState,
        trajectoriesRaw: traw,
        trajectoriesString: tstrings,
      });

      setLevelCount(0);
    }
  }, [session]);

  useEffect(() => {
    console.log(`levelCount: ${levelCount}`);
    if (gameState.gdy) {
      const levelString = gameState.gdy.Environment.Levels[levelCount];
      griddlyjs.reset(levelString);
      console.log();
    }
    console.log(`levelCount: ${levelCount}`);
  }, [levelCount]);

  // initialise griddly, create a session on the server, and
  // then store the session in local state
  const performSetUp = async () => {
    window.addEventListener("resize", updatePhaserCanvasSize, false);
    updatePhaserCanvasSize();

    await griddlyjs.init().then(() => {
      api.createSession("test1", (sess) => {
        setSession(sess);
      });
    });
  };

  // fetch the game spec file and the expert agents' trajectory data
  const fetchData = async () => {
    console.log(`fetching data for session ${JSON.stringify(session)}`);
    api.loadGameSpec(session, (gdy) => {
      loadGame(gdy);
    });
    api.loadAgentPaths(session, (paths) => {
      setAgentPaths(paths);
    });
  };

  // load the game spec into griddly
  const loadGame = async (gdy) => {
    const gdyString = yaml.dump(gdy, { noRefs: true });
    griddlyjs.unloadGDY();
    griddlyjs.loadGDY(gdyString);
    loadRenderers(gdy);

    setGameState({
      ...gameState,
      gdy,
      gdyString,
      gdyHash: hashString(gdyString),
    });
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

  // setCurrentLevel = (levelId) => {
  //   this.setState((state) => {
  //     if (!state.gdy || !this.griddlyjs) {
  //       return state;
  //     }
  //     const levelString = state.gdy.Environment.Levels[levelId];

  //     try {
  //       this.editorStateHandler.loadLevelString(levelString, levelId);
  //     } catch (error) {
  //       this.displayMessage(
  //         "Unable to load level, please edit level string to fix any errors.",
  //         "error",
  //         error
  //       );
  //     }

  //     try {
  //       this.griddlyjs.reset(levelString);
  //     } catch (error) {
  //       this.displayMessage(
  //         "Unable to load level, please edit level string to fix any errors.",
  //         "error",
  //         error
  //       );
  //     }

  //     const trajectoryString = yaml.dump(state.trajectories[levelId], {
  //       noRefs: true,
  //     });
  //     return {
  //       ...state,
  //       levelId: levelId,
  //       levelString: levelString,
  //       trajectoryString: trajectoryString,
  //     };
  //   });
  // };

  const onTrajectoryStep = (level, step) => {
    console.log(levelCount);

    let traw = { ...gameState.trajectoriesRaw };
    let tstrings = { ...gameState.trajectoriesString };

    traw[level].push(step);
    tstrings[level] += step[1];

    setGameState({
      ...gameState,
      trajectoriesRaw: traw,
      trajectoriesString: tstrings,
    });
  };

  const onLevelComplete = (level) => {
    if (level >= 1) {
      setFinished(true);
      onExperimentFinished();
    }
    setLevelCount((prevCount) => prevCount + 1);
  };

  const onExperimentFinished = () => {
    let traj = { ...gameState.trajectoriesRaw };
    Object.keys(traj).forEach((k) => {
      traj[k] = traj[k].map((x) => x[1]).join(",");
    });
    api.storeTrajectory(
      session,
      traj,
      (resp) => {
        console.log(`response: ${resp}`);
      },
      console.error
    );
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
      <div style={{ position: "absolute", opacity: finished ? 0.3 : 1 }}>
        <Player
          gdyHash={gameState.gdyHash}
          gdy={gameState.gdy}
          // trajectory={gameState.trajectories[gameState.levelId]}
          griddlyjs={griddlyjs}
          rendererName={rendererState.rendererName}
          rendererConfig={rendererState.rendererConfig}
          height={playerState.phaserHeight}
          width={playerState.phaserWidth}
          levelId={gameState.levelId}
          onTrajectoryStep={onTrajectoryStep}
          onTrajectoryComplete={onLevelComplete}
          onDisplayMessage={displayMessage}
          level={0}
        />
      </div>
      {finished && (
        <div style={{ color: "white", fontSize: 36 }}>
          Experiment complete :)
        </div>
      )}
    </div>
  );
};

export default App;
