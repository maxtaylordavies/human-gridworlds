import { BASE_ITEM_REWARD, OBJECT_KEY_TO_IDX } from "./constants";

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

export const shuffleArray = (arr) => {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
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
  const level = currentLevel(expState);
  return level ? level.id : null;
};

export const isPlaying = (expState) => {
  const sa = currentSimAgent(expState);
  return sa === null;
};

export const currentSimAgent = (expState) => {
  const phase = currentPhase(expState);
  if (
    !phase ||
    !phase.agents ||
    phase.agents.length === 0 ||
    expState.agentIdx >= phase.agents.length
  ) {
    return null;
  }
  return phase.agents[expState.agentIdx];
};

export const currentTheta = (expState) => {
  const sa = currentSimAgent(expState);
  return sa ? sa.theta : expState.session.theta;
};

export const currentPhi = (expState) => {
  const sa = currentSimAgent(expState);
  return sa ? sa.phi : expState.session.phi;
};

export const phiToRGBString = (phi) => {
  if (!phi) {
    return "rgb(0, 0, 0)";
  }
  return `rgb(${phi.map((x) => Math.floor(x * 255)).join(", ")})`;
};

export const currentAvatarImg = (expState) => {
  const phi = currentPhi(expState);
  const color = phi[0] > phi[2] ? "red" : "blue";
  // const color = currentAgentColor(expState);
  const filename = isPlaying(expState)
    ? `avi-${color}-smile.png`
    : `avi-${color}.png`;

  return `custom/avatars/${filename}`;
};

export const currentStartPos = (expState) => {
  const level = currentLevel(expState);
  if (!level?.startPositions) {
    return null;
  }
  if (expState.startPosIdx > level.startPositions.length) {
    return null;
  }
  return level.startPositions[expState.startPosIdx];
};

export const shouldHideGoals = (expState) => {
  const phase = currentPhase(expState);
  if (!phase) {
    return false;
  }
  return phase.objectsHidden;
};

export const currentAgentName = (expState) => {
  const sa = currentSimAgent(expState);
  if (!sa) {
    return "you";
  }
  return "agent";
};

export const getLevelImage = (expState) => {
  const phase = currentPhase(expState);
  const level = currentLevel(expState);
  if (level === null) {
    return "";
  }
  const fn = phase.objectsHidden ? "mystery" : level.id;
  return `resources/images/custom/levels/${fn}.png`;
};

export const itemReward = (itemName, theta) => {
  const idx = OBJECT_KEY_TO_IDX[itemName];
  return Math.round(theta[idx] * BASE_ITEM_REWARD);
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
  pos.top = 0.5 * (600 - gridHeight) + 25; // set to top left corner of grid
  pos.top += 60 * gameState.agentPos.y; // add offset for current y position

  return pos;
};
