const GameLoseModalBody = ({
  remainingTiles,
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
        Board #{seed}
        <br />
        Layout Code: {layoutCode}
      </div>
      <div>
        <button onClick={handleUndoMatch} disabled={canUndo}>
          Undo Last Match
        </button>
      </div>
      <div>
        <button onClick={() => handleResetBoard(seed)}>
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
