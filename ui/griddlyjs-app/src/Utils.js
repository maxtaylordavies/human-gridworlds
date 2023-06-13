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

export const currentLevelId = (expState) => {
  if (
    !expState ||
    !expState.session ||
    expState.phaseIdx < 0 ||
    expState.levelIdx < 0
  ) {
    return null;
  }

  const phase = expState.session.phases[expState.phaseIdx];
  const level = phase.levels[expState.levelIdx];
  return level.id;
};

export const currentAvatarImg = (expState) => {
  const defaultImg = "custom/avi-grey.png";

  if (
    !expState ||
    !expState.session ||
    expState.phaseIdx < 0 ||
    expState.levelIdx < 0
  ) {
    return defaultImg;
  }

  const phase = expState.session.phases[expState.phaseIdx];
  const level = phase.levels[expState.levelIdx];

  if (
    level.replays.length === 0 ||
    expState.replayIdx >= level.replays.length
  ) {
    return defaultImg;
  }

  const replay = level.replays[expState.replayIdx];
  return `custom/avi-${replay.agentPhi === 0 ? "red" : "blue"}.png`;
};

export const currentPlaybackTrajectory = (expState) => {
  if (
    !expState ||
    !expState.session ||
    expState.phaseIdx < 0 ||
    expState.levelIdx < 0
  ) {
    return "";
  }

  const phase = expState.session.phases[expState.phaseIdx];
  const level = phase.levels[expState.levelIdx];

  if (
    level.replays.length === 0 ||
    expState.replayIdx >= level.replays.length
  ) {
    return "";
  }

  const replay = level.replays[expState.replayIdx];
  return replay.trajectory;
};
