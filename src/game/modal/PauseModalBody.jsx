import { GameTypeStrings } from "../GameTypes";

const PauseModalBody = ({
  gameType,
  seed,
  layoutCode,
  shareUrls,
  tilesMatchable,
  resetGameState,
  hideModal,
  newBoardModal,
  advancedSettingsModal,
  backgroundColorModal,
  layoutEditModal,
}) => {
  return (
    <div>
      <h1>Paused</h1>
      <div>
        {GameTypeStrings[gameType]}
        <br />
        Board #{seed}
      </div>
      <div>Current number of tiles that can be matched: {tilesMatchable}</div>
      <div>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrls.gameUrl)}
        >
          Copy Game Link (same board #)
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrls.layoutUrl)}
        >
          Copy Game Link
        </button>
        <button onClick={() => navigator.clipboard.writeText(layoutCode)}>
          Copy Layout Code
        </button>
      </div>
      <div>
        <button onClick={newBoardModal}>Start New Board</button>
      </div>
      <div>
        <button onClick={() => resetGameState({ newSeed: seed })}>
          Reset Current Board
        </button>
      </div>
      <div>
        <button onClick={backgroundColorModal}>Change Background</button>
      </div>
      <div>
        <button onClick={layoutEditModal}>Edit Puzzle Layout</button>
      </div>
      <div>
        <button onClick={advancedSettingsModal}>Advanced Options</button>
      </div>
      <div>
        <button onClick={hideModal}>Return to Game</button>
      </div>
    </div>
  );
};

export default PauseModalBody;
