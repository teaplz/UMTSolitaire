import { useState, useEffect } from "react";
import React from "react";
import ClassNames from "classnames";

import Tile from "./Tile";
import PathNode from "./PathNode";

import "./GameBoard.css";

const GameBoard = ({
  boardWidth,
  boardHeight,
  tiles,
  pathingTiles,
  padBoard,
  tilesInRemovalAnimation,
  hintedTiles,
  wholeMatchingTiles,
  selectedTile,
  useEmoji,
  fixRedDragonBug,
  lowDetailMode,
  handleTileClick,
}) => {
  // These are stored as arrays of rows of tiles.
  const [tileMap, setTileMap] = useState([]);

  // Determines if the board has half-steps in either the X or Y coordinates.
  // This is tracked due to z-indexing, as the default renderer sometimes shows
  // the 3D portion of a shifted tile over/under an adjacent tile.
  const [useHalfSteps, setUseHalfSteps] = useState(false);

  const [tileDisplayOptions, setTileDisplayOptions] = useState({});

  // Regenerate tile maps every time the tile layout changes.
  useEffect(() => {
    const tileMap = [];

    let useHalfSteps = tiles?.some(
      (c) => Array.isArray(c) && c?.some((t) => t?.xhalfstep || t?.yhalfstep)
    );

    for (let y = 0; y < boardHeight; y++) {
      tileMap[y] = tiles
        .slice(y * boardWidth, (y + 1) * boardWidth)
        .map((coord) => {
          if (coord?.length > 0) {
            // For each tile stacked in each coordinate,
            return coord.map((tile) => {
              if (tile != null)
                return {
                  id: tile.id,
                  char: tile.hidden ? 0x2b : tile.char,
                  selectable: tile.selectable,
                  xhalfstep: tile.xhalfstep,
                  yhalfstep: tile.yhalfstep,
                  inRemovalAnim: false,
                };
            });
          } else if (coord != null) {
            // In "flat" game modes, each coordinate in the tiles array consists
            // of a single tile object, rather than a sub-array for each height.
            return Array(1).fill({
              id: coord.id,
              char: coord.char,
              selectable: coord.char != null && coord.char !== 0x2b,
              inRemovalAnim: false,
            });
          } else {
            // Use a single hidden tile as a "buffer" to line up the tiles at
            // the correct location.
            return Array(1).fill({
              id: null,
              char: null,
              selectable: false,
              inRemovalAnim: false,
            });
          }
        });
    }

    setUseHalfSteps(useHalfSteps);

    tilesInRemovalAnimation.forEach((comparisonTile) =>
      tileMap.forEach((row) =>
        row.forEach((coord) =>
          coord.forEach((tile, index) => {
            if (tile?.id === comparisonTile.id) {
              coord[index].char = comparisonTile.char;
              coord[index].inRemovalAnim = true;
            }
          })
        )
      )
    );

    setTileMap(tileMap);
  }, [tiles]);

  // Change the key for the pathing elements so that on a new path, any
  // current element that's in an animation is not reused, causing an issue
  // with CSS animation.
  const [curPathingKey, setCurPathingKey] = useState(1);

  useEffect(() => setCurPathingKey(-curPathingKey), [pathingTiles]);

  const renderTileMap = () => {
    return tileMap.map((row, yindex) => (
      <div key={yindex}>
        {row.map((loc, xindex) => (
          <span className="game-board-coord" key={xindex}>
            {loc?.map(
              (tile, height) =>
                tile && (
                  <Tile
                    char={tile.char}
                    isSelected={tile.id === selectedTile && tile.id != null}
                    canBeMatchedWithSelected={hintedTiles?.includes(tile.id)}
                    canBeMatchedWithOther={wholeMatchingTiles?.includes(
                      tile.id
                    )}
                    isFadingOut={tile.inRemovalAnim}
                    {...tileDisplayOptions}
                    className={ClassNames(
                      "game-tile",
                      tile.inRemovalAnim ? "game-tile-anim-fadeout" : null,
                      tile.selectable ? "game-tile-selectable" : null
                    )}
                    styleTop={
                      height > 0
                        ? height * -0.16 + (tile.yhalfstep ? 0.5 : 0) + "em"
                        : useHalfSteps && tile.yhalfstep
                        ? "0.5em"
                        : null
                    }
                    styleLeft={
                      height > 0
                        ? height * -0.16 + (tile.xhalfstep ? 0.5 : 0) + "em"
                        : useHalfSteps && tile.xhalfstep
                        ? "0.5em"
                        : null
                    }
                    styleZIndex={
                      height > 0
                        ? useHalfSteps
                          ? 2 *
                              (height * (boardWidth + boardHeight) +
                                xindex +
                                yindex) +
                            (tile.yhalfstep ? 1 : 0) +
                            (tile.yhalfstep ? 1 : 0)
                          : height
                        : useHalfSteps
                        ? 2 * (xindex + yindex) +
                          (tile.yhalfstep ? 1 : 0) +
                          (tile.yhalfstep ? 1 : 0)
                        : null
                    }
                    onClick={
                      tile.selectable ? () => handleTileClick(tile.id) : null
                    }
                    key={xindex + "x" + yindex + "_" + height}
                  />
                )
            )}

            {pathingTiles != null &&
              loc != null &&
              loc[0] != null &&
              pathingTiles[loc[0].id]?.length > 0 && (
                <PathNode key={curPathingKey} node={pathingTiles[loc[0].id]} />
              )}
          </span>
        ))}
      </div>
    ));
  };

  useEffect(() => {
    setTileDisplayOptions({
      useEmoji,
      fixRedDragonBug,
    });
  }, [useEmoji, fixRedDragonBug]);

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
          ? emojiFontSizeWidths[
              Math.min(
                Math.max(padBoard ? boardWidth : boardWidth - 2, 2),
                20
              ) - 2
            ]
          : glyphFontSizeWidths[
              Math.min(
                Math.max(padBoard ? boardWidth : boardWidth - 2, 2),
                20
              ) - 2
            ]) +
        "vw, " +
        (useEmoji
          ? emojiFontSizeHeights[
              Math.min(
                Math.max(padBoard ? boardHeight : boardHeight - 2, 2),
                12
              ) - 2
            ]
          : glyphFontSizeHeights[
              Math.min(
                Math.max(padBoard ? boardHeight : boardHeight - 2, 2),
                12
              ) - 2
            ]) +
        "vh)",
    });

    // For portrait orientation, have the font size determined by the height
    // and use a scrollbar. Adjust for both the scrollbar and a potentially
    // larger game bar. Do not make it so large that scrolling is difficult.
    setVerticalTileStyle({
      fontSize:
        (useEmoji
          ? emojiFontSizeHeights[
              Math.min(
                Math.max(padBoard ? boardHeight : boardHeight - 2, 5),
                12
              ) - 2
            ] - 1
          : glyphFontSizeHeights[
              Math.min(
                Math.max(padBoard ? boardHeight : boardHeight - 2, 5),
                12
              ) - 2
            ] - 1) + "vh",
    });
  }, [boardWidth, boardHeight, useEmoji]);

  // The base game board is nested in three divs, one for handling the base
  // settings and generated landscape orientation font-size, one for handling
  // the generated portrait orientation font-size (using CSS trickery to disable
  // itself through "inheriting" the parent div), and one for handling which
  // font style to use (emoji or text glyph).
  return (
    <div
      className={ClassNames(
        "game-board",
        lowDetailMode ? "game-board-low" : null
      )}
      style={horizontalTileStyle}
    >
      <div className="game-board-v" style={verticalTileStyle}>
        <div
          className={ClassNames(
            useEmoji ? "game-board-emoji" : "game-board-glyph",
            padBoard ? "game-board-pad" : null
          )}
        >
          {renderTileMap()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameBoard);

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
