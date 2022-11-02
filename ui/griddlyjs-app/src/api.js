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
export const loadGameSpec = async (id, callback, onError) => {
  get(`game?id=${id}`)
    .then((response) => {
      callback(yaml.load(response.data));
    })
    .catch((e) => onError(e));
};
