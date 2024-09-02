import { GameTypeStrings } from "../util/GameTypes";

const GameWinModalBody = ({
  numTiles,
  clearTime,
  gameType,
  seed,
  layoutCode,
  shareUrls,
  handleResetBoard,
  newBoardModal,
  layoutEditModal,
}) => {
  return (
    <div>
      <h1>You Win!</h1>
      <div>
        You cleared all {numTiles} tiles in
        {clearTime.hours
          ? ` ${clearTime.hours} hour${clearTime.hours > 1 ? "s" : ""}` +
            (clearTime.minutes || clearTime.seconds ? "," : "")
          : ""}
        {clearTime.minutes
          ? ` ${clearTime.minutes} minute${clearTime.minutes > 1 ? "s" : ""}` +
            (clearTime.seconds ? "," : "")
          : ""}
        {clearTime.seconds
          ? ` ${clearTime.seconds} second${clearTime.seconds > 1 ? "s" : ""}`
          : ""}
        !
      </div>
      <div>
        {GameTypeStrings[gameType]}
        <br />
        Board #{seed}
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
        <button onClick={() => handleResetBoard({ newSeed: seed })}>
          Reset Current Board
        </button>
      </div>
      <div>
        <button onClick={layoutEditModal}>Edit Puzzle Layout</button>
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
        <button onClick={() => navigator.clipboard.writeText(layoutCode)}>
          Copy Layout Code
        </button>
      </div>
    </div>
  );
};

export default GameWinModalBody;
