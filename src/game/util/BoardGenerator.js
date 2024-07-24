import Rand from "rand-seed";
import { GameTypes } from "./GameTypes";

export const layoutCodeVersionNumber = 1,
  layoutCodeRadix = 32,
  layoutCodeRadixBits = 5; // log_2(layoutCodeRadix)

// Generate a random game board by taking a layout of unknown tiles
// and for each valid tile-match, in a random order, remove pairs from the
// layout in a random formation.
//
// This will generate a rectangular layout with the width and height parameters.
//
// This method is slower, but generates winnable boards.
export function generateRectangularBoardWithSimpleShuffle(
  seed,
  width,
  height,
  allowSinglePairs
) {
  const layoutCode = generateLayoutCodeForRectangle(width, height);

  if (layoutCode !== null)
    return generateBoardWithSimpleShuffle(seed, layoutCode, allowSinglePairs);
  else return null;
}

// Generate a random game board by placing pairs/quadruplets of each random tile
// on the board in the correct layout and then shuffling all tiles on the board
// using a simple Fisher-Yates shuffle.
//
// It uses an encoded layoutCode consisting of:
// matching version number (3 digits, base10)
// width (1 digit)
// height (1 digit)
// binary mask for if a tile exists in each area of the grid
//  (min # of digits per line * num of lines)
//
// Note: It'll generate a width+2 x height+2 board, with the edge row and
// column being blank.
//
// This method is quicker and more random, but can generate an unwinnable board.
export function generateBoardWithSimpleShuffle(
  seed,
  layoutCode,
  allowSinglePairs
) {
  const tiles = [],
    allValidTiles = [];

  let id = 0,
    char = -1,
    chardupe = -1,
    randValue = 0;

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  const layout = decodeLayoutCode(layoutCode);

  if (layout === null) {
    console.error("Invalid layout code.");
    return null;
  }

  let numTiles = Array.from(layout.layoutMask).reduce(
    (acc, val) => acc + (val === "1" ? 1 : 0),
    0
  );

  // Generate which tiles are used. This is done by listing all
  // possible tiles (without duplicates), then shuffling it.
  let usedTiles = [...Array(34).keys()];

  // Shuffle.
  for (let i = usedTiles.length - 1; i > 0; i--) {
    randValue = Math.floor(seededRng.next() * (i + 1));

    char = usedTiles[i];
    usedTiles[i] = usedTiles[randValue];
    usedTiles[randValue] = char;
  }

  // Generate the initial unshuffled layout of tiles.
  let tileNum = 0;

  // Blank out the top outer edge.
  for (let x = 0; x < layout.width + 2; x++)
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

  for (let y = 0; y < layout.height; y++) {
    // Blank out the left outer edge.
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

    for (let x = 0; x < layout.width; x++) {
      if (layout.layoutMask[tileNum] === "1") {
        if ((chardupe = (chardupe + 1) % (allowSinglePairs ? 2 : 4)) === 0) {
          char = (char + 1) % usedTiles.length;
        }

        allValidTiles.push(id);
        id = tiles.push({
          id: id,
          char: usedTiles[char],
          inRemovalAnim: false,
        });
      } else {
        id = tiles.push({ id: id, char: null, inRemovalAnim: false });
      }
      tileNum++;
    }

    // Blank out the right outer edge.
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });
  }

  // Blank out the bottom outer edge.
  for (let x = 0; x < layout.width + 2; x++)
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

  // If there is an extra tile, remove it.
  if (chardupe % 2 === 0) {
    tiles[allValidTiles.pop()].char = null;
    numTiles--;
  }

  // Shuffle the board.
  for (let i = allValidTiles.length - 1; i > 0; i--) {
    randValue = Math.floor(seededRng.next() * (i + 1));

    char = tiles[allValidTiles[i]].char;
    tiles[allValidTiles[i]].char = tiles[allValidTiles[randValue]].char;
    tiles[allValidTiles[randValue]].char = char;
  }

  return {
    tiles: tiles,
    seed: finalSeed,
    width: layout.width,
    height: layout.height,
    numTiles: numTiles,
    layoutCode: layoutCode,
  };
}

