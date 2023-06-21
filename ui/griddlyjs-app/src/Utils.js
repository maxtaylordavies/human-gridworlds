import { OBJECT_FEATURE_MAP } from "./constants";

export const getValueFromUrlOrLocalstorage = (key) => {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get(key) || JSON.parse(localStorage.getItem(`_gridworlds_${key}`))
  );
};

export const getProlificMetadata = () => {
  const metadata = {};
  const params = new URLSearchParams(window.location.search);
  params.forEach((val, key) => {
    if (key.startsWith("PRLFC")) {
      metadata[key] = val;
    }
  });
  return metadata;
};

export const writeToLocalStorage = (key, val) => {
  localStorage.setItem(`_gridworlds_${key}`, JSON.stringify(val));
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(`_gridworlds_${key}`);
};

export const findCompatibleRenderers = (observers, objects) => {
  const compatibleRenderers = new Map([
    [
      "Sprite2D",
      {
        Type: "SPRITE_2D",
        TileSize: 24,
        RotateAvatarImage: true,
      },
    ],
    [
      "Block2D",
      {
        Type: "BLOCK_2D",
        TileSize: 24,
        RotateAvatarImage: true,
      },
    ],
  ]);

  for (const [rendererName, config] of compatibleRenderers) {
    if (rendererName in observers) {
      compatibleRenderers.set(rendererName, {
        ...config,
        ...observers[rendererName],
      });
    }
  }

  // Search through observers for custom observer types
  for (const observerName in observers) {
    const observer = observers[observerName];

    // Ignore the default observers
    if (
      observerName !== "Sprite2D" &&
      observerName !== "Block2D" &&
      observerName !== "Entity" &&
      observerName !== "ASCII" &&
      observerName !== "Vector"
    ) {
      const observerType = observer.Type;

      // Only consider fully observable sprite and block observers
      if (observerType === "SPRITE_2D" || observerType === "BLOCK_2D") {
        if (
          !observer.Width &&
          !observer.Height &&
          !observer.OffsetX &&
          !observer.OffsetY &&
          !observer.Shader
        ) {
          compatibleRenderers.set(observerName, observer);
        }
      }
    }
  }

  const observersInObjects = new Set();

  // Search through objects for observer names
  for (const o in objects) {
    const object = objects[o];

    // Remove any observers that are missing definitions in objects and warn about them
    for (const observerName in object.Observers) {
      observersInObjects.add(observerName);
    }
  }

  for (const [rendererName, config] of compatibleRenderers) {
    if (!observersInObjects.has(rendererName)) {
      compatibleRenderers.delete(rendererName);
    }
  }

  return compatibleRenderers;
};

const currentPhase = (expState) => {
  if (!expState || !expState.session || expState.phaseIdx < 0) {
    return null;
  }

  return expState.session.phases[expState.phaseIdx];
};

const currentLevel = (expState) => {
  const phase = currentPhase(expState);
  if (!phase) {
    return null;
  }
  return phase.levels[expState.levelIdx];
};

export const currentLevelId = (expState) => {
  if (isPlaying(expState)) {
    const level = currentLevel(expState);
    return level ? level.id : null;
  }

  const ar = currentAgentReplay(expState);
  if (!ar) {
    return null;
  }

  return ar.replays[expState.replayIdx].levelId;
};

export const isPlaying = (expState) => {
  const phase = currentPhase(expState);
  if (!phase) {
    return false;
  }

  const ar = phase.agentReplays;
  if (
    !ar ||
    expState.agentIdx >= ar.length ||
    expState.replayIdx >= ar[expState.agentIdx].replays.length
  ) {
    return true;
  }
  return false;
};

export const currentAgentReplay = (expState) => {
  const phase = currentPhase(expState);
  if (!phase || isPlaying(expState)) {
    return null;
  }
  return phase.agentReplays[expState.agentIdx];
};

export const currentAvatarImg = (expState) => {
  let avi = "grey-smile";
  const ar = currentAgentReplay(expState);
  if (ar) {
    if (ar.agentPhi === 0) {
      avi = "red";
    } else if (ar.agentPhi === 1) {
      avi = "blue";
    } else {
      avi = "grey";
    }
  }
  return `custom/avatars/avi-${avi}.png`;
};

export const currentReplay = (expState) => {
  const ar = currentAgentReplay(expState);
  if (!ar) {
    return null;
  }
  return ar.replays[expState.replayIdx];
};

export const shouldHideGoals = (expState) => {
  const phase = currentPhase(expState);
  if (!phase) {
    return false;
  }
  return phase.objectsHidden;
};

export const getAgentName = (expState) => {
  const ar = currentAgentReplay(expState);
  if (!ar) {
    return "";
  }
  return ar.agentName;
};

export const getLevelImage = (expState) => {
  const phase = currentPhase(expState);
  const levelId = currentLevelId(expState);
  if (phase === null || levelId === null) {
    return "";
  }
  const fn = phase.objectsHidden ? "mystery" : levelId;
  return `resources/images/custom/levels/${fn}.png`;
};

export const itemReward = (itemName, thetas) => {
  const x = OBJECT_FEATURE_MAP[itemName];
  let r = 0;
  for (let i = 0; i < x.length; i++) {
    r += thetas[i][x[i]];
  }
  return r;
};
