import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import yaml from "js-yaml";

import GriddlyJSCore from "./GriddlyJSCore";
import Player from "./renderer/level_player/Player";
import InfoBar from "./components/InfoBar";
import InstructionModal from "./components/InstructionModal";
import ExperimentCompleteModal from "./components/ExperimentCompleteModal";
import AgentTurnPopup from "./components/AgentTurnPopup";
import LevelPopup from "./components/LevelPopup";
import ItemValues from "./components/ItemValues";
import { INTER_LEVEL_INTERVAL_MS, INTER_AGENT_INTERVAL_MS } from "./constants";
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
    currentPathIdx: -1,
    waiting: true,
  });
  const [trajectories, setTrajectories] = useState({});
  const [gameState, setGameState] = useState({
    gdy: null,
    gdyHash: 0,
    gdyString: "",
    playing: false,
    score: 100,
  });
  const [rendererState, setRendererState] = useState({
    renderers: [],
    rendererName: "",
    rendererConfig: {},
  });
  const [goalImages, setGoalImages] = useState([]);
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
    if (!gameState.gdy) {
      return;
    }

    setGoalImages(
      gameState.gdy.Objects.filter((obj) => obj.Name.includes("goal")).map(
        (obj) => obj.Observers.Sprite2D[0].Image
      )
    );

    loadLevel();
  }, [gameState.gdy]);

  useEffect(() => {
    setPlaybackState((prev) => ({ ...prev, waiting: true }));

    // if we've run through all the levels specified in the session,
    // then finish the experiment
    if (session && levelCountRef.current >= session.levels.length) {
      setFinished(true);
      // otherwise, load the next level
    } else if (gameState.gdy) {
      loadLevel();
      updatePathsToShow();
    }
  }, [levelCountRef.current]);

  useEffect(() => {
    updatePathsToShow();
  }, [session, agentPaths]);

  useEffect(() => {
    if (playbackState.pathsToShow?.length > 0) {
      updateCurrentPathIdx();
    }
  }, [playbackState.pathsToShow]);

  useEffect(() => {
    const onFinished = async () => {
      await uploadTrajectories();
      await uploadFinalScore();
      utils.removeFromLocalStorage("sid");
    };

    // if gameplay is finished, we can upload the trajectories and final score
    // and remove the session id from localstorage
    if (finished) {
      onFinished();
    }
  }, [finished]);

  // initialise griddly, create a session on the server, and
  // then store the session in local state
  const performSetUp = async () => {
    const onSession = (sess) => {
      setSession(sess);
      utils.writeToLocalStorage("sid", sess.id);
      utils.writeToLocalStorage("hid", sess.humanId);
      utils.writeToLocalStorage("eid", sess.experimentId);
    };

    await griddlyjs.init().then(() => {
      // check for existing session_id in url or localstorage
      // if we find one, then get the corresponding session from
      // the server (rather than creating a new session)
      const sid = utils.getValueFromUrlOrLocalstorage("sid");
      if (sid) {
        console.log(`found session_id ${sid}, retrieving`);
        api.getSession(sid, onSession, console.Error);
      } else {
        // otherwise, we create a new session on the server, passing
        // in existing experiment_id and human_id if they exist
        api.createSession(
          // utils.getValueFromUrlOrLocalstorage("eid"),
          "25-jan-run-1",
          utils.getValueFromUrlOrLocalstorage("hid"),
          utils.getProlificMetadata(),
          onSession,
          console.error
        );
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
    griddlyjs.reset(
      gameState.gdy.Environment.Levels[session.levels[levelCountRef.current]]
    );
  };

  const updatePathsToShow = () => {
    if (session && agentPaths) {
      if (session.levels && agentPaths.paths) {
        setPlaybackState((prev) => ({
          ...prev,
          pathsToShow:
            agentPaths.paths[session.levels[levelCountRef.current]] || [],
        }));
      }
    }
  };

  const updateCurrentPathIdx = () => {
    let i = playbackState.currentPathIdx + 1;

    while (i < playbackState.pathsToShow.length) {
      if (playbackState.pathsToShow[i]) {
        break;
      }
      i += 1;
    }

    if (i >= playbackState.pathsToShow.length) {
      i = -1;
      setGameState({ ...gameState, playing: true });
    }

    setPlaybackState((prev) => ({ ...prev, currentPathIdx: i }));
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

  const uploadTrajectories = async () => {
    let traj = { ...trajectoriesRef.current };
    Object.keys(traj).forEach((k) => {
      traj[k] = traj[k].map((x) => x[1]).join(",");
    });
    await api.storeTrajectories(session, traj);
  };

  const uploadFinalScore = async () => {
    await api.storeFinalScore(session, gameState.score);
  };

  const uploadFreeTextResponse = async (response) => {
    await api.storeFreeTextResponse(session, response);
  };

  const onPlaybackStart = () => {
    setGameState({ ...gameState, playing: false });
  };

  const isReady = () => {
    return (
      session !== null &&
      playbackState.pathsToShow !== null &&
      gameState.gdy !== null
    );
  };

  return !isReady() ? (
    <div>loading...</div>
  ) : (
    <div className="main-container">
      {!waiting && (
        <motion.div
          className="game-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: finished ? 0.1 : 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* <ItemValues session={session} goalImages={goalImages} /> */}
          <InfoBar
            session={session}
            avatarPath={
              session.agentAvatars[
                session.agentIds[playbackState.currentPathIdx]
              ] || ""
            }
            level={levelCountRef.current}
            score={gameState.score}
          />
          <Player
            gdyHash={gameState.gdyHash}
            gdy={gameState.gdy}
            levelIdx={session.levels[levelCountRef.current]}
            avatarPath={
              session.agentAvatars[
                session.agentIds[playbackState.currentPathIdx]
              ] || "sprite2d/player.png"
            }
            griddlyjs={griddlyjs}
            rendererName={rendererState.rendererName}
            rendererConfig={rendererState.rendererConfig}
            height={500}
            width={800}
            onTrajectoryStep={onTrajectoryStep}
            onReward={(val) => {
              setGameState((prev) => {
                return {
                  ...prev,
                  score: prev.score + val,
                };
              });
            }}
            onLevelComplete={() => {
              setlevelCount((prevCount) => prevCount + 1);
            }}
            trajectoryString={
              playbackState.currentPathIdx < playbackState.pathsToShow.length
                ? playbackState.pathsToShow[playbackState.currentPathIdx]
                : ""
            }
            waitToBeginPlayback={playbackState.waiting}
            onPlaybackStart={onPlaybackStart}
            onPlaybackEnd={updateCurrentPathIdx}
            // beforePlaybackMs={
            //   // if first agent, wait for level popup to finish
            //   INTER_AGENT_INTERVAL_MS +
            //   (playbackState.currentPathIdx ===
            //   playbackState.pathsToShow.findIndex((p) => p !== "")
            //     ? INTER_LEVEL_INTERVAL_MS
            //     : 0)
            // }
            beforePlaybackMs={INTER_AGENT_INTERVAL_MS}
          />
        </motion.div>
      )}
      <InstructionModal
        visible={waiting}
        onStartClicked={() => {
          setWaiting(false);
        }}
        session={session}
        goalImages={goalImages}
      />
      <LevelPopup
        session={session}
        gdy={gameState.gdy}
        goalImages={goalImages}
        paths={playbackState.pathsToShow}
        levelIdx={levelCountRef.current}
        ready={
          !(
            waiting ||
            finished ||
            levelCountRef.current >= session.levels.length
          )
        }
        duration={INTER_LEVEL_INTERVAL_MS}
        delay={250}
        onProceed={() =>
          setPlaybackState((prev) => ({ ...prev, waiting: false }))
        }
      />
      {/* <AgentTurnPopup
        agentImage={
          session.agentAvatars[
            session.agentIds[playbackState.currentPathIdx]
          ] || ""
        }
        ready={!(waiting || finished)}
        delay={
          playbackState.currentPathIdx === 0 ? INTER_LEVEL_INTERVAL_MS : 250
        }
        duration={
          INTER_AGENT_INTERVAL_MS +
          (playbackState.currentPathIdx === 0 ? INTER_LEVEL_INTERVAL_MS : 0)
        }
      /> */}
      <ExperimentCompleteModal
        visible={finished}
        score={gameState.score}
        submitResponse={uploadFreeTextResponse}
      />
    </div>
  );
};

export default App;