// Generate a random game board by taking a layout of unknown tiles
// and for each valid tile-match, in a random order, remove pairs from the
// layout in a random formation.
//
// This will generate a rectangular layout with the width and height parameters.
//
// This method is slower, but generates winnable boards.
export function generateRectangularBoardWithPresolvedShuffle(
  seed,
  width,
  height,
  allowSinglePairs
) {
  const layoutCode = generateLayoutCodeForRectangle(width, height);

  if (layoutCode !== null)
    return generateBoardWithPresolvedShuffle(
      seed,
      layoutCode,
      allowSinglePairs
    );
  else return null;
}

// Generate a random game board by taking a layout of unknown tiles
// and for each valid tile-match, in a random order, remove pairs from the
// layout in a random formation.
//
// It uses an encoded layoutCode consisting of:
// matching version number (3 digits, base10)
// width (1 digit)
// height (1 digit)
// binary mask for if a tile exists in each area of the grid
//  (min # of digits per line * num of lines)
//
// Note: It'll generate a width+2 x height+2 board, with the edge row and
// column being blank.
//
// This method is slower, but generates winnable boards.
export function generateBoardWithPresolvedShuffle(
  seed,
  layoutCode,
  allowSinglePairs
) {
  const tiles = [];

  let id = 0,
    char = -1,
    randValue = 0;

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  const layout = decodeLayoutCode(layoutCode);

  if (layout === null) {
    console.error("Invalid layout code.");
    return null;
  }

  let numTiles = Array.from(layout.layoutMask).reduce(
    (acc, val) => acc + (val === "1" ? 1 : 0),
    0
  );

  const numPairs = numTiles >> 1;

  // Generate the tile matching order for the solving algorithm. This is done
  // by getting a list of valid tile pairs, then adjusting it to fit the
  // layout, then shuffling it.

  // For this, we are only using 34 mahjong tile values (winds, dragons,
  // characters, bamboo, circles). At the moment, flowers and seasons are not
  // used.
  let allTileValues = [...Array(34).keys()];

  // Each value in this array is a representation of a tile pair, based on its
  // tile value. If "allowSinglePairs" is false, then there are at least two pairs
  // of a tile on a given board for an easier difficulty on smaller boards.
  let orderedTilePairs;

  // If our board cannot fit pairs/quads of all tiles, we choose which of the
  // tiles we use at random.
  if (
    numPairs <
    (allowSinglePairs ? allTileValues.length : allTileValues.length << 1)
  ) {
    for (let i = allTileValues.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = allTileValues[i];
      allTileValues[i] = allTileValues[randValue];
      allTileValues[randValue] = char;
    }

    // Trim the number of tiles used.
    //
    // NOTE: If "allowSinglePairs" is false and we have one extra pair unaccounted
    // for, we'll keep with the name and have the extra pair be from one of
    // the chosen tiles (which means there will be 6 instead of 4). If we'd
    // rather have it be a single pair of an unused tile, replace the following:
    // numPairs >> 1           -->       (numPairs + 1) >> 1
    allTileValues = allTileValues.slice(
      0,
      allowSinglePairs ? numPairs : numPairs >> 1
    );
  }

  // Pre-fill part of the tile pair array, all the way up to one pair/quad of
  // each tile value.
  orderedTilePairs = allowSinglePairs
    ? allTileValues.slice()
    : allTileValues.concat(allTileValues);

  orderedTilePairs.sort((a, b) => a - b);

  // If the board is too big for the amount of pairs, we add more pairs in a
  // random order.
  while (orderedTilePairs.length < numPairs) {
    let shuffledTilePairs = allTileValues.slice();

    for (let i = shuffledTilePairs.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = shuffledTilePairs[i];
      shuffledTilePairs[i] = shuffledTilePairs[randValue];
      shuffledTilePairs[randValue] = char;
    }

    orderedTilePairs = orderedTilePairs.concat(shuffledTilePairs);
  }

  // Crop the number of pairs to fit the target total amount.
  orderedTilePairs = orderedTilePairs.slice(0, numPairs);

  // Shuffle.
  for (let i = orderedTilePairs.length - 1; i > 0; i--) {
    randValue = Math.floor(seededRng.next() * (i + 1));

    char = orderedTilePairs[i];
    orderedTilePairs[i] = orderedTilePairs[randValue];
    orderedTilePairs[randValue] = char;
  }

  // Generate the initial unshuffled layout of tiles.

  let tileNum = 0;

  // Blank out the top outer edge.
  for (let x = 0; x < layout.width + 2; x++)
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

  for (let y = 0; y < layout.height; y++) {
    // Blank out the left outer edge.
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

    for (let x = 0; x < layout.width; x++) {
      if (layout.layoutMask[tileNum] === "1") {
        id = tiles.push({ id: id, char: -1, inRemovalAnim: false });
      } else {
        id = tiles.push({ id: id, char: null, inRemovalAnim: false });
      }

      tileNum++;
    }

    // Blank out the right outer edge.
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });
  }

  // Blank out the bottom outer edge.
  for (let x = 0; x < layout.width + 2; x++)
    id = tiles.push({ id: id, char: null, inRemovalAnim: false });

  let edgeTiles = [];

  // Get all tiles with an empty edge.
  for (let i = layout.width + 2; i < tiles.length - (layout.width + 2); i++) {
    if (
      tiles[i].char === -1 &&
      (tiles[i - 1].char !== -1 ||
        tiles[i + 1].char !== -1 ||
        tiles[i - (layout.width + 2)].char !== -1 ||
        tiles[i + (layout.width + 2)].char !== -1)
    )
      edgeTiles.push(i);
  }

  for (let i = 0; i < numPairs; i++) {
    // Get a random unvisited edge tile.
    let tileValue = edgeTiles[Math.floor(seededRng.next() * edgeTiles.length)];

    // Add unvisited surrounding tiles to the open edge list.
    if (
      tiles[tileValue - 1].char === -1 &&
      !edgeTiles.includes(tileValue - 1)
    ) {
      edgeTiles.push(tileValue - 1);
    }
    if (
      tiles[tileValue + 1].char === -1 &&
      !edgeTiles.includes(tileValue + 1)
    ) {
      edgeTiles.push(tileValue + 1);
    }
    if (
      tiles[tileValue - (layout.width + 2)].char === -1 &&
      !edgeTiles.includes(tileValue - (layout.width + 2))
    ) {
      edgeTiles.push(tileValue - (layout.width + 2));
    }
    if (
      tiles[tileValue + (layout.width + 2)].char === -1 &&
      !edgeTiles.includes(tileValue + (layout.width + 2))
    ) {
      edgeTiles.push(tileValue + (layout.width + 2));
    }

    // Don't match the tile with itself.
    edgeTiles = edgeTiles.filter((x) => x !== tileValue);

    let possibleMatches = getMatchingEdgeTilesInPresolvedShuffle(
      tileValue,
      tiles,
      layout.width,
      layout.height,
      edgeTiles
    );

    if (possibleMatches === undefined || possibleMatches.length === 0) {
      console.warn(
        "Presolve-shuffle detected an unmatching tile! This is bad."
      );
      continue;
    }

    // Prefer matches that use more than one line.
    let possibleMatchesMultiLine = possibleMatches.filter((x) => x.lines > 1);

    let matchingTile =
      possibleMatchesMultiLine.length > 0
        ? possibleMatchesMultiLine[
            Math.floor(seededRng.next() * possibleMatchesMultiLine.length)
          ].tile
        : possibleMatches[Math.floor(seededRng.next() * possibleMatches.length)]
            .tile;

    // We found our pair!
    tiles[tileValue].char = orderedTilePairs[i];
    tiles[matchingTile].char = orderedTilePairs[i];

    // Add unvisited surrounding tiles of the matched tile to the open edge list.
    if (
      tiles[matchingTile - 1].char === -1 &&
      !edgeTiles.includes(matchingTile - 1)
    ) {
      edgeTiles.push(matchingTile - 1);
    }
    if (
      tiles[matchingTile + 1].char === -1 &&
      !edgeTiles.includes(matchingTile + 1)
    ) {
      edgeTiles.push(matchingTile + 1);
    }
    if (
      tiles[matchingTile - (layout.width + 2)].char === -1 &&
      !edgeTiles.includes(matchingTile - (layout.width + 2))
    ) {
      edgeTiles.push(matchingTile - (layout.width + 2));
    }
    if (
      tiles[matchingTile + (layout.width + 2)].char === -1 &&
      !edgeTiles.includes(matchingTile + (layout.width + 2))
    ) {
      edgeTiles.push(matchingTile + (layout.width + 2));
    }

    // Don't match future tile with the matched tile.
    edgeTiles = edgeTiles.filter((x) => x !== matchingTile);
  }

  // Remove unused or unreachable tiles.
  tiles.forEach((tile) => {
    if (tile.char === -1) {
      tile.char = null;
      numTiles--;
    }
  });

  return {
    tiles: tiles,
    seed: finalSeed,
    width: layout.width,
    height: layout.height,
    numTiles: numTiles,
    layoutCode: layoutCode,
  };
}

