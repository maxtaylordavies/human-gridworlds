import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import yaml from "js-yaml";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import InfoBar from "./InfoBar";
import InstructionModal from "./InstructionModal";
import * as api from "./api";
import * as utils from "./utils";
import { hashString } from "./hash";
import "./App.scss";

const App = () => {
  // create and initialise an instance of the GriddlyJS core
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  // initialise a bunch of state
  const [waiting, setWaiting] = useState(true);
  const [session, setSession] = useState(null);
  const [levelCount, setlevelCount] = useState(0);
  const [agentPaths, setAgentPaths] = useState(null);
  const [playbackState, setPlaybackState] = useState({
    pathsToShow: null,
    pathsShown: -1,
  });
  const [trajectories, setTrajectories] = useState({});
  const [gameState, setGameState] = useState({
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: false,
    score: 0,
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
        setPlaybackState({
          pathsToShow: agentPaths.paths[session.levels[levelCount]] || [],
          pathsShown: 0,
        });
      }
    }
  }, [session, agentPaths, levelCount]);

  useEffect(() => {
    updateAvatar();
  }, [playbackState.pathsShown]);

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
      loadGame(setRewards(gdy));
      api.loadAgentPaths(session, (paths) => {
        setAgentPaths(paths);
      });
    });
  };

  const setRewards = (gdy) => {
    let u = session.utility["terrains"].concat(session.utility["goals"]);
    let j = 0;

    gdy.Actions[0].Behaviours = gdy.Actions[0].Behaviours.map((b) => {
      let src = {
        ...b.Src,
        Commands: b.Src.Commands.map((cmd) =>
          cmd.reward === undefined ? cmd : { reward: u[j++] }
        ),
      };
      return { ...b, Src: src };
    });

    return gdy;
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

  const updateAvatar = () => {
    if (!(gameState.gdy && playbackState.pathsToShow)) {
      return;
    }

    let path = "sprite2d/player.png";
    if (playbackState.pathsShown < playbackState.pathsToShow.length) {
      path = session.agentAvatars[playbackState.pathsShown];
    }

    let gdy = gameState.gdy;
    let idx = gdy.Objects.findIndex((obj) => obj.Name === "player");
    if (idx !== -1) {
      gdy.Objects[idx].Observers.Sprite2D[0].Image = path;
    }
    setGameState({ ...gameState, gdy });
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

  const onPlaybackStart = () => {
    setGameState({ ...gameState, playing: false });
  };

  const onPlaybackEnd = () => {
    let count = playbackState.pathsShown + 1;
    if (count >= playbackState.pathsToShow.length) {
      setGameState({ ...gameState, playing: true });
    }
    setPlaybackState({ ...playbackState, pathsShown: count });
  };

  const isReady = () => {
    return (
      session !== null &&
      playbackState.pathsToShow !== null &&
      gameState.gdy !== null
    );
  };

  return !isReady() ? (
    <div>loading</div>
  ) : (
    <div className="main-container">
      {!waiting && (
        <motion.div
          className="game-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: finished ? 0.1 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <InfoBar
            playing={gameState.playing}
            level={levelCount}
            numLevels={session.levels.length}
            score={gameState.score}
          />
          <Player
            gdyHash={gameState.gdyHash}
            gdy={gameState.gdy}
            occlusionWindow={session.occlusionWindows[levelCount]}
            griddlyjs={griddlyjs}
            rendererName={rendererState.rendererName}
            rendererConfig={rendererState.rendererConfig}
            height={500}
            width={800}
            onTrajectoryStep={onTrajectoryStep}
            onReward={(val) => {
              setGameState((prev) => {
                return { ...prev, score: prev.score + val };
              });
            }}
            onLevelComplete={() => {
              setlevelCount((prevCount) => prevCount + 1);
            }}
            trajectoryString={
              playbackState.pathsShown < playbackState.pathsToShow.length
                ? playbackState.pathsToShow[playbackState.pathsShown]
                : ""
            }
            onPlaybackStart={onPlaybackStart}
            onPlaybackEnd={onPlaybackEnd}
          />
        </motion.div>
      )}
      {finished && (
        <div style={{ zIndex: 10 }}>
          <div style={{ color: "white", fontSize: 36 }}>
            Experiment complete! Your final score is {gameState.score}
          </div>
          <div>You can now close this tab</div>
        </div>
      )}
      <InstructionModal
        visible={waiting}
        onStartClicked={() => {
          setWaiting(false);
        }}
        session={session}
        gdy={gameState.gdy}
      />
    </div>
  );
};

export default App;
