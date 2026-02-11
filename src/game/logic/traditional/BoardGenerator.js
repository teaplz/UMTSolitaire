// Functions related to generating the board itself, namely the procedural
// (or completely random) generation of the board's tile placement.

import Rand from "rand-seed";
import { ALL_FLOWER_TILES, ALL_SEASON_TILES } from "../TraditionalGameType";

import { TileDistributionOptions } from "../shared/TileDistributionOptions";

const FLOWER_TILE = 0x22,
  SEASON_TILE = 0x23;

// Generate a final game board based on the tile layout and optional random
// seed, using a simple randomized shuffle. These boards can be unwinnable,
// which adds to the challenge.
export function generateBoardWithSimpleShuffle({
  layout,
  seed,
  flowersAndSeasons = true,
  tileDistribution = TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS,
}) {
  if (layout == null)
    throw new Error("Attempted to create board with no board layout.");

  if (!Object.values(TileDistributionOptions).includes(tileDistribution))
    throw new Error("Invalid tile distribution option.");

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  // Generate the tile distribution. This is done by listing all possible tile
  // designs, then randomly choosing which ones are used.
  //
  // The values correspond with the character codes in the Mahjong Tiles
  // unicode block.
  let tileChars = [...Array(flowersAndSeasons ? 0x23 + 1 : 0x21 + 1).keys()];

  // Flower tiles (0x22) and Season tiles (0x23) are four unique tile designs
  // each, rather than four of the same tile design.
  let flowerTiles = ALL_FLOWER_TILES.slice(),
    seasonTiles = ALL_SEASON_TILES.slice(),
    nextFlowerTile = 0,
    nextSeasonTile = 0;

  // Shuffle the the tile selection, including the flower and season tiles. This
  // does not matter for boards that use the exact amount of tiles, but it gives
  // all tile designs the chance of appearing evenly in both smaller and larger
  // boards.
  //
  // For larger boards, we don't need to shuffle each full set (as all tiles
  // will appear), only the final set.
  //
  // If we're using RANDOM, we don't need to shuffle this set, as it
  // grabs from the set at random.
  if (tileDistribution !== TileDistributionOptions.RANDOM) {
    // For RANDOM_PER_SET, we'll distribute the set per pair, rather than per
    // tile design. As the set uses two pairs per tile design, we'll simply
    // double the selection.
    if (tileDistribution === TileDistributionOptions.RANDOM_PER_SET) {
      tileChars = tileChars.concat(tileChars);
    }

    for (let i = tileChars.length - 1; i > 0; i--) {
      const randValue = Math.floor(seededRng.next() * (i + 1));

      const char = tileChars[i];
      tileChars[i] = tileChars[randValue];
      tileChars[randValue] = char;
    }

    if (flowersAndSeasons) {
      for (let i = flowerTiles.length - 1; i > 0; i--) {
        const randValue = Math.floor(seededRng.next() * (i + 1));

        const char = flowerTiles[i];
        flowerTiles[i] = flowerTiles[randValue];
        flowerTiles[randValue] = char;
      }

      for (let i = seasonTiles.length - 1; i > 0; i--) {
        const randValue = Math.floor(seededRng.next() * (i + 1));

        const char = seasonTiles[i];
        seasonTiles[i] = seasonTiles[randValue];
        seasonTiles[randValue] = char;
      }
    }
  }

  // The "tiles" array is the final board output, while "tileRefList" keeps a
  // reference to each tile in the board so we don't have to constantly search
  // while shuffling.
  const tiles = JSON.parse(JSON.stringify(layout.tiles)),
    tileRefList = [];

  let charIndex =
      tileDistribution === TileDistributionOptions.RANDOM
        ? Math.floor(seededRng.next() * tileChars.length)
        : -1,
    chardupe = -1;

  // On PRIORITIZE_BOTH_PAIRS, change to distributing each pair once a full set
  // is used.
  let fullSetUsed = false;

  // Generate the initial unshuffled layout of tiles.
  tiles.forEach((coord) =>
    coord?.forEach((tile) => {
      if (tile == null) return;

      if (tileDistribution === TileDistributionOptions.RANDOM) {
        // Random tile selection.
        if ((chardupe = (chardupe + 1) % 2) === 0) {
          charIndex = Math.floor(seededRng.next() * tileChars.length);
        }

        if (flowersAndSeasons) {
          if (tileChars[charIndex] === FLOWER_TILE) {
            tile.char =
              flowerTiles[Math.floor(seededRng.next() * flowerTiles.length)];
          } else if (tileChars[charIndex] === SEASON_TILE) {
            tile.char =
              seasonTiles[Math.floor(seededRng.next() * seasonTiles.length)];
          } else {
            tile.char = tileChars[charIndex];
          }
        } else {
          tile.char = tileChars[charIndex];
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
            (tileDistribution ===
              TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS ||
            (tileDistribution ===
              TileDistributionOptions.PRIORITIZE_BOTH_PAIRS &&
              fullSetUsed) ||
            tileDistribution === TileDistributionOptions.RANDOM_PER_SET
              ? 2
              : 4)) === 0
        ) {
          if (++charIndex === tileChars.length) {
            charIndex = 0;
            fullSetUsed = true;
          }
        }

        if (flowersAndSeasons) {
          if (tileChars[charIndex] === FLOWER_TILE) {
            tile.char =
              flowerTiles[
                (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
              ];
          } else if (tileChars[charIndex] === SEASON_TILE) {
            tile.char =
              seasonTiles[
                (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
              ];
          } else {
            tile.char = tileChars[charIndex];
          }
        } else {
          tile.char = tileChars[charIndex];
        }
      }

      tile.id = tileRefList.push(tile) - 1;
    })
  );

  // If there are extra tiles, remove them.
  if (
    tileDistribution === TileDistributionOptions.ALWAYS_BOTH_PAIRS &&
    chardupe < 3
  ) {
    for (let i = 0; i < chardupe + 1; i++) {
      const delTile = tileRefList.pop();

      tiles.forEach((coord) =>
        coord?.forEach((tile, index) => {
          if (tile === delTile) coord[index] = null;
        })
      );
    }
  } else if (chardupe % 2 === 0) {
    const delTile = tileRefList.pop();

    tiles.forEach((coord) =>
      coord?.forEach((tile, index) => {
        if (tile === delTile) coord[index] = null;
      })
    );
  }

  // Shuffle the board.
  for (let i = tileRefList.length - 1; i > 0; i--) {
    const randValue = Math.floor(seededRng.next() * (i + 1));

    const char = tileRefList[i].char;
    tileRefList[i].char = tileRefList[randValue].char;
    tileRefList[randValue].char = char;
  }

  return {
    ...layout,
    tiles,
    numTiles: tileRefList.length,
    ...calculateObstructedTiles({
      tiles,
      width: layout.width,
      height: layout.height,
    }),
    seed: finalSeed,
  };
}

// Generate a final game board based on the tile layout and optional random
// seed, using a shuffle that generates winnable boards by "pre-solving".
//
// This is done by taking a full layout whose tiles are unknown, and randomly
// "matching" valid pairs (temporarily removing them while changing them into
// a randomly selected tile pair).
export function generateBoardWithPresolvedShuffle({
  layout,
  seed,
  flowersAndSeasons = true,
  tileDistribution = TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS,
}) {
  if (layout == null)
    throw new Error("Attempted to create board with no board layout.");

  if (!Object.values(TileDistributionOptions).includes(tileDistribution))
    throw new Error("Invalid tile distribution option.");

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  // Final board output.
  const tiles = JSON.parse(JSON.stringify(layout.tiles));

  // Assign ids to all tiles.
  {
    let id = 0;
    tiles.forEach((coord) =>
      coord?.forEach((t) => {
        if (t) t.id = id++;
      })
    );
  }

  // Get overlapping and/or adjacent tiles for each tile in the initial
  // layout.
  const obstructedTiles = calculateObstructedTiles({
    tiles,
    width: layout.width,
    height: layout.height,
  });

  // A semi-shallow copy of the obstructedTiles array for tiles that are
  // "currently" unmatched in the process. This will shrink as more
  // matches are made, but will not mutate the obstructedTiles array (only the
  // final board, for selecting the tile design).
  let tilesToProcess = obstructedTiles.map((t) => {
    return {
      tile: t.tile,
      overlapping: t.overlapping.slice(),
      leftAdjacent: t.leftAdjacent.slice(),
      rightAdjacent: t.rightAdjacent.slice(),
    };
  });

  let numTiles = tilesToProcess.length;

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
  const tileCharSet = [
    ...Array(flowersAndSeasons ? 0x23 + 1 : 0x21 + 1).keys(),
  ];
  let orderedTilePairChars = [];

  // Flower tiles (0x22) and Season tiles (0x23) are four unique tile designs
  // each, rather than four of the same tile design.
  let flowerTiles = ALL_FLOWER_TILES.slice(),
    seasonTiles = ALL_SEASON_TILES.slice(),
    nextFlowerTile = 0,
    nextSeasonTile = 0;

  // Shuffle the the tile selection, including the flower and season tiles. This
  // does not matter for boards that use the exact amount of tiles, but it gives
  // all tile designs the chance of appearing evenly in both smaller and larger
  // boards.
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

    // Shuffle Flower and Season tiles.
    if (flowersAndSeasons) {
      for (let i = flowerTiles.length - 1; i > 0; i--) {
        const randValue = Math.floor(seededRng.next() * (i + 1));

        const char = flowerTiles[i];
        flowerTiles[i] = flowerTiles[randValue];
        flowerTiles[randValue] = char;
      }

      for (let i = seasonTiles.length - 1; i > 0; i--) {
        const randValue = Math.floor(seededRng.next() * (i + 1));

        const char = seasonTiles[i];
        seasonTiles[i] = seasonTiles[randValue];
        seasonTiles[randValue] = char;
      }
    }
  }

  // We do not want to end up in a situation where the final set of tiles are
  // all stacked on top of each-other. There is no easy way to detect this
  // beforehand, so for this shuffling algorithm, we're going to prioritize
  // tiles are on top of a deep overlap stack when it becomes close to a problem.
  let overlapStackDepths =
    sortTileIDsByHighestOverlapStackDepth(tilesToProcess);

  // Randomize the tiles in the depth array so when we pull from it, it's
  // already random.
  overlapStackDepths.forEach((depth) => {
    for (let i = depth.length - 1; i > 0; i--) {
      const randValue = Math.floor(seededRng.next() * (i + 1));

      const id = depth[i];
      depth[i] = depth[randValue];
      depth[randValue] = id;
    }
  });

  // Using a blank version of the game board, make random valid pairs and
  // change their design to match.
  for (let i = 0; i < numPairs; i++) {
    // Grab all the valid tiles ready to be matched.
    let validTiles = tilesToProcess.filter(
      (t) =>
        t.overlapping.length === 0 &&
        (t.leftAdjacent.length === 0 || t.rightAdjacent.length === 0)
    );

    if (validTiles.length < 2) {
      // This isn't good. We can't make a match! Just skip all the other tiles.
      console.error(
        "Can not fully populate a winning board, likely due to an invalid layout!"
      );
      break;
    }

    // The current algorithm for determining when to trigger the overlap stack
    // depth check is:
    //
    // num of pairs remaining <= current highest stack depth * 2
    //
    // There may be a more efficient way to do this.

    if (numPairs - i <= overlapStackDepths.length * 2) {
      // Prioritize tiles that are highest in an overlap stack.
      const pickedTiles = overlapStackDepths
        .map((d) => d.filter((t) => validTiles.some((vt) => vt.tile.id === t)))
        .reverse()
        .flat()
        .splice(0, 2);

      validTiles = validTiles.filter((t) => pickedTiles.includes(t.tile.id));
    }

    // Choose first tile. Remove it from valid tile list so there's no chance
    // of it being picked up by the second tile.
    const firstTileIndex = Math.floor(seededRng.next() * validTiles.length);
    let firstTile = validTiles[firstTileIndex];

    validTiles.splice(firstTileIndex, 1);

    // Choose second tile.
    const secondTileIndex = Math.floor(seededRng.next() * validTiles.length);
    let secondTile = validTiles[secondTileIndex];

    // Assign the next tile character.
    if (tileDistribution === TileDistributionOptions.RANDOM) {
      const randValue = Math.floor(seededRng.next() * tileCharSet.length);

      if (tileCharSet[randValue] === FLOWER_TILE) {
        firstTile.tile.char =
          flowerTiles[Math.floor(seededRng.next() * flowerTiles.length)];
        secondTile.tile.char =
          flowerTiles[Math.floor(seededRng.next() * flowerTiles.length)];
      } else if (tileCharSet[randValue] === SEASON_TILE) {
        firstTile.tile.char =
          seasonTiles[Math.floor(seededRng.next() * seasonTiles.length)];
        secondTile.tile.char =
          seasonTiles[Math.floor(seededRng.next() * seasonTiles.length)];
      } else {
        firstTile.tile.char = secondTile.tile.char = tileCharSet[randValue];
      }
    } else if (orderedTilePairChars[i] === FLOWER_TILE) {
      firstTile.tile.char =
        flowerTiles[
          (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
        ];
      secondTile.tile.char =
        flowerTiles[
          (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
        ];
    } else if (orderedTilePairChars[i] === SEASON_TILE) {
      firstTile.tile.char =
        seasonTiles[
          (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
        ];
      secondTile.tile.char =
        seasonTiles[
          (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
        ];
    } else {
      firstTile.tile.char = secondTile.tile.char = orderedTilePairChars[i];
    }

    // Filter both of these tiles out of the "to process" list, then out of the
    // other validity criterias of all other tiles.
    tilesToProcess = tilesToProcess.filter(
      (t) => t.tile !== firstTile.tile && t.tile !== secondTile.tile
    );

    tilesToProcess.forEach((t) => {
      t.overlapping = t.overlapping.filter(
        (ot) => ot.tile !== firstTile.tile && ot.tile !== secondTile.tile
      );
      t.leftAdjacent = t.leftAdjacent.filter(
        (ot) => ot !== firstTile.tile && ot !== secondTile.tile
      );
      t.rightAdjacent = t.rightAdjacent.filter(
        (ot) => ot !== firstTile.tile && ot !== secondTile.tile
      );
    });

    overlapStackDepths.forEach(
      (d, i, a) =>
        (a[i] = d.filter(
          (t) => t !== firstTile.tile.id && t !== secondTile.tile.id
        ))
    );
    overlapStackDepths = overlapStackDepths.filter((d) => d.length > 0);
  }

  // Remove unused or unreachable tiles.
  tiles.forEach((coord) => {
    coord?.forEach((tile, i) => {
      if (tile && !("char" in tile)) {
        obstructedTiles.forEach((t) => {
          t.overlapping = t.overlapping.filter((ot) => ot.tile !== tile);
          t.leftAdjacent = t.leftAdjacent.filter((ot) => ot !== tile);
          t.rightAdjacent = t.rightAdjacent.filter((ot) => ot !== tile);
        });

        coord[i] = null;

        numTiles--;
      }
    });
  });

  return {
    ...layout,
    tiles,
    numTiles,
    obstructedTiles,
    seed: finalSeed,
  };
}

// Generates an array of tiles, regardless of height, and the tiles that either
// overlap them or are directly adjacent to them horizontally. This is used to
// determine if they are selectable or hidden from view.
//
// Note: Tiles are references to the tiles array and are not copies.
//
// Returns an array of the following:
// {
//    tile (tile being obstructed),
//    overlapping (array of tiles overlapping it and the regions, see below),
//    leftAdjacent (array of tiles touching it from the left),
//    rightAdjacent (array of tiles touching it from the right)
// }
//
// The overlapping array are objects:
//  {
//    tile (tile overlapping it),
///    region (4-bit number for which region is being obscured, see
//             OverlappingTileRegions)
//  }
//
export function calculateObstructedTiles({ tiles, width, height }) {
  if (tiles == null) return null;

  const boardWidth = parseInt(width),
    boardHeight = parseInt(height);

  if (isNaN(boardWidth) || isNaN(boardHeight)) return null;

  const obstructedTiles = [];

  tiles.forEach((coord, index) =>
    coord?.forEach((tile, height) => {
      if (tile != null) {
        obstructedTiles.push({
          tile,
          overlapping: [
            // Add the tile directly above it, regardless of half-stepping.
            coord.length > height && coord[height + 1] != null
              ? {
                  tile: coord[height + 1],
                  region:
                    // Left & Right
                    ((tile.xhalfstep || !coord[height + 1].xhalfstep
                      ? OverlappingTileRegions.TOP_LEFT |
                        OverlappingTileRegions.BOTTOM_LEFT
                      : 0) |
                      (!tile.xhalfstep || coord[height + 1].xhalfstep
                        ? OverlappingTileRegions.TOP_RIGHT |
                          OverlappingTileRegions.BOTTOM_RIGHT
                        : 0)) & // Top & Bottom
                    ((tile.yhalfstep || !coord[height + 1].yhalfstep
                      ? OverlappingTileRegions.TOP_LEFT |
                        OverlappingTileRegions.TOP_RIGHT
                      : 0) |
                      (!tile.yhalfstep || coord[height + 1].yhalfstep
                        ? OverlappingTileRegions.BOTTOM_LEFT |
                          OverlappingTileRegions.BOTTOM_RIGHT
                        : 0)),
                }
              : null,

            // Add surrounding tiles that are half-stepped directly above it.

            // Upper-Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Not at top edge
            index - boardWidth >= 0 &&
            // - Tile is not stepped
            !tile.xhalfstep &&
            !tile.yhalfstep &&
            // - Other tile exists and is stepped in both
            tiles[index - boardWidth - 1]?.length > height &&
            tiles[index - boardWidth - 1][height + 1] != null &&
            tiles[index - boardWidth - 1][height + 1].xhalfstep &&
            tiles[index - boardWidth - 1][height + 1].yhalfstep
              ? {
                  tile: tiles[index - boardWidth - 1][height + 1],
                  region: OverlappingTileRegions.TOP_LEFT,
                }
              : null,

            // Upper
            // - Not at top edge
            index - boardWidth >= 0 &&
            // - Tile is not y-stepped
            !tile.yhalfstep &&
            // - Other tile exists and is y-stepped
            tiles[index - boardWidth]?.length > height &&
            tiles[index - boardWidth][height + 1] != null &&
            tiles[index - boardWidth][height + 1].yhalfstep
              ? {
                  tile: tiles[index - boardWidth][height + 1],
                  region:
                    (!(
                      !tile.xhalfstep &&
                      tiles[index - boardWidth][height + 1].xhalfstep
                    )
                      ? OverlappingTileRegions.TOP_LEFT
                      : 0) |
                    (!(
                      tile.xhalfstep &&
                      !tiles[index - boardWidth][height + 1].xhalfstep
                    )
                      ? OverlappingTileRegions.TOP_RIGHT
                      : 0),
                }
              : null,

            // Upper-Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Not at top edge
            index - boardWidth >= 0 &&
            // - Tile is x-stepped and not y-stepped
            tile.xhalfstep &&
            !tile.yhalfstep &&
            // - Other tile exists, is y-stepped, and not x-stepped
            tiles[index - boardWidth + 1]?.length > height &&
            tiles[index - boardWidth + 1][height + 1] != null &&
            !tiles[index - boardWidth + 1][height + 1].xhalfstep &&
            tiles[index - boardWidth + 1][height + 1].yhalfstep
              ? {
                  tile: tiles[index - boardWidth + 1][height + 1],
                  region: OverlappingTileRegions.TOP_RIGHT,
                }
              : null,

            // Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Tile is not x-stepped
            !tile.xhalfstep &&
            // - Other tile exists and is x-stepped
            tiles[index - 1]?.length > height &&
            tiles[index - 1][height + 1] != null &&
            tiles[index - 1][height + 1].xhalfstep
              ? {
                  tile: tiles[index - 1][height + 1],
                  region:
                    (!(
                      !tile.yhalfstep && tiles[index - 1][height + 1].yhalfstep
                    )
                      ? OverlappingTileRegions.TOP_LEFT
                      : 0) |
                    (!(
                      tile.yhalfstep && !tiles[index - 1][height + 1].yhalfstep
                    )
                      ? OverlappingTileRegions.BOTTOM_LEFT
                      : 0),
                }
              : null,

            // Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Tile is x-stepped
            tile.xhalfstep &&
            // - Other tile exists and is not x-stepped
            tiles[index + 1]?.length > height &&
            tiles[index + 1][height + 1] != null &&
            !tiles[index + 1][height + 1].xhalfstep
              ? {
                  tile: tiles[index + 1][height + 1],
                  region:
                    (!(
                      !tile.yhalfstep && tiles[index + 1][height + 1].yhalfstep
                    )
                      ? OverlappingTileRegions.TOP_RIGHT
                      : 0) |
                    (!(
                      tile.yhalfstep && !tiles[index + 1][height + 1].yhalfstep
                    )
                      ? OverlappingTileRegions.BOTTOM_RIGHT
                      : 0),
                }
              : null,

            // Lower-Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Not at bottom edge
            index + boardWidth < boardWidth * boardHeight &&
            // - Tile is y-stepped and not x-stepped
            !tile.xhalfstep &&
            tile.yhalfstep &&
            // - Other tile exists, is x-stepped, and not y-stepped
            tiles[index + boardWidth - 1]?.length > height &&
            tiles[index + boardWidth - 1][height + 1] != null &&
            tiles[index + boardWidth - 1][height + 1].xhalfstep &&
            !tiles[index + boardWidth - 1][height + 1].yhalfstep
              ? {
                  tile: tiles[index + boardWidth - 1][height + 1],
                  region: OverlappingTileRegions.BOTTOM_LEFT,
                }
              : null,

            // Lower
            // - Not at bottom edge
            index + boardWidth < boardWidth * boardHeight &&
            // - Tile is y-stepped
            tile.yhalfstep &&
            // - Other tile exists and is not y-stepped
            tiles[index + boardWidth]?.length > height &&
            tiles[index + boardWidth][height + 1] != null &&
            !tiles[index + boardWidth][height + 1].yhalfstep
              ? {
                  tile: tiles[index + boardWidth][height + 1],
                  region:
                    (!(
                      !tile.xhalfstep &&
                      tiles[index + boardWidth][height + 1].xhalfstep
                    )
                      ? OverlappingTileRegions.BOTTOM_LEFT
                      : 0) |
                    (!(
                      tile.xhalfstep &&
                      !tiles[index + boardWidth][height + 1].xhalfstep
                    )
                      ? OverlappingTileRegions.BOTTOM_RIGHT
                      : 0),
                }
              : null,

            // Lower-Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Not at bottom edge
            index + boardWidth < boardWidth * boardHeight &&
            // - Tile is stepped in both
            tile.xhalfstep &&
            tile.yhalfstep &&
            // - Other tile exists and is not stepped
            tiles[index + boardWidth + 1]?.length > height &&
            tiles[index + boardWidth + 1][height + 1] != null &&
            !tiles[index + boardWidth + 1][height + 1].xhalfstep &&
            !tiles[index + boardWidth + 1][height + 1].yhalfstep
              ? {
                  tile: tiles[index + boardWidth + 1][height + 1],
                  region: OverlappingTileRegions.BOTTOM_RIGHT,
                }
              : null,
          ].filter((v) => v),

          leftAdjacent: [
            // Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Other tile exists
            tiles[index - 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(!tiles[index - 1][height]?.xhalfstep && tile.xhalfstep)
              ? tiles[index - 1][height]
              : null,

            // Upper-Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Not at top edge
            index - boardWidth >= 0 &&
            // - Other tile exists
            tiles[index - boardWidth - 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(
              !tiles[index - boardWidth - 1][height]?.xhalfstep &&
              tile.xhalfstep
            ) &&
            // - Is not y-hs, but other tile is.
            tiles[index - boardWidth - 1][height]?.yhalfstep &&
            !tile.yhalfstep
              ? tiles[index - boardWidth - 1][height]
              : null,

            // Lower-Left
            // - Not at left edge
            !(index % boardWidth === 0) &&
            // - Not at bottom edge
            index + boardWidth < boardWidth * boardHeight &&
            // - Other tile exists
            tiles[index + boardWidth - 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(
              !tiles[index + boardWidth - 1][height]?.xhalfstep &&
              tile.xhalfstep
            ) &&
            // - Is y-hs, but other tile is not.
            !tiles[index + boardWidth - 1][height]?.yhalfstep &&
            tile.yhalfstep
              ? tiles[index + boardWidth - 1][height]
              : null,
          ].filter((v) => v),

          rightAdjacent: [
            // Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Other tile exists
            tiles[index + 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(tiles[index + 1][height]?.xhalfstep && !tile.xhalfstep)
              ? tiles[index + 1][height]
              : null,

            // Upper-Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Not at top edge
            index - boardWidth >= 0 &&
            // - Other tile exists
            tiles[index - boardWidth + 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(
              tiles[index - boardWidth + 1][height]?.xhalfstep &&
              !tile.xhalfstep
            ) &&
            // - Is not y-hs, but other tile is.
            tiles[index - boardWidth + 1][height]?.yhalfstep &&
            !tile.yhalfstep
              ? tiles[index - boardWidth + 1][height]
              : null,

            // Lower-Right
            // - Not at right edge
            !(index % boardWidth === boardWidth - 1) &&
            // - Not at bottom edge
            index + boardWidth < boardWidth * boardHeight &&
            // - Other tile exists
            tiles[index + boardWidth + 1]?.length >= height &&
            // - Not x-hs away from other tile.
            !(
              tiles[index + boardWidth + 1][height]?.xhalfstep &&
              !tile.xhalfstep
            ) &&
            // - Is y-hs, but other tile is not.
            !tiles[index + boardWidth + 1][height]?.yhalfstep &&
            tile.yhalfstep
              ? tiles[index + boardWidth + 1][height]
              : null,
          ].filter((v) => v),
        });
      }
    })
  );

  return obstructedTiles;
}

export const OverlappingTileRegions = Object.freeze({
  BOTTOM_LEFT: 0b0001,
  BOTTOM_RIGHT: 0b0010,
  TOP_LEFT: 0b0100,
  TOP_RIGHT: 0b1000,
});

// Calculates the highest overlap stack depth for each tile, then return them
// in an array sorted by depth. It's a bit of a mess.
function sortTileIDsByHighestOverlapStackDepth(tilesToProcess) {
  // Array indexed by each tile's ID, showing the tile's highest stack depth.
  const tileStackDepths = Array.from(
    { length: tilesToProcess.length },
    () => null
  );

  // Mutable copy of the tile array that is to be processed.
  const tempTilesToProcess = tilesToProcess.map(({ tile, overlapping }) => ({
    tile,
    overlapping: overlapping.slice(),
  }));

  let lastTilePass = null;

  // Get all the highest stack depths of each tile.
  while (lastTilePass !== tempTilesToProcess.length) {
    // If no tiles are removed from the temp array, we're done here.
    lastTilePass = tempTilesToProcess.length;

    // Get the current non-overlapped ("top") tiles, add a
    // depth of 0 to them, and remove them from the temp array.
    for (let t = tempTilesToProcess.length - 1; t >= 0; t--) {
      if (tempTilesToProcess[t].overlapping.length === 0) {
        tileStackDepths[tempTilesToProcess[t].tile.id] = 0;
        tempTilesToProcess.splice(t, 1);
      }
    }

    // For all remaining tiles in the temp array, check to see if the tiles
    // that were just removed overlap them. If they are, sever the connection
    // between them while "pushing up" the depth of all overlapping tiles (and
    // the tiles overlapping them, and so on).

    const toPushUp = [];

    tempTilesToProcess.forEach((t) => {
      for (let ot = t.overlapping.length - 1; ot >= 0; ot--) {
        if (tileStackDepths[t.overlapping[ot].tile.id] !== null) {
          if (!toPushUp.includes(t.overlapping[ot].tile.id)) {
            toPushUp.push(t.overlapping[ot].tile.id);
          }
          t.overlapping.splice(ot, 1);
        }
      }
    });

    for (let i = 0; i < toPushUp.length; i++) {
      tileStackDepths[toPushUp[i]]++;
      tilesToProcess
        .filter((t2) => t2.tile.id === toPushUp[i])
        .forEach((t3) => {
          t3.overlapping.forEach((ot) => {
            if (!toPushUp.includes(ot.tile.id)) {
              toPushUp.push(ot.tile.id);
            }
          });
        });
    }
  }

  // Reorganize from indexing by tile to indexing by stack depth, to make it
  // easier to track how many tiles are in each stack depth.

  const res = Array.from(
    {
      length: tileStackDepths.reduce((acc, cur) => (acc > cur ? acc : cur)) + 1,
    },
    () => []
  );

  tileStackDepths.forEach((depth, tile) => res[depth].push(tile));

  return res;
}
