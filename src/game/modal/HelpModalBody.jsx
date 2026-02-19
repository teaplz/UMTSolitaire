import "../board/GameBoard.css";

import ClassNames from "classnames";

import Tile from "../board/Tile";
import PathNode from "../board/PathNode";

import { GameTypes } from "../GameTypes";

const HelpModalBody = ({
  gameType,
  useEmoji,
  lowDetailMode,
  hideModal,
  prevModal,
  hasPrevModal,
}) => {
  const helpImageBoardStyle = {
    fontSize: "5em",
    pointerEvents: "none",
  };

  const TraditionalRules = (
    <>
      <h2>Traditional Mahjong Tile Solitaire</h2>
      <p>
        The goal is to clear all tiles from the board by clicking or tapping two
        matching tiles.
      </p>
      <div
        className={ClassNames(
          "game-board",
          lowDetailMode ? "game-board-low" : null
        )}
        style={helpImageBoardStyle}
      >
        <div className={useEmoji ? "game-board-emoji" : "game-board-glyph"}>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x05} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x14} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x14} {...{ useEmoji }} />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x1d} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x0b} {...{ useEmoji }} />
              <Tile
                className="game-tile game-tile-selected"
                styleTop="-0.16em"
                styleLeft="-0.16em"
                char={0x05}
                {...{ useEmoji }}
              />
            </span>
            <span className="game-board-coord">
              <Tile
                className="game-tile game-tile-selected"
                char={0x05}
                {...{ useEmoji }}
              />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x0b} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x05} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x1d} {...{ useEmoji }} />
            </span>
          </div>
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
        className={ClassNames(
          "game-board",
          lowDetailMode ? "game-board-low" : null
        )}
        style={helpImageBoardStyle}
      >
        <div className={useEmoji ? "game-board-emoji" : "game-board-glyph"}>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" {...{ useEmoji }} />
              <PathNode node={["L", "D"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x14} {...{ useEmoji }} />
              <PathNode node={["L", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x1d} {...{ useEmoji }} />
              <PathNode node={["R", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" {...{ useEmoji }} />
              <PathNode node={["R", "D"]} fadeout={false} />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x14} {...{ useEmoji }} />
              <PathNode node={["D", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x0b} {...{ useEmoji }} />
              <PathNode node={["D", "-start"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x05} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" {...{ useEmoji }} />
              <PathNode node={["D"]} fadeout={false} />
            </span>
          </div>
          <div>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x03} {...{ useEmoji }} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x0b} {...{ useEmoji }} />
              <PathNode node={["D", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" char={0x1d} {...{ useEmoji }} />
              <PathNode node={["L", "-end"]} fadeout={false} />
            </span>
            <span className="game-board-coord">
              <Tile className="game-tile" {...{ useEmoji }} />
              <PathNode node={["D", "L"]} fadeout={false} />
            </span>
          </div>
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
        <a href="https://github.com/teaplz/UMTSolitaire">UMTSolitaire</a> v1.1
        by <a href="https://github.com/teaplz">teaplz</a>.
        <br />
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
