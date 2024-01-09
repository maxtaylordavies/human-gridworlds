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
  isTest,
  condition,
  context,
  callback,
  onError
) => {
  post("session", {
    experimentId,
    isTest,
    condition,
    context,
  })
    .then((response) => {
      callback(response.data);
    })
    .catch((e) => onError(e));
};

export const updateSession = async (session, callback, onError) => {
  post("update-session", session)
    .then((response) => {
      callback();
    })
    .catch((e) => onError(e));
};

export const loadGameSpec = async (specName, callback, onError) => {
  get(`game?id=${specName}`)
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
