import axios from "axios";
import yaml from "js-yaml";

// helper functions
const getTokenHeaders = (token) => {
  return { Authorization: `Bearer ${token}` };
};

const get = (url, token) => {
  return axios.get(`${window.location.origin}/api/${url}`, {
    headers: getTokenHeaders(token),
  });
};

const post = (url, data, token) => {
  return axios.post(`${window.location.origin}/api/${url}`, data, {
    headers: getTokenHeaders(token),
  });
};

// endpoint functions
export const getSession = async (id, callback, onError) => {
  get(`session?id=${id}`)
    .then((response) => {
      callback(response.data);
    })
    .catch((e) => onError(e));
};

export const createSession = async (
  experimentId,
  context,
  callback,
  onError
) => {
  post("session", {
    experimentId,
    isTest: true,
    context,
  })
    .then((response) => {
      callback(response.data);
    })
    .catch((e) => onError(e));
};

export const loadGameSpec = async (callback, onError) => {
  get("game?id=multijewel")
    .then((response) => {
      callback(yaml.load(response.data));
    })
    .catch((e) => onError(e));
};

export const loadAgentPaths = async (session, callback, onError) => {
  get(
    `paths?game_id=${session.gameId}&agent_ids=${session.agentIds.join(
      ","
    )}&levels=${session.levels.join(",")}`
  )
    .then((response) => {
      callback(response.data);
    })
    .catch((e) => onError(e));
};

export const storeTrajectories = async (session, trajectories) => {
  return post("trajectories", {
    session_id: session.id,
    trajectories,
  });
};

export const storeFreeTextResponse = async (session, response) => {
  return post("freeTextResponse", {
    session_id: session.id,
    response,
  });
};

export const storeFinalScore = async (session, score) => {
  return post("finalScore", {
    session_id: session.id,
    score,
  });
};
