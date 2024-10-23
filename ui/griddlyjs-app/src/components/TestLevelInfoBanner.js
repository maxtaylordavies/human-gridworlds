import { useStore } from "../store";

const TestLevelInfoBanner = () => {
  const expState = useStore((state) => state.expState);
  const uiState = useStore((state) => state.uiState);
  if (
    expState.phaseIdx < 2 ||
    uiState.showPhaseInstructions ||
    uiState.showTextResponseModal
  ) {
    return <> </>;
  }

  const info =
    expState.levelIdx === 0
      ? "same colour but different shapes"
      : "same shape but different colours";

  return (
    <div className="test-leve-info-banner">
      In this level, the hidden items are the <b>{info}</b>
    </div>
  );
};

export default TestLevelInfoBanner;