function getMatchingEdgeTilesInPresolvedShuffle(
  tile,
  board,
  boardWidth,
  boardHeight,
  edgeTiles
) {
  const boardWidthWithEdges = boardWidth + 2,
    boardHeightWithEdges = boardHeight + 2;

  let validMatchingTiles = [];

  let uncheckedMatchingTiles = edgeTiles.slice();

  // Get the X and Y ranges to check. This prevents the pathing algorithm
  // from exploring areas it doesn't need to.
  let checkRangeX = [],
    checkRangeY = [];

  uncheckedMatchingTiles.forEach((tile) => {
    checkRangeX.push(tile % boardWidthWithEdges);
    checkRangeY.push(tile - (tile % boardWidthWithEdges));
  });

  if (uncheckedMatchingTiles.length > 1) {
    checkRangeX.sort((a, b) => a - b);
    checkRangeY.sort((a, b) => a - b);
  }

  // Starting paths.
  let paths = [];

  paths.push([{ segment: [tile], dir: "R" }]);
  paths.push([{ segment: [tile], dir: "L" }]);
  paths.push([{ segment: [tile], dir: "U" }]);
  paths.push([{ segment: [tile], dir: "D" }]);

  while (paths.length > 0) {
    const path = paths.pop();

    const curSegment = path.at(-1);
    const lastTile = curSegment.segment.at(-1);
    let nextTile;

    switch (curSegment.dir) {
      case "R":
        nextTile = board[lastTile + 1];

        // Did we find a path?
        if (uncheckedMatchingTiles.includes(nextTile.id)) {
          validMatchingTiles.push({ tile: nextTile.id, lines: path.length });

          uncheckedMatchingTiles.splice(
            uncheckedMatchingTiles.indexOf(nextTile.id),
            1
          );

          if (uncheckedMatchingTiles.length === 0) break;

          // Generate new ranges to check
          uncheckedMatchingTiles.forEach((tile) => {
            checkRangeX.push(tile % boardWidthWithEdges);
            checkRangeY.push(tile - (tile % boardWidthWithEdges));
          });

          if (uncheckedMatchingTiles.length > 1) {
            checkRangeX.sort((a, b) => a - b);
            checkRangeY.sort((a, b) => a - b);
          }

          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char === -1) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // Branch out to different segments if necessary.
        // On second segment, only check if on same column.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            !checkRangeX.includes(nextTile.id % boardWidthWithEdges)
          )
        ) {
          if (
            checkRangeY[0] <
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "U" });
            paths.push(newPath);
          }

          if (
            checkRangeY.at(-1) >
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "D" });
            paths.push(newPath);
          }
        }

        // Path is going too far away from the range or is nearing the edge
        // of the board.
        if (
          (path.length === 2 &&
            checkRangeX.at(-1) < nextTile.id % boardWidthWithEdges) ||
          nextTile.id % boardWidthWithEdges === boardWidthWithEdges - 1
        ) {
          continue;
        }

        paths.push(path);
        continue;
      case "L":
        nextTile = board[lastTile - 1];

        // Did we find a path?
        if (uncheckedMatchingTiles.includes(nextTile.id)) {
          validMatchingTiles.push({ tile: nextTile.id, lines: path.length });

          uncheckedMatchingTiles.splice(
            uncheckedMatchingTiles.indexOf(nextTile.id),
            1
          );

          if (uncheckedMatchingTiles.length === 0) break;

          // Generate new ranges to check
          uncheckedMatchingTiles.forEach((tile) => {
            checkRangeX.push(tile % boardWidthWithEdges);
            checkRangeY.push(tile - (tile % boardWidthWithEdges));
          });

          if (uncheckedMatchingTiles.length > 1) {
            checkRangeX.sort((a, b) => a - b);
            checkRangeY.sort((a, b) => a - b);
          }

          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char === -1) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // Branch out to different segments if necessary.
        // On second segment, only check if on same column.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            !checkRangeX.includes(nextTile.id % boardWidthWithEdges)
          )
        ) {
          if (
            checkRangeY[0] <
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "U" });
            paths.push(newPath);
          }

          if (
            checkRangeY.at(-1) >
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "D" });
            paths.push(newPath);
          }
        }

        // Path is going too far away from the range or is nearing the edge
        // of the board.
        if (
          (path.length === 2 &&
            checkRangeX[0] > nextTile.id % boardWidthWithEdges) ||
          nextTile.id % boardWidthWithEdges === 0
        ) {
          continue;
        }

        paths.push(path);
        continue;
      case "D":
        nextTile = board[lastTile + boardWidthWithEdges];

        // Did we find a path?
        if (uncheckedMatchingTiles.includes(nextTile.id)) {
          validMatchingTiles.push({ tile: nextTile.id, lines: path.length });

          uncheckedMatchingTiles.splice(
            uncheckedMatchingTiles.indexOf(nextTile.id),
            1
          );

          if (uncheckedMatchingTiles.length === 0) break;

          // Generate new ranges to check
          uncheckedMatchingTiles.forEach((tile) => {
            checkRangeX.push(tile % boardWidthWithEdges);
            checkRangeY.push(tile - (tile % boardWidthWithEdges));
          });

          if (uncheckedMatchingTiles.length > 1) {
            checkRangeX.sort((a, b) => a - b);
            checkRangeY.sort((a, b) => a - b);
          }

          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char === -1) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // Branch out to different segments if necessary.
        // On second segment, only check if on same row.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            !checkRangeY.includes(
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            )
          )
        ) {
          if (checkRangeX[0] < nextTile.id % boardWidthWithEdges) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "L" });
            paths.push(newPath);
          }

          if (checkRangeX.at(-1) > nextTile.id % boardWidthWithEdges) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "R" });
            paths.push(newPath);
          }
        }

        // Path is going too far away from the range or is nearing the edge
        // of the board.
        if (
          (path.length === 2 &&
            checkRangeY.at(-1) <
              nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
          nextTile.id >= boardWidthWithEdges * (boardHeightWithEdges - 1)
        ) {
          continue;
        }

        paths.push(path);
        continue;
      case "U":
        nextTile = board[lastTile - boardWidthWithEdges];

        // Did we find a path?
        if (uncheckedMatchingTiles.includes(nextTile.id)) {
          validMatchingTiles.push({ tile: nextTile.id, lines: path.length });

          uncheckedMatchingTiles.splice(
            uncheckedMatchingTiles.indexOf(nextTile.id),
            1
          );

          if (uncheckedMatchingTiles.length === 0) break;

          // Generate new ranges to check
          uncheckedMatchingTiles.forEach((tile) => {
            checkRangeX.push(tile % boardWidthWithEdges);
            checkRangeY.push(tile - (tile % boardWidthWithEdges));
          });

          if (uncheckedMatchingTiles.length > 1) {
            checkRangeX.sort((a, b) => a - b);
            checkRangeY.sort((a, b) => a - b);
          }

          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char === -1) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // Branch out to different segments if necessary.
        // On second segment, only check if on same row.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            !checkRangeY.includes(
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            )
          )
        ) {
          if (checkRangeX[0] < nextTile.id % boardWidthWithEdges) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "L" });
            paths.push(newPath);
          }

          if (checkRangeX.at(-1) > nextTile.id % boardWidthWithEdges) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: "R" });
            paths.push(newPath);
          }
        }

        // Path is going too far away from the range or is nearing the edge
        // of the board.
        if (
          (path.length === 2 &&
            checkRangeY[0] >
              nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
          nextTile.id < boardWidthWithEdges
        ) {
          continue;
        }

        paths.push(path);
        continue;
      default:
        break;
    }
  }

  return validMatchingTiles;
}

