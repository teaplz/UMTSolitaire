import { GameTypeStrings } from "../GameTypes";

const GameEndModalBody = ({
  gameWon,
  numTiles,
  remainingTiles,
  canUndo,
  clearTime,
  gameType,
  seed,
  layoutCode,
  shareUrls,
  handleUndoMatch,
  handleResetBoard,
  newBoardModal,
  helpModal,
  settingsModal,
  layoutEditModal,
}) => {
  return (
    <>
      {gameWon ? (
        <>
          <h1>You Win!</h1>
          <div>
            You cleared all {numTiles} tiles in
            {clearTime.hours
              ? ` ${clearTime.hours} hour${clearTime.hours > 1 ? "s" : ""}` +
                (clearTime.minutes || clearTime.seconds ? "," : "")
              : ""}
            {clearTime.minutes
              ? ` ${clearTime.minutes} minute${
                  clearTime.minutes > 1 ? "s" : ""
                }` + (clearTime.seconds ? "," : "")
              : ""}
            {clearTime.seconds
              ? ` ${clearTime.seconds} second${
                  clearTime.seconds > 1 ? "s" : ""
                }`
              : ""}
            !
          </div>
        </>
      ) : (
        <>
          <h1>You Have No Valid Moves!</h1>
          <div>
            You still have {remainingTiles} tiles remaining, but cannot match
            any more tiles!
          </div>
        </>
      )}
      <div>
        {GameTypeStrings[gameType]}
        <br />
        Board #{seed}
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
      <div className="buttonMenu bm-limit3">
        {!gameWon && (
          <button onClick={handleUndoMatch} disabled={canUndo}>
            <svg
              width="2em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <polygon points="11 19 2 12 11 5 11 19"></polygon>
              <polygon points="22 19 13 12 22 5 22 19"></polygon>
            </svg>
            <br />
            Undo Last Match
          </button>
        )}
        <button onClick={newBoardModal}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <polygon points="5 19  19 12  5 5  5 19"></polygon>
          </svg>
          <br />
          Start New Board
        </button>
        <button onClick={() => handleResetBoard({ newSeed: seed })}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m11.78,18.74c-3.58,0 -6.5,-2.9 -6.5,-6.47c0,-3.57 2.91,-6.47 6.5,-6.47c2.49,0 4.66,1.4 5.75,3.46l4.14,0c-1.29,-4.22 -5.23,-7.29 -9.89,-7.29c-5.71,0 -10.34,4.61 -10.34,10.29c0,5.68 4.63,10.29 10.34,10.29c2.98,0 5.66,-1.25 7.55,-3.26l-2.81,-2.62c-1.19,1.26 -2.87,2.05 -4.74,2.05z" />
            <polygon points="22,5 22,13 14,11" />
          </svg>
          <br />
          Reset Current Board
        </button>
        <button onClick={layoutEditModal}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m22.74,9.58c0.29,-0.29 0.29,-0.77 0,-1.06l-1.1,-1.12c-0.25,-0.25 -0.64,-0.29 -0.93,-0.09l-2.32,1.6l1.57,-2.38c0.2,-0.3 0.16,-0.69 -0.09,-0.95l-2.39,-2.44c-0.22,-0.22 -0.56,-0.28 -0.84,-0.14l-0.41,0.2l0.2,-0.45c0.13,-0.28 0.07,-0.62 -0.15,-0.84l-0.75,-0.76c-0.29,-0.29 -0.75,-0.29 -1.04,0l-5.84,5.94l8.27,8.42l5.84,-5.94z" />
            <path d="m7.54,8.21l-1.69,1.72c-0.14,0.14 -0.22,0.33 -0.22,0.53s0.08,0.39 0.22,0.53l1.6,1.63c0.31,0.31 0.46,0.75 0.41,1.19c-0.05,0.44 -0.29,0.83 -0.66,1.07c-4.71,3.05 -5.15,3.5 -5.29,3.65c-1.04,1.05 -1.04,2.77 0,3.82c1.04,1.05 2.72,1.05 3.76,0c0.14,-0.15 0.58,-0.59 3.59,-5.39c0.23,-0.37 0.62,-0.62 1.05,-0.67c0.44,-0.05 0.86,0.1 1.17,0.42l1.6,1.63c0.29,0.29 0.75,0.29 1.04,0l1.69,-1.72l-8.27,-8.42zm-2.97,12.93c-0.41,0.41 -1.06,0.41 -1.47,0c-0.41,-0.41 -0.41,-1.08 0,-1.5c0.41,-0.41 1.06,-0.41 1.47,0c0.41,0.41 0.41,1.08 0,1.5z" />
          </svg>
          <br />
          Edit Puzzle Layout
        </button>
        <button onClick={settingsModal}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="#000000"
            strokeWidth="2"
          >
            <path d="m22.39,13.63c0.39,-0.03 0.69,-0.36 0.69,-0.75l0,-1.81c0,-0.4 -0.3,-0.72 -0.69,-0.76l-2.37,-0.19c-0.15,-0.01 -0.28,-0.11 -0.34,-0.25l-0.78,-1.9c-0.06,-0.14 -0.03,-0.3 0.06,-0.42l1.54,-1.82c0.25,-0.3 0.24,-0.75 -0.04,-1.03l-1.26,-1.28c-0.28,-0.28 -0.72,-0.3 -1.02,-0.04l-1.81,1.56c-0.11,0.1 -0.27,0.12 -0.41,0.07l-1.88,-0.79c-0.14,-0.06 -0.23,-0.19 -0.25,-0.34l-0.18,-2.39c-0.03,-0.39 -0.36,-0.7 -0.75,-0.7l-1.79,0c-0.39,0 -0.72,0.3 -0.75,0.7l-0.19,2.39c-0.01,0.15 -0.11,0.28 -0.25,0.34l-1.88,0.79c-0.14,0.06 -0.3,0.03 -0.41,-0.07l-1.8,-1.56c-0.3,-0.26 -0.74,-0.24 -1.02,0.04l-1.26,1.28c-0.28,0.28 -0.29,0.73 -0.04,1.03l1.54,1.82c0.1,0.12 0.12,0.28 0.06,0.42l-0.78,1.9c-0.06,0.14 -0.19,0.24 -0.34,0.25l-2.37,0.19c-0.39,0.03 -0.69,0.36 -0.69,0.76l0,1.8c0,0.4 0.3,0.72 0.69,0.76l2.37,0.19c0.15,0.01 0.28,0.11 0.34,0.25l0.78,1.9c0.06,0.14 0.03,0.3 -0.06,0.42l-1.54,1.82c-0.25,0.3 -0.24,0.75 0.04,1.03l1.26,1.28c0.28,0.28 0.72,0.3 1.02,0.04l1.8,-1.56c0.11,-0.1 0.27,-0.12 0.41,-0.07l1.88,0.79c0.14,0.06 0.23,0.19 0.25,0.34l0.18,2.39c0.03,0.39 0.36,0.7 0.75,0.7l1.79,0c0.39,0 0.72,-0.3 0.75,-0.7l0.18,-2.39c0.01,-0.15 0.11,-0.28 0.25,-0.34l1.88,-0.79c0.14,-0.06 0.3,-0.03 0.41,0.07l1.81,1.56c0.3,0.26 0.74,0.24 1.02,-0.04l1.26,-1.28c0.28,-0.28 0.29,-0.73 0.04,-1.03l-1.54,-1.82c-0.1,-0.12 -0.12,-0.28 -0.06,-0.42l0.78,-1.9c0.06,-0.14 0.19,-0.24 0.34,-0.25l2.37,-0.19zm-10.36,2.12c-1,0 -1.94,-0.39 -2.64,-1.11c-0.71,-0.71 -1.09,-1.66 -1.09,-2.67c0,-1.01 0.39,-1.96 1.09,-2.67c0.71,-0.71 1.64,-1.11 2.64,-1.11c1,0 1.94,0.39 2.64,1.11c0.71,0.71 1.09,1.66 1.09,2.67c0,1.01 -0.39,1.96 -1.09,2.67c-0.71,0.71 -1.64,1.11 -2.64,1.11z" />
          </svg>
          <br />
          Settings
        </button>
        <button onClick={helpModal}>
          <svg
            width="2em"
            viewBox="0 0 30 30"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m15.24,7.64c1.85,0 2.97,0.99 2.97,2.66c0,3.03 -5.42,3.87 -5.42,7.55c0,0.99 0.65,2.07 1.98,2.07c2.05,0 1.8,-1.51 2.54,-2.6c0.99,-1.45 5.6,-3 5.6,-7.02c0,-4.36 -3.9,-6.19 -7.86,-6.19c-3.77,0 -7.24,2.69 -7.24,5.73c0,1.23 0.93,1.88 2.02,1.88c2.99,0.01 1.45,-4.08 5.41,-4.08z" />
            <path d="m17.44,24.47c0,-1.39 -1.15,-2.53 -2.54,-2.53s-2.54,1.14 -2.54,2.53c0,1.4 1.15,2.54 2.54,2.54s2.54,-1.14 2.54,-2.54z" />
            <path d="m30.12,15.01c0,-8.28 -6.76,-15.01 -15.06,-15.01s-15.06,6.73 -15.06,15.01s6.76,15.01 15.06,15.01s15.06,-6.73 15.06,-15.01zm-28.62,0c0,-7.45 6.08,-13.51 13.56,-13.51c7.48,0 13.56,6.06 13.56,13.51c0,7.45 -6.08,13.51 -13.56,13.51c-7.48,0 -13.56,-6.06 -13.56,-13.51z" />
          </svg>
          <br />
          Help & About
        </button>
      </div>
    </>
  );
};

export default GameEndModalBody;
