import Rand from "rand-seed";

import { MAX_BOARD_WIDTH, MAX_BOARD_HEIGHT } from "./BoardLayoutGenerator";

import { TileDistributionOptions } from "../shared/TileDistributionOptions";

// Generate a random game board by placing pairs/quadruplets of each random tile
// on the board in the correct layout and then shuffling all tiles on the board
// using a simple shuffle.
//
// Note: It'll generate a width+2 x height+2 board, with the edge row and
// column being blank.
//
// This method is quicker and more random, but can generate an unwinnable board.
export function generateBoardWithSimpleShuffle({
  layoutMask,
  width,
  height,
  seed,
  tileDistribution = TileDistributionOptions.PRIORITIZE_BOTH_PAIRS,
}) {
  if (
    layoutMask == null ||
    isNaN(width) ||
    isNaN(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_BOARD_WIDTH ||
    height > MAX_BOARD_HEIGHT
  ) {
    throw new Error("Invalid layoutMask, width, or height.");
  }

  if (!Object.values(TileDistributionOptions).includes(tileDistribution))
    throw new Error("Invalid tile distribution option.");

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  let numTiles = Array.from(layoutMask).reduce(
    (acc, val) => acc + (val === "1" ? 1 : 0),
    0
  );

  // Generate the tile distribution. This is done by listing all possible tile
  // designs, then randomly choosing which ones are used.
  //
  // The values correspond with the character codes in the Mahjong Tiles
  // unicode block.
  let tileChars = [...Array(0x21 + 1).keys()];

  // Shuffle the the tile selection. This does not matter for boards that use
  // the exact amount of tiles, but it gives all tile designs the chance of
  // appearing evenly in both smaller and larger boards.
  //
  // For larger boards, we don't need to shuffle each full set (as all tiles
  // will appear), only the final set.
  //
  // If we're using RANDOM, we don't need to shuffle this set, as it
  // grabs from the set at random.
  if (tileDistribution != TileDistributionOptions.RANDOM) {
    // For RANDOM_PER_SET, we'll distribute the set per pair, rather than per
    // tile design. As the set uses two pairs per tile design, we'll simply
    // double the selection.
    if (tileDistribution == TileDistributionOptions.RANDOM_PER_SET) {
      tileChars = tileChars.concat(tileChars);
    }

    // Shuffle.
    for (let i = tileChars.length - 1; i > 0; i--) {
      const randValue = Math.floor(seededRng.next() * (i + 1));

      const char = tileChars[i];
      tileChars[i] = tileChars[randValue];
      tileChars[randValue] = char;
    }
  }

  const tiles = [],
    allValidTiles = [];

  let charIndex =
      tileDistribution == TileDistributionOptions.RANDOM
        ? Math.floor(seededRng.next() * tileChars.length)
        : -1,
    chardupe = -1;

  // On PRIORITIZE_BOTH_PAIRS, change to distributing each pair once a full set
  // is used.
  let fullSetUsed = false;

  // Generate the initial unshuffled layout of tiles.
  let tileNum = 0,
    id = 0;

  // Blank out the top outer edge.
  for (let x = 0; x < width + 2; x++) id = tiles.push({ id: id, char: null });

  for (let y = 0; y < height; y++) {
    // Blank out the left outer edge.
    id = tiles.push({ id: id, char: null });

    for (let x = 0; x < width; x++) {
      if (layoutMask[tileNum] === "1") {
        if (tileDistribution == TileDistributionOptions.RANDOM) {
          // Random tile selection.
          if ((chardupe = (chardupe + 1) % 2) === 0) {
            charIndex = Math.floor(seededRng.next() * tileChars.length);
          }
        } else {
          // Determines when to move on to the next tile selection, either after
          // a single pair for a half-set (on PRIORITIZE_SINGLE_PAIRS or
          // PRIORITIZE_BOTH_PAIRS after a full set), a single pair for a full set
          // (on RANDOM_PER_SET), or a double pair for a full set
          // (on ALWAYS_BOTH_PAIRS or PRIORITIZE_BOTH_PAIRS before a full set).
          if (
            (chardupe =
              (chardupe + 1) %
              (tileDistribution ==
                TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS ||
              (tileDistribution ==
                TileDistributionOptions.PRIORITIZE_BOTH_PAIRS &&
                fullSetUsed) ||
              tileDistribution == TileDistributionOptions.RANDOM_PER_SET
                ? 2
                : 4)) === 0
          ) {
            if (++charIndex === tileChars.length) {
              charIndex = 0;
              fullSetUsed = true;
            }
          }
        }

        allValidTiles.push(id);
        id = tiles.push({
          id: id,
          char: tileChars[charIndex],
        });
      } else {
        id = tiles.push({ id: id, char: null });
      }
      tileNum++;
    }

    // Blank out the right outer edge.
    id = tiles.push({ id: id, char: null });
  }

  // Blank out the bottom outer edge.
  for (let x = 0; x < width + 2; x++) id = tiles.push({ id: id, char: null });

  // If there is an extra tile, remove it.
  if (
    tileDistribution == TileDistributionOptions.ALWAYS_BOTH_PAIRS &&
    chardupe < 3
  ) {
    for (let i = 0; i < chardupe + 1; i++) {
      tiles[allValidTiles.pop()].char = null;
      numTiles--;
    }
  } else if (chardupe % 2 === 0) {
    tiles[allValidTiles.pop()].char = null;
    numTiles--;
  }

  // Shuffle the board.
  for (let i = allValidTiles.length - 1; i > 0; i--) {
    const randValue = Math.floor(seededRng.next() * (i + 1));

    char = tiles[allValidTiles[i]].char;
    tiles[allValidTiles[i]].char = tiles[allValidTiles[randValue]].char;
    tiles[allValidTiles[randValue]].char = char;
  }

  return {
    tiles: tiles,
    seed: finalSeed,
    width: width,
    height: height,
    numTiles: numTiles,
  };
}

// Generate a random game board by taking a layout of unknown tiles
// and for each valid tile-match, in a random order, remove pairs from the
// layout in a random formation.
//
// Note: It'll generate a width+2 x height+2 board, with the edge row and
// column being blank.
//
// This method is slower, but generates winnable boards.
export function generateBoardWithPresolvedShuffle({
  layoutMask,
  width,
  height,
  seed,
  tileDistribution = TileDistributionOptions.PRIORITIZE_BOTH_PAIRS,
}) {
  if (
    layoutMask == null ||
    isNaN(width) ||
    isNaN(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_BOARD_WIDTH ||
    height > MAX_BOARD_HEIGHT
  ) {
    throw new Error("Invalid layoutMask, width, or height.");
  }

  if (!Object.values(TileDistributionOptions).includes(tileDistribution))
    throw new Error("Invalid tile distribution option.");

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  let numTiles = Array.from(layoutMask).reduce(
    (acc, val) => acc + (val === "1" ? 1 : 0),
    0
  );

  if (numTiles < 2) {
    throw new Error("Cannot start with less than 2 tiles on the board.");
  }

  let numPairs = numTiles >> 1;

  // Generate the tile distribution. This is done by listing all possible tile
  // designs, then randomly choosing which ones are used. Unlike the simple
  // shuffle algorithm, this algorithm takes into account the distribution
  // order.
  //
  // The values correspond with the character codes in the Mahjong Tiles
  // unicode block.
  const tileCharSet = [...Array(0x21 + 1).keys()];
  let orderedTilePairChars = [];

  // Shuffle the the tile selection. This does not matter for boards that use
  // the exact amount of tiles, but it gives all tile designs the chance of
  // appearing evenly in both smaller and larger boards.
  //
  // For larger boards, we don't need to shuffle each full set (as all tiles
  // will appear), only the final set.
  //
  // If we're using RANDOM, we don't need to shuffle this set, as it
  // grabs from the set at random.
  if (tileDistribution !== TileDistributionOptions.RANDOM) {
    // Include both pairs of all full tile sets.
    for (let i = 0; i < Math.floor(numPairs / (tileCharSet.length << 1)); i++) {
      orderedTilePairChars = [
        ...orderedTilePairChars,
        ...tileCharSet,
        ...tileCharSet,
      ];
    }

    // Get a random selection of the remaining tile set.
    if (numPairs % (tileCharSet.length << 1) > 0) {
      let shuffledTilePairChars = tileCharSet.slice();

      if (
        tileDistribution === TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS ||
        tileDistribution === TileDistributionOptions.PRIORITIZE_BOTH_PAIRS ||
        tileDistribution === TileDistributionOptions.ALWAYS_BOTH_PAIRS
      ) {
        // Shuffle tiles used used for this tile set.
        for (let i = shuffledTilePairChars.length - 1; i > 0; i--) {
          const randValue = Math.floor(seededRng.next() * (i + 1));

          const char = shuffledTilePairChars[i];
          shuffledTilePairChars[i] = shuffledTilePairChars[randValue];
          shuffledTilePairChars[randValue] = char;
        }

        if (
          tileDistribution ===
            TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS ||
          (tileDistribution === TileDistributionOptions.PRIORITIZE_BOTH_PAIRS &&
            Math.floor(numPairs / (tileCharSet.length << 1)) > 0)
        ) {
          // Split into available pairs.

          shuffledTilePairChars = shuffledTilePairChars.concat(
            shuffledTilePairChars
          );
        } else {
          // Split into available quads, make into pairs.

          if (tileDistribution === TileDistributionOptions.ALWAYS_BOTH_PAIRS) {
            // If we're only going to be using quads, we need to remove single
            // pairs.
            numPairs = (numPairs >> 1) << 1;
          }

          shuffledTilePairChars = shuffledTilePairChars.slice(
            0,
            ((numPairs + 1) >> 1) % tileCharSet.length
          );

          shuffledTilePairChars = shuffledTilePairChars.concat(
            shuffledTilePairChars
          );
        }
      } else if (tileDistribution === TileDistributionOptions.RANDOM_PER_SET) {
        // Split into pairs.
        shuffledTilePairChars = shuffledTilePairChars.concat(
          shuffledTilePairChars
        );

        // Shuffle.
        for (let i = shuffledTilePairChars.length - 1; i > 0; i--) {
          const randValue = Math.floor(seededRng.next() * (i + 1));

          const char = shuffledTilePairChars[i];
          shuffledTilePairChars[i] = shuffledTilePairChars[randValue];
          shuffledTilePairChars[randValue] = char;
        }
      }

      // Add the remaining tiles and trim.
      orderedTilePairChars = orderedTilePairChars
        .concat(shuffledTilePairChars)
        .slice(0, numPairs);
    }

    // Shuffle the overall tile distribution.
    for (let i = orderedTilePairChars.length - 1; i > 0; i--) {
      const randValue = Math.floor(seededRng.next() * (i + 1));

      const char = orderedTilePairChars[i];
      orderedTilePairChars[i] = orderedTilePairChars[randValue];
      orderedTilePairChars[randValue] = char;
    }
  }

  // Generate the initial unshuffled layout of tiles.
  const tiles = [];
  let tileNum = 0,
    id = 0;

  // Blank out the top outer edge.
  for (let x = 0; x < width + 2; x++) id = tiles.push({ id: id, char: null });

  for (let y = 0; y < height; y++) {
    // Blank out the left outer edge.
    id = tiles.push({ id: id, char: null });

    for (let x = 0; x < width; x++) {
      if (layoutMask[tileNum] === "1") {
        id = tiles.push({ id: id, char: -1 });
      } else {
        id = tiles.push({ id: id, char: null });
      }

      tileNum++;
    }

    // Blank out the right outer edge.
    id = tiles.push({ id: id, char: null });
  }

  // Blank out the bottom outer edge.
  for (let x = 0; x < width + 2; x++) id = tiles.push({ id: id, char: null });

  let edgeTiles = [];

  // Get all tiles with an empty edge.
  for (let i = width + 2; i < tiles.length - (width + 2); i++) {
    if (
      tiles[i].char === -1 &&
      (tiles[i - 1].char !== -1 ||
        tiles[i + 1].char !== -1 ||
        tiles[i - (width + 2)].char !== -1 ||
        tiles[i + (width + 2)].char !== -1)
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
      tiles[tileValue - (width + 2)].char === -1 &&
      !edgeTiles.includes(tileValue - (width + 2))
    ) {
      edgeTiles.push(tileValue - (width + 2));
    }
    if (
      tiles[tileValue + (width + 2)].char === -1 &&
      !edgeTiles.includes(tileValue + (width + 2))
    ) {
      edgeTiles.push(tileValue + (width + 2));
    }

    // Don't match the tile with itself.
    edgeTiles = edgeTiles.filter((x) => x !== tileValue);

    let possibleMatches = getMatchingEdgeTilesInPresolvedShuffle(
      tileValue,
      tiles,
      width,
      height,
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

    // Assign the next tile character to our matching pair.
    if (tileDistribution === TileDistributionOptions.RANDOM) {
      tiles[tileValue].char = tiles[matchingTile].char =
        tileCharSet[Math.floor(seededRng.next() * tileCharSet.length)];
    } else {
      tiles[tileValue].char = tiles[matchingTile].char =
        orderedTilePairChars[i];
    }

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
      tiles[matchingTile - (width + 2)].char === -1 &&
      !edgeTiles.includes(matchingTile - (width + 2))
    ) {
      edgeTiles.push(matchingTile - (width + 2));
    }
    if (
      tiles[matchingTile + (width + 2)].char === -1 &&
      !edgeTiles.includes(matchingTile + (width + 2))
    ) {
      edgeTiles.push(matchingTile + (width + 2));
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
    width,
    height,
    numTiles: numTiles,
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
