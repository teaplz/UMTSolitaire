import { GameTypeStrings } from "../util/GameTypes";

const GameLoseModalBody = ({
  remainingTiles,
  gameType,
  seed,
  layoutCode,
  canUndo,
  shareUrls,
  handleUndoMatch,
  handleResetBoard,
  newBoardModal,
}) => {
  return (
    <div>
      <h1>You Have No Valid Moves!</h1>
      <div>
        You still have {remainingTiles} tiles remaining, but cannot match any
        more tiles!
      </div>
      <div>
        {GameTypeStrings[gameType]}
        <br />
        Board #{seed}
        <br />
        Layout Code: <input value={layoutCode} readOnly />
      </div>
      <div>
        <button onClick={handleUndoMatch} disabled={canUndo}>
          Undo Last Match
        </button>
      </div>
      <div>
        <button onClick={() => handleResetBoard({ newSeed: seed })}>
          Reset Current Board
        </button>
      </div>
      <div>
        <button onClick={handleResetBoard}>
          Start New Board with Same Layout
        </button>
      </div>
      <div>
        <button onClick={newBoardModal}>Start New Board</button>
      </div>
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
      </div>
    </div>
  );
};

export default GameLoseModalBody;
