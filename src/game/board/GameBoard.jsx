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
  // Tile maps, which are used to correlate each tile object with their
  // proper placement on the board. Standard tile maps are used for the
  // landscape orientation while rotated tile maps are "rotated" for better
  // use in portrait orientation (such as smartphones). These are stored as
  // arrays of rows of tiles.
  const [horizontalTileMap, setHorizontalTileMap] = useState([]);
  const [verticalTileMap, setVerticalTileMap] = useState([]);

  // Regenerate tile maps every time the tile layout changes.
  useEffect(() => {
    const horizontalTileMap = [],
      verticalTileMap = [];

    // Generate standard tile map, used for the landscape orientation.
    for (let y = 0; y < boardHeight + 2; y++) {
      horizontalTileMap[y] = tiles.slice(
        y * (boardWidth + 2),
        (y + 1) * (boardWidth + 2)
      );
    }

    setHorizontalTileMap(horizontalTileMap);

    // Generate rotated tile map, used for the portrait orientation.
    for (let x = 0; x < boardWidth + 2; x++) {
      verticalTileMap[x] = tiles
        .filter((_el, index) => index % (boardWidth + 2) === x)
        .reverse();
    }

    setVerticalTileMap(verticalTileMap);
  }, [tiles]);

  // Change the key for the pathing elements so that on a new path, any
  // current element that's in an animation is not reused, causing an issue
  // with CSS animation.
  const [curPathingKey, setCurPathingKey] = useState(1);

  useEffect(() => setCurPathingKey(~curPathingKey), [pathingTiles]);

  const renderTileMap = (tileMap, keyprefix) => {
    // For each row in the tile map, create a div with each of the tile
    // entries as a span, which contains both the corresponding Tile component
    // and pathing node.
    return tileMap.map((row, index) => (
      <div key={keyprefix + "-" + index}>
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
    setVerticalTileStyle({
      fontSize:
        (useEmoji
          ? emojiFontSizePortraitWidths[
              Math.min(Math.max(boardHeight, 2), 12) - 2
            ]
          : glyphFontSizePortraitWidths[
              Math.min(Math.max(boardHeight, 2), 12) - 2
            ]) + "vw",
      marginTop: "0.75em",
    });
  }, [tiles, useEmoji]);

  return (
    <div>
      <div
        className={`game-board game-board-horizontal ${
          useEmoji ? "game-board-emoji" : "game-board-glyph"
        }`}
        style={horizontalTileStyle}
      >
        {renderTileMap(horizontalTileMap, "board-hori")}
      </div>
      <div
        className={`game-board game-board-vertical ${
          useEmoji ? "game-board-emoji" : "game-board-glyph"
        }`}
        style={verticalTileStyle}
      >
        {renderTileMap(verticalTileMap, "board-vert")}
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

const emojiFontSizePortraitWidths = [
  10, 10, 10, 10, 10, 10, 10, 9.5, 8.7, 8.1, 7.5,
];

const glyphFontSizePortraitWidths = [
  12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 11.4, 10.4, 9.6, 8.9,
];
