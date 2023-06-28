import React, { useEffect, useState } from "react";
import yaml from "js-yaml";

import * as api from "./api";
import * as utils from "./utils";
import { useStore } from "./store";
import { hashString } from "./hash";
import GriddlyJSCore from "./GriddlyJSCore";
import PlayerContainer from "./components/PlayerContainer";
import InitialInstructions from "./components/InitialInstructions";
import PhaseInstructions from "./components/PhaseInstructions";
import ExperimentCompleteModal from "./components/ExperimentCompleteModal";
import AgentPopup from "./components/AgentPopup";
import QuizModal from "./components/QuizModal";
import TextResponseModal from "./components/TextResponseModal";
import "./App.scss";

const App = () => {
  // get state from zustand store
  const uiState = useStore((state) => state.uiState);
  const [expState, setExpState] = useStore((state) => [
    state.expState,
    state.setExpState,
  ]);
  const [gameState, setGameState] = useStore((state) => [
    state.gameState,
    state.setGameState,
  ]);
  const setRendererState = useStore((state) => state.setRendererState);
  const resultsState = useStore((state) => state.resultsState);

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
    const onFinished = async () => {
      // await uploadResults();
      utils.removeFromLocalStorage("sid");
    };

    // if gameplay is showFinishedScreen, we can upload the trajectories and final score
    // and remove the session id from localstorage
    if (uiState.showFinishedScreen) {
      onFinished();
    }
  }, [uiState.showFinishedScreen]);

  useEffect(() => {
    // showQuiz being set to false
    if (expState.session && !uiState.showQuiz) {
      if (expState.phaseIdx === 0) {
        setExpState({ ...expState, phaseIdx: 1 });
      } else {
        setExpState({ ...expState, agentIdx: expState.agentIdx + 1 });
      }
    }
  }, [uiState.showQuiz]);

  useEffect(() => {
    if (expState.session && resultsState) {
      uploadResults();
    }
  }, [resultsState]);

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
      // check for existing session_id in url or localstorage
      // if we find one, then get the corresponding session from
      // the server (rather than creating a new session)
      // const sid = utils.getValueFromUrlOrLocalstorage("sid");
      // if (sid) {
      //   api.getSession(sid, onSession, console.Error);
      // } else {
      // otherwise, we create a new session on the server, passing
      // in existing experiment_id and human_id if they exist
      api.createSession(
        utils.getValueFromUrlOrLocalstorage("eid"),
        utils.getProlificMetadata(),
        onSession,
        console.error
      );
      // }
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

  const uploadResults = async () => {
    const trajectories = {};
    for (let k1 in resultsState.trajectories) {
      trajectories[k1] = {};
      for (let k2 in resultsState.trajectories[k1]) {
        trajectories[k1][k2] = resultsState.trajectories[k1][k2].join(",");
      }
    }
    const sess = {
      ...expState.session,
      trajectories: trajectories,
      finalScore: gameState.score,
      quizResponses: resultsState.quizResponses,
      textResponses: resultsState.textResponses,
    };
    await api.updateSession(sess, () => {}, console.error);
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
      <AgentPopup delay={250} />
      <QuizModal />
      <TextResponseModal />
      <ExperimentCompleteModal />
    </div>
  );
};

export default App;
