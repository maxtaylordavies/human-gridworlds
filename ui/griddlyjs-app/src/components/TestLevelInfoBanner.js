import { useStore } from "../store";

import * as utils from "../utils";

const TestLevelInfoBanner = () => {
  const expState = useStore((state) => state.expState);
  const gameState = useStore((state) => state.gameState);
  const uiState = useStore((state) => state.uiState);

  if (
    expState.phaseIdx < 2 ||
    uiState.showPhaseInstructions ||
    uiState.showLevelItemsPopup ||
    uiState.showTextResponseModal ||
    uiState.showFinishedScreen
  ) {
    return <> </>;
  }

  const items = utils.currentItems(expState, gameState);

  const info =
    expState.levelIdx === 0
      ? "same colour but different shapes"
      : "same shape but different colours";

  return (
    <div className="test-leve-info-banner">
      In this level, the hidden items are the <b>{info}</b> (
      {items.map((item) => (
        <img
          src={`resources/images/custom/items/goal${item}.png`}
          width={20}
          height={20}
          alt={item}
          style={{ marginRight: 3, marginLeft: 3 }}
        />
      ))}
      )
    </div>
  );
};

export default TestLevelInfoBanner;
