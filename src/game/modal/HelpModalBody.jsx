import "../board/GameBoard.css";

import Tile from "../board/Tile";
import PathNode from "../board/PathNode";

const HelpModalBody = ({ useEmoji, closeModal }) => {
  const helpImageBoardStyle = {
    fontSize: "7vmin",
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <>
      <h1>Welcome to Unicode Mahjong Tile Solitaire</h1>
      <div>
        <p>
          The goal is to clear all tiles from the board by clicking or tapping
          two matching tiles.
        </p>
        <div
          className={useEmoji ? "game-board-emoji" : "game-board-glyph"}
          style={helpImageBoardStyle}
        >
          <div>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile {...{ useEmoji }} />
              </span>
              <PathNode node={["L", "D"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x14} {...{ useEmoji }} />
              </span>
              <PathNode node={["L", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x1d} {...{ useEmoji }} />
              </span>
              <PathNode node={["R", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile {...{ useEmoji }} />
              </span>
              <PathNode node={["R", "D"]} fadeout={false} />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x14} {...{ useEmoji }} />
              </span>
              <PathNode node={["D", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x0b} {...{ useEmoji }} />
              </span>
              <PathNode node={["D", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x05} {...{ useEmoji }} />
              </span>
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile {...{ useEmoji }} />
              </span>
              <PathNode node={["D"]} fadeout={false} />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x03} {...{ useEmoji }} />
              </span>
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x0b} {...{ useEmoji }} />
              </span>
              <PathNode node={["D", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile char={0x1d} {...{ useEmoji }} />
              </span>
              <PathNode node={["L", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <span className="game-tile">
                <Tile {...{ useEmoji }} />
              </span>
              <PathNode node={["D", "L"]} fadeout={false} />
            </span>
          </div>
        </div>
        <p>
          In this type of mahjong solitaire, tiles can only be matched if they
          look the same and if there is an imaginary path of connecting lines
          between them so that the path doesn't touch any other tile. This path
          can only have up to three lines, which can form up to two "corners".
        </p>
      </div>
      <div>
        <button onClick={closeModal}>Return to Game</button>
      </div>
    </>
  );
};

export default HelpModalBody;
