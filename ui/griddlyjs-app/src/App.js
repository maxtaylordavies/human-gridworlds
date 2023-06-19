import React, { useEffect, useState } from "react";
import yaml from "js-yaml";

import * as api from "./api";
import * as utils from "./utils";
import { useStore } from "./store";
import { hashString } from "./hash";
import { INTER_LEVEL_INTERVAL_MS, INTER_AGENT_INTERVAL_MS } from "./constants";
import GriddlyJSCore from "./GriddlyJSCore";
import PlayerContainer from "./components/PlayerContainer";
import InitialInstructions from "./components/InitialInstructions";
import PhaseInstructions from "./components/PhaseInstructions";
import ExperimentCompleteModal from "./components/ExperimentCompleteModal";
import LevelPopup from "./components/LevelPopup";
import QuizModal from "./components/QuizModal";
import "./App.scss";

const App = () => {
  // get state from zustand store
  const [uiState, setUIState] = useStore((state) => [
    state.uiState,
    state.setUIState,
  ]);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const [gameState, setGameState] = useStore((state) => [
    state.gameState,
    state.setGameState,
  ]);
  const score = useStore((state) => state.score);
  const [rendererState, setRendererState] = useStore((state) => [
    state.rendererState,
    state.setRendererState,
  ]);
  const trajectories = useStore((state) => state.trajectories);

  // create and initialise an instance of the GriddlyJS core
  const [griddlyjs, setGriddlyjs] = useState(new GriddlyJSCore());

  useEffect(() => {
    performSetUp();
  }, []);

  useEffect(() => {
    if (expState.session) {
      // fetch data
      fetchData();
    }
  }, [expState.session]);

  useEffect(() => {
    setGameState({ ...gameState, playing: utils.isPlaying(expState) });
  }, [expState]);

  useEffect(() => {
    const onFinished = async () => {
      await uploadTrajectories();
      await uploadFinalScore();
      utils.removeFromLocalStorage("sid");
    };

    // if gameplay is showFinishedScreen, we can upload the trajectories and final score
    // and remove the session id from localstorage
    if (uiState.showFinishedScreen) {
      onFinished();
    }
  }, [uiState.showFinishedScreen]);

  // initialise griddly, create a session on the server, and
  // then store the session in local state
  const performSetUp = async () => {
    const onSession = (sess) => {
      console.log("sess: ", sess);
      setExpState({ ...expState, session: sess });
      utils.writeToLocalStorage("sid", sess.id);
      utils.writeToLocalStorage("eid", sess.experimentId);
    };

    await griddlyjs.init().then(() => {
      console.log("griddlyjs initialised");

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
          utils.getValueFromUrlOrLocalstorage("eid"),
          utils.getProlificMetadata(),
          onSession,
          console.error
        );
      }
    });
  };

  // fetch the game spec file and the expert agents' trajectory data
  const fetchData = async () => {
    if (!expState.session) {
      return;
    }
    api.loadGameSpec(
      expState.session.griddlySpecName,
      (gdy) => {
        loadGame(setRewards(gdy));
      },
      console.error
    );
  };

  const setRewards = (gdy) => {
    const thetas = expState.session.conditions.thetas;

    gdy.Actions[0].Behaviours = gdy.Actions[0].Behaviours.map((b) => {
      let src = {
        ...b.Src,
        Commands: b.Src.Commands.map((cmd) => {
          const item = b.Dst.Object;
          return item.includes("goal") && cmd.reward !== undefined
            ? { reward: utils.itemReward(item, thetas) }
            : cmd;
        }),
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

  const uploadTrajectories = async () => {
    let traj = { ...trajectories };
    Object.keys(traj).forEach((k) => {
      traj[k] = traj[k].map((x) => x[1]).join(",");
    });
    await api.storeTrajectories(expState.session, traj);
  };

  const uploadFinalScore = async () => {
    await api.storeFinalScore(expState.session, score);
  };

  const uploadFreeTextResponse = async (response) => {
    await api.storeFreeTextResponse(expState.session, response);
  };

  const isLoading = () => {
    return !(expState.session && gameState.gdy);
  };

  return isLoading() ? (
    <div>loading...</div>
  ) : (
    <div className="main-container">
      {!uiState.showInitialInstructions && (
        <PlayerContainer griddlyjs={griddlyjs} />
      )}
      <InitialInstructions />
      <PhaseInstructions />
      <LevelPopup duration={INTER_LEVEL_INTERVAL_MS} delay={250} />
      <QuizModal />
      <ExperimentCompleteModal submitResponse={uploadFreeTextResponse} />
    </div>
  );
};

export default App;
