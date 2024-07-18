import { useState, useEffect, Fragment } from "react";

import Tile from "./Tile";
import PathNode from "./PathNode";

import "./GameBoard.css";

export default function GameBoard({
  boardWidth,
  boardHeight,
  tiles,
  pathingTiles,
  hintedTiles,
  wholeMatchingTiles,
  selectedTile,
  useEmoji,
  fixRedDragonBugs,
  handleTileClick,
}) {
  // These are stored as arrays of rows of tiles.
  const [tileMap, setTileMap] = useState([]);

  // Regenerate tile maps every time the tile layout changes.
  useEffect(() => {
    const tileMap = [];

    for (let y = 0; y < boardHeight + 2; y++) {
      tileMap[y] = tiles.slice(
        y * (boardWidth + 2),
        (y + 1) * (boardWidth + 2)
      );
    }

    setTileMap(tileMap);
  }, [tiles]);

  // Change the key for the pathing elements so that on a new path, any
  // current element that's in an animation is not reused, causing an issue
  // with CSS animation.
  const [curPathingKey, setCurPathingKey] = useState(1);

  useEffect(() => setCurPathingKey(~curPathingKey), [pathingTiles]);

  const renderTileMap = () => {
    return tileMap.map((row, index) => (
      <div key={"board-" + index}>
        {row.map((val) => (
          <Fragment key={val.id}>
            <Tile
              char={val.char}
              useEmoji={useEmoji}
              isSelected={val.id === selectedTile}
              canBeMatchedWithSelected={
                hintedTiles?.includes(val) && !val.inRemovalAnim
              }
              canBeMatchedWithOther={wholeMatchingTiles?.includes(val.id)}
              isFadingOut={val.inRemovalAnim}
              onClick={() => handleTileClick(val.id)}
              fixRedDragonBugs={fixRedDragonBugs}
            />
            {pathingTiles[val.id] && (
              <PathNode key={curPathingKey} node={pathingTiles[val.id]} />
            )}
          </Fragment>
        ))}
      </div>
    ));
  };

  const [horizontalTileStyle, setHorizontalTileStyle] = useState({});
  const [verticalTileStyle, setVerticalTileStyle] = useState({});

  useEffect(() => {
    // Set the font size based on magic numbers and the size of the board.
    // TODO: Better way of doing this.

    // For landscape/widescreen orientation, have the font size determined by
    // either width or height, based on the size of the board and the current
    // aspect ratio.
    setHorizontalTileStyle({
      fontSize:
        "min(" +
        (useEmoji
          ? emojiFontSizeWidths[Math.min(Math.max(boardWidth, 2), 20) - 2]
          : glyphFontSizeWidths[Math.min(Math.max(boardWidth, 2), 20) - 2]) +
        "vw, " +
        (useEmoji
          ? emojiFontSizeHeights[Math.min(Math.max(boardHeight, 2), 12) - 2]
          : glyphFontSizeHeights[Math.min(Math.max(boardHeight, 2), 12) - 2]) +
        "vh)",
    });

    // For portrait orientation, have the font size determined by the height
    // and use a scrollbar. Adjust for both the scrollbar and a potentially
    // larger game bar. Do not make it so large that scrolling is difficult.
    setVerticalTileStyle({
      fontSize:
        (useEmoji
          ? emojiFontSizeHeights[Math.min(Math.max(boardHeight, 5), 12) - 2] - 1
          : glyphFontSizeHeights[Math.min(Math.max(boardHeight, 5), 12) - 2] -
            1) + "vh",
    });
  }, [boardWidth, boardHeight, useEmoji]);

  // Render three nesting divs: one that handles the main game board in its
  // widescreen orientation, one that changes it for the portrait orientation,
  // and one that handles the game's font (which is determined by whether or not
  // the game-board-v div overwrites the game-board div).
  return (
    <div className="game-board" style={horizontalTileStyle}>
      <div className="game-board-v" style={verticalTileStyle}>
        <div className={useEmoji ? "game-board-emoji" : "game-board-glyph"}>
          {renderTileMap()}
        </div>
      </div>
    </div>
  );
}

// Magic numbers for use in font size calculations.
// These were obtained through browser testing (changed until scrollbar became
// visible in Chrome). These are very loose approximations and only apply to a
// particular font and browser. TODO: Better way of doing this.

const emojiFontSizeWidths = [
  20.7, 20.7, 17.8, 15.3, 13.4, 11.9, 10.7, 9.7, 8.9, 8.2, 7.6, 7.1, 6.7, 6.3,
  5.9, 5.6, 5.3, 5.1, 4.8,
];
const emojiFontSizeHeights = [
  20.3, 16.3, 13.5, 11.7, 10.3, 9.1, 8.2, 7.5, 6.8, 6.3, 5.9, 5.5, 5.1, 4.8,
  4.6, 4.3, 4.1, 3.9, 3.7,
];

const glyphFontSizeWidths = [
  26.3, 25.5, 21.3, 18.2, 15.9, 14.2, 12.7, 11.6, 10.6, 9.8, 9.1, 8.5, 7.9, 7.5,
  7.1, 6.7, 6.3, 6.0, 5.8,
];
const glyphFontSizeHeights = [
  23.9, 19.5, 16.4, 14.2, 12.5, 11.2, 10.1, 9.2, 8.5, 7.8, 7.3, 6.8, 6.4, 6.0,
  5.7, 5.4, 5.1, 4.9, 4.7,
];
