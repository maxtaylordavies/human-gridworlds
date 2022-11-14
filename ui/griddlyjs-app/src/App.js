import React, { useEffect, useRef, useState } from "react";
import yaml from "js-yaml";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import * as api from "./api";
import * as utils from "./utils";
import { hashString } from "./hash";
import "./App.scss";

const App = () => {
  // create and initialise an instance of the GriddlyJS core
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  // initialise a bunch of state
  const [session, setSession] = useState(null);
  const [levelCount, setlevelCount] = useState(0);
  const [agentPaths, setAgentPaths] = useState(null);
  const [pathsToShow, setPathsToShow] = useState(null);
  const [trajectories, setTrajectories] = useState({});
  const [gameState, setGameState] = useState({
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: false,
  });
  const [rendererState, setRendererState] = useState({
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  });
  const [finished, setFinished] = useState(false);

  // create refs for state values that will be updated inside callback functions
  const levelCountRef = useRef();
  levelCountRef.current = levelCount;
  const trajectoriesRef = useRef();
  trajectoriesRef.current = trajectories;

  useEffect(() => {
    performSetUp();
  }, []);

  useEffect(() => {
    if (session) {
      // fetch data
      fetchData();

      // initialise trajectories
      setTrajectories(session.levels.reduce((o, l) => ({ ...o, [l]: [] }), {}));
    }
  }, [session]);

  useEffect(() => {
    if (gameState.gdy) {
      loadLevel();
    }
  }, [gameState.gdy]);

  useEffect(() => {
    // if we've run through all the levels specified in the session,
    // then finish the experiment
    if (session && levelCount >= session.levels.length) {
      setFinished(true);
      onExperimentFinished();
      // otherwise, load the next level
    } else if (gameState.gdy) {
      loadLevel();
    }
  }, [levelCount]);

  useEffect(() => {
    if (session && agentPaths) {
      if (session.levels && agentPaths.paths) {
        setPathsToShow(agentPaths.paths[session.levels[levelCount]]);
      }
    }
  }, [session, agentPaths, levelCount]);

  // initialise griddly, create a session on the server, and
  // then store the session in local state
  const performSetUp = async () => {
    const onSession = (sess) => {
      setSession(sess);
      utils.writeToLocalStorage("sid", sess.id);
      utils.writeToLocalStorage("hid", sess.humanId);
    };

    await griddlyjs.init().then(() => {
      // check for existing session_id in url or localstorage
      // if we find one, then get the corresponding session from
      // the server (rather than creating a new session)
      let sid = utils.getValueFromUrlOrLocalstorage("sid");
      if (sid) {
        console.log(`found session_id ${sid}, retrieving`);
        api.getSession(sid, onSession, console.Error);
      } else {
        // otherwise, we create a new session on the server, passing
        // in existing experiment_id and human_id if they exist
        let eid = utils.getValueFromUrlOrLocalstorage("eid");
        let hid = utils.getValueFromUrlOrLocalstorage("hid");
        api.createSession(eid, hid, onSession, console.error);
      }
    });
  };

  // fetch the game spec file and the expert agents' trajectory data
  const fetchData = async () => {
    api.loadGameSpec(session, (gdy) => {
      loadGame(gdy);
      api.loadAgentPaths(session, (paths) => {
        setAgentPaths(paths);
      });
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

  // load the map for the current level
  const loadLevel = async () => {
    const levelString =
      gameState.gdy.Environment.Levels[session.levels[levelCount]];
    griddlyjs.reset(levelString);
  };

  const loadRenderers = (gdy) => {
    const renderers = utils.findCompatibleRenderers(
      gdy.Environment.Observers || {},
      gdy.Objects
    );

    const [rendererName] = renderers.keys();
    const rendererConfig = renderers.get(rendererName);

    setRendererState({
      renderers: renderers,
      rendererName: rendererName,
      rendererConfig: rendererConfig,
    });
  };

  const onTrajectoryStep = (step) => {
    if (finished) {
      return;
    }

    let traj = { ...trajectoriesRef.current };
    traj[session.levels[levelCountRef.current]].push(step);
    setTrajectories(traj);
  };

  const onExperimentFinished = () => {
    let traj = { ...trajectoriesRef.current };
    Object.keys(traj).forEach((k) => {
      traj[k] = traj[k].map((x) => x[1]).join(",");
    });
    api.storeTrajectory(
      session,
      traj,
      (resp) => {
        utils.removeFromLocalStorage("sid");
      },
      console.error
    );
  };

  const isReady = () => {
    return session !== null && pathsToShow !== null && gameState.gdy !== null;
  };

  return !isReady() ? (
    <div>loading</div>
  ) : (
    <div className="main-container">
      <div className="game-container" style={{ opacity: finished ? 0.2 : 1 }}>
        <div className="info-bar">
          <div>{gameState.playing ? "Playing" : "Watching"}</div>
          <div>
            Level {Math.max(levelCount + 1, session.levels.length)}/
            {session.levels.length}
          </div>
        </div>
        <Player
          gdyHash={gameState.gdyHash}
          gdy={gameState.gdy}
          griddlyjs={griddlyjs}
          rendererName={rendererState.rendererName}
          rendererConfig={rendererState.rendererConfig}
          height={500}
          width={800}
          onTrajectoryStep={onTrajectoryStep}
          onLevelComplete={() => {
            setlevelCount((prevCount) => prevCount + 1);
          }}
          trajectoryStrings={pathsToShow}
          onPlaybackStart={() => setGameState({ ...gameState, playing: false })}
          onPlaybackEnd={() => setGameState({ ...gameState, playing: true })}
        />
      </div>
      {finished && (
        <div>
          <div style={{ color: "white", fontSize: 36 }}>
            Experiment complete
          </div>
          <div>thanks for playing :)</div>
        </div>
      )}
    </div>
  );
};

export default App;