// Generate a layout code for a simple rectangle of a specified size.
function generateLayoutCodeForRectangle(width, height) {
  if (isNaN(parseInt(width)) || isNaN(parseInt(height))) {
    return null;
  }

  let layoutCode = GameTypes.TWOCORNER.toString(16).padStart(2, "0");
  layoutCode += layoutCodeVersionNumber.toString(16).padStart(2, "0");
  layoutCode += parseInt(width).toString(layoutCodeRadix).slice(0, 1);
  layoutCode += parseInt(height).toString(layoutCodeRadix).slice(0, 1);

  const digitsPerLine = Math.ceil((width + 1) / layoutCodeRadixBits);

  const lineMask = "1"
    .repeat(width + 1)
    .padEnd(digitsPerLine * layoutCodeRadixBits, "0");

  // If we have an odd amount of tiles in general, both width and height are
  // odd. To keep things even, we make the centermost tile empty.
  const removeCenterTile = width % 2 !== 0 && height % 2 !== 0;

  for (let i = 0; i < height; i++) {
    if (removeCenterTile && i === height >> 1) {
      layoutCode += parseInt(
        lineMask.slice(0, (width >> 1) + 1) +
          "0" +
          lineMask.slice((width >> 1) + 2),
        2
      ).toString(layoutCodeRadix);
    } else {
      layoutCode += parseInt(lineMask, 2).toString(layoutCodeRadix);
    }
  }

  console.log("Generated rectangle board layout: " + layoutCode);

  return layoutCode;
}

