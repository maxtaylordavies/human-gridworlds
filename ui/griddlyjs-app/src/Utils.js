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

export const currentPhase = (expState) => {
  if (!expState || !expState.session || expState.phaseIdx < 0) {
    return null;
  }

  return expState.session.phases[expState.phaseIdx];
};

export const currentLevel = (expState) => {
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
  const ar = currentAgentReplay(expState);
  if (!ar || expState.replayIdx >= ar.replays.length) {
    return true;
  }
  return false;
};

export const currentAgentReplay = (expState) => {
  const phase = currentPhase(expState);
  if (
    !phase ||
    !phase.agentReplays ||
    phase.agentReplays.length === 0 ||
    expState.agentIdx >= phase.agentReplays.length
  ) {
    return null;
  }
  return phase.agentReplays[expState.agentIdx];
};

export const currentThetas = (expState) => {
  const ar = currentAgentReplay(expState);
  return ar ? ar.agentThetas : expState.session.conditions.thetas;
};

export const currentPhi = (expState) => {
  const ar = currentAgentReplay(expState);
  return ar ? ar.agentPhi : expState.session.conditions.phi;
};

export const currentAgentColor = (expState) => {
  const phi = currentPhi(expState);

  if (phi === 0) {
    return "red";
  } else if (phi === 1) {
    return "blue";
  }

  return "grey";
};

export const currentAvatarImg = (expState) => {
  const color = currentAgentColor(expState);
  const filename = isPlaying(expState)
    ? `avi-${color}-smile.png`
    : `avi-${color}.png`;

  return `custom/avatars/${filename}`;
};

export const currentReplay = (expState) => {
  const ar = currentAgentReplay(expState);
  if (!ar) {
    return null;
  }
  return ar.replays[expState.replayIdx];
};

export const currentStartPos = (expState) => {
  const replay = currentReplay(expState);
  if (replay) {
    return replay.startPos;
  }
  const level = currentLevel(expState);
  if (
    level &&
    level.startPos &&
    level.startPos.x !== -1 &&
    level.startPos.y !== -1
  ) {
    return level.startPos;
  }
  return null;
};

export const shouldHideGoals = (expState) => {
  const phase = currentPhase(expState);
  if (!phase) {
    return false;
  }
  return phase.objectsHidden;
};

export const currentAgentName = (expState) => {
  const ar = currentAgentReplay(expState);
  if (!ar) {
    return "you";
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

export const agentEmoji = (expState, itemName) => {
  const x = OBJECT_FEATURE_MAP[itemName];
  let corr = expState.session.conditions.correlation;
  let phi = currentPhi(expState);
  if (phi < 0) {
    corr = 0;
    phi = currentAgentName(expState) === "Alex" ? 0 : 1;
  }

  return x[corr] === phi ? "😀" : "🙁";
};

export const computeNameBadgePos = (expState, gameState) => {
  const pos = { left: 0, top: 0 };

  if (!gameState.gdy) {
    return pos;
  }

  const levelId = currentLevelId(expState);
  if (levelId === null) {
    return pos;
  }

  let rows = gameState.gdy.Environment.Levels[levelId]
    .split("\n")
    .filter((r) => r.length > 0);
  const gridHeight = rows.length * 60;
  const gridWidth = (rows[0].length / 4) * 60;

  pos.left = 0.5 * (800 - gridWidth) - 5; // set to top left corner of grid
  pos.left += 60 * gameState.agentPos.x; // add offset for current x position

  pos.top = 0.5 * (600 - gridHeight) + 30; // set to top left corner of grid
  pos.top += 60 * gameState.agentPos.y; // add offset for current y position

  return pos;
};
