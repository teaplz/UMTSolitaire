import "../board/GameBoard.css";

import Tile from "../board/Tile";
import PathNode from "../board/PathNode";

import { GameTypes } from "../GameTypes";

const HelpModalBody = ({
  gameType,
  useEmoji,
  hideModal,
  prevModal,
  hasPrevModal,
}) => {
  const helpImageBoardStyle = {
    fontSize: "7vmin",
    pointerEvents: "none",
    userSelect: "none",
  };

  const TraditionalRules = (
    <>
      <h2>Traditional Mahjong Tile Solitaire</h2>
      <p>
        The goal is to clear all tiles from the board by clicking or tapping two
        matching tiles.
      </p>
      <div
        className={useEmoji ? "game-board-emoji" : "game-board-glyph"}
        style={helpImageBoardStyle}
      >
        <div>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x05} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x14} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x14} {...{ useEmoji }} />
            </span>
          </span>
        </div>
        <div>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x1d} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x0b} {...{ useEmoji }} />
            </span>
            <span
              className="game-tile game-tile-selected"
              style={{
                top: "-0.66em",
                left: "-0.66em",
              }}
            >
              <Tile char={0x05} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile game-tile-selected">
              <Tile char={0x05} {...{ useEmoji }} />
            </span>
          </span>
        </div>
        <div>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x0b} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x05} {...{ useEmoji }} />
            </span>
          </span>
          <span className="game-board-coord">
            <span className="game-tile">
              <Tile char={0x1d} {...{ useEmoji }} />
            </span>
          </span>
        </div>
      </div>
      <p style={{ margin: "2em" }}>
        In this type of mahjong solitaire, tiles can only be matched if they
        look the same, if there are no tiles covering them, and if there are no
        tiles directly adjacent to their left or right.
      </p>
    </>
  );

  const TwoCornerRules = (
    <>
      <h2>Two-Corner Mahjong Tile Solitaire</h2>
      <p>
        The goal is to clear all tiles from the board by clicking or tapping two
        matching tiles.
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
      <p style={{ margin: "2em" }}>
        In this type of mahjong solitaire, tiles can only be matched if they
        look the same and if there is an imaginary path of connecting lines
        between them so that the path doesn't touch any other tile. This path
        can only have up to three lines, which can form up to two "corners".
      </p>
    </>
  );

  const RenderHelp = () => {
    switch (gameType) {
      case GameTypes.TRADITIONAL:
        return TraditionalRules;
      case GameTypes.TWOCORNER:
        return TwoCornerRules;
      default:
        return <div>Not sure what's being played right now, sorry!</div>;
    }
  };

  const RenderAbout = (
    <>
      <div>
        <a href="https://github.com/teaplz/UMTSolitaire">UMTSolitaire</a> v1.0
        by <a href="https://github.com/teaplz">teaplz</a>.
        <br/>
        All mahjong tile graphics are comprised of system Unicode fonts.
      </div>
    </>
  );

  return (
    <>
      <h1>How to Play</h1>
      <div>{RenderHelp()}</div>
      <div>
        {hasPrevModal ? (
          <button onClick={prevModal}>Go Back</button>
        ) : (
          <button onClick={hideModal}>Return to Game</button>
        )}
      </div>
      {hasPrevModal && (
        <>
          <hr />
          {RenderAbout}
        </>
      )}
    </>
  );
};

export default HelpModalBody;