// Decode and validate the layout code.
export function decodeLayoutCode(layoutCode) {
  if (
    layoutCode === null ||
    layoutCode.length < 6 ||
    parseInt(layoutCode.slice(0, 2), 16) !== GameTypes.TWOCORNER
  ) {
    return null;
  }

  const layoutCodeVer = parseInt(layoutCode.slice(2, 4), 16);

  // Backwards-compatibility?
  if (layoutCodeVer !== layoutCodeVersionNumber) {
    return null;
  }

  const width = parseInt(layoutCode.slice(4, 5), layoutCodeRadix),
    height = parseInt(layoutCode.slice(5, 6), layoutCodeRadix);

  const digitsPerLine = Math.ceil((width + 1) / layoutCodeRadixBits);

  if (layoutCode.length !== 6 + digitsPerLine * height) {
    return null;
  }

  let layoutMask = "";

  for (let i = 0; i < height; i++) {
    const nextWidth = parseInt(
      layoutCode.slice(6 + i * digitsPerLine, 6 + (i + 1) * digitsPerLine),
      layoutCodeRadix
    );

    if (isNaN(nextWidth)) {
      return null;
    }

    layoutMask += nextWidth.toString(2).slice(1, width + 1);
  }

  return {
    width: width,
    height: height,
    layoutMask: layoutMask,
  };
}
