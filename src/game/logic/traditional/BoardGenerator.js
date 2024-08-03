// Functions related to generating the board itself, namely the procedural
// (or completely random) generation of the board's tile placement.

import Rand from "rand-seed";
import { FLOWER_TILE, SEASON_TILE } from "../TraditionalGameType";

// Generate a final game board based on the tile layout and optional random
// seed, using a simple randomized shuffle. These boards can be unwinnable,
// which adds to the challenge.
export function generateBoardWithSimpleShuffle({
  layout,
  seed,
  flowersAndSeasons = true,
  allowSinglePairs = false,
}) {
  if (layout == null) {
    return null;
  }

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  let char = -1,
    chardupe = -1,
    randValue = 0;

  // Generate which tile designs are used. This is done by listing all
  // possible tile designs (without duplicates), then shuffling it.
  //
  // The values correspond with the character cdoes in the Mahjong Tiles
  // unicode block.
  let usedTiles = [...Array(flowersAndSeasons ? 0x23 + 1 : 0x21 + 1).keys()];

  // Randomize tile design selection. While this does not matter much for
  // 100% boards, it ensures that the selection for smaller and larger boards
  // use a random assortment.
  for (let i = usedTiles.length - 1; i > 0; i--) {
    randValue = Math.floor(seededRng.next() * (i + 1));

    char = usedTiles[i];
    usedTiles[i] = usedTiles[randValue];
    usedTiles[randValue] = char;
  }

  // Flower tiles (0x22 in usedTiles) and Season tiles (0x23 in usedTiles) are
  // four unique tile designs each, rather than four of the same tile design.
  // Similar to the above, randomize the selection.
  let flowerTiles = [0x22, 0x23, 0x24, 0x25],
    seasonTiles = [0x26, 0x27, 0x28, 0x29],
    nextFlowerTile = 0,
    nextSeasonTile = 0;

  if (flowersAndSeasons) {
    for (let i = flowerTiles.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = flowerTiles[i];
      flowerTiles[i] = flowerTiles[randValue];
      flowerTiles[randValue] = char;
    }

    for (let i = seasonTiles.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = seasonTiles[i];
      seasonTiles[i] = seasonTiles[randValue];
      seasonTiles[randValue] = char;
    }
  }

  // The "tiles" array is the final board output, while "tileRefList" keeps a
  // reference to each tile in the board so we don't have to constantly search
  // while shuffling.
  const tiles = layout.tiles.slice(),
    tileRefList = [];

  char = 0;

  // Generate the initial unshuffled layout of tiles.
  tiles.forEach((coord) =>
    coord?.forEach((tile) => {
      if (tile == null) return;

      if ((chardupe = (chardupe + 1) % (allowSinglePairs ? 2 : 4)) === 0) {
        char = (char + 1) % usedTiles.length;
      }

      if (flowersAndSeasons) {
        if (usedTiles[char] === FLOWER_TILE) {
          tile.char =
            flowerTiles[
              (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
            ];
        } else if (usedTiles[char] === SEASON_TILE) {
          tile.char =
            seasonTiles[
              (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
            ];
        } else {
          tile.char = usedTiles[char];
        }
      } else {
        tile.char = usedTiles[char];
      }

      tile.id = tileRefList.push(tile);
    })
  );

  // If there is an extra tile, remove it.
  if (chardupe % 2 === 0) {
    const delTile = tileRefList.pop();

    tiles.forEach((coord) =>
      coord?.forEach((tile, index) => {
        if (tile === delTile) coord[index] = null;
      })
    );
  }

  // Shuffle the board.
  for (let i = tileRefList.length - 1; i > 0; i--) {
    randValue = Math.floor(seededRng.next() * (i + 1));

    char = tileRefList[i].char;
    tileRefList[i].char = tileRefList[randValue].char;
    tileRefList[randValue].char = char;
  }

  return {
    ...layout,
    tiles,
    numTiles: tileRefList.length,
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
  allowSinglePairs = false,
}) {
  if (layout == null) {
    return null;
  }

  // Determine if we need to generate a random seed
  // or use a pre-determined one from the seed argument.
  // This will be used in both tile selection and board shuffling.
  const finalSeed = isNaN(parseInt(seed, 10))
    ? (Math.random() * Number.MAX_SAFE_INTEGER) >>> 0
    : parseInt(seed, 10) >>> 0;

  const seededRng = new Rand(finalSeed + "");

  let char = -1,
    chardupe = -1,
    randValue = 0;

  // Final board output.
  const tiles = layout.tiles.slice();

  // Keeps track of tiles that are currently unmatched, along with
  // all tiles that are currently overlapping and/or adjacent.
  let tilesToProcess = [];

  // Populate tilesToProcess while assigning IDs to the tiles.
  tiles.forEach((coord, index) =>
    coord?.forEach((tile, height) => {
      tile.id = tilesToProcess.push({
        tile,
        overlapping: [
          // TODO: Manage gaps.

          // Add all directly above it, regardless of half-stepping.
          coord.length > height ? coord.slice(height + 1) : null,

          // Add surrounding tiles that are half-stepped above it.

          // Upper-Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Not at top edge
          index - layout.width >= 0 &&
          // - Tile is not stepped
          !tile.xhalfstep &&
          !tile.yhalfstep &&
          // - Other tiles exist and is stepped in both
          tiles[index - layout.width - 1]?.length > height
            ? tiles[index - layout.width - 1]
                .slice(height + 1)
                .filter((t) => t.xhalfstep && t.yhalfstep)
            : null,

          // Upper
          // - Not at top edge
          index - layout.width >= 0 &&
          // - Tile is not y-stepped
          !tile.yhalfstep &&
          // - Other tiles exist and is y-stepped
          tiles[index - layout.width]?.length > height
            ? tiles[index - layout.width]
                .slice(height + 1)
                .filter((t) => t.yhalfstep)
            : null,

          // Upper-Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Not at top edge
          index - layout.width >= 0 &&
          // - Tile is x-stepped and not y-stepped
          tile.xhalfstep &&
          !tile.yhalfstep &&
          // - Other tiles exist, is y-stepped, and not x-stepped
          tiles[index - layout.width + 1]?.length > height
            ? tiles[index - layout.width + 1]
                .slice(height + 1)
                .filter((t) => !t.xhalfstep && t.yhalfstep)
            : null,

          // Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Tile is not x-stepped
          !tile.xhalfstep &&
          // - Other tiles exist and is x-stepped
          tiles[index - 1]?.length > height
            ? tiles[index - 1].slice(height + 1).filter((t) => t.xhalfstep)
            : null,

          // Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Tile is x-stepped
          tile.xhalfstep &&
          // - Other tiles exist and is not x-stepped
          tiles[index + 1]?.length > height
            ? tiles[index + 1].slice(height + 1).filter((t) => !t.xhalfstep)
            : null,

          // Lower-Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Not at bottom edge
          index + layout.width < layout.width * layout.height &&
          // - Tile is y-stepped and not x-stepped
          !tile.xhalfstep &&
          tile.yhalfstep &&
          // - Other tiles exist, is x-stepped, and not y-stepped
          tiles[index + layout.width - 1]?.length > height
            ? tiles[index + layout.width - 1]
                .slice(height + 1)
                .filter((t) => t.xhalfstep && !t.yhalfstep)
            : null,

          // Lower
          // - Not at bottom edge
          index + layout.width < layout.width * layout.height &&
          // - Tile is y-stepped
          tile.yhalfstep &&
          // - Other tiles exist and is not y-stepped
          tiles[index + layout.width]?.length > height
            ? tiles[index + layout.width]
                .slice(height + 1)
                .filter((t) => !t.yhalfstep)
            : null,

          // Lower-Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Not at bottom edge
          index + layout.width < layout.width * layout.height &&
          // - Tile is stepped in both
          tile.xhalfstep &&
          tile.yhalfstep &&
          // - Other tiles exist and is not stepped
          tiles[index - layout.width - 1]?.length > height
            ? tiles[index - layout.width - 1]
                .slice(height + 1)
                .filter((t) => !t.xhalfstep && !t.yhalfstep)
            : null,
        ]
          .flat()
          .filter((v) => v),

        leftAdjacent: [
          // Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Other tile exists
          tiles[index - 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(!tiles[index - 1][height]?.xhalfstep && tile.xhalfstep)
            ? tiles[index - 1][height]
            : null,

          // Upper-Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Not at top edge
          index - layout.width >= 0 &&
          // - Other tile exists
          tiles[index - layout.width - 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(
            !tiles[index - layout.width - 1][height]?.xhalfstep &&
            tile.xhalfstep
          ) &&
          // - Is not y-hs, but other tile is.
          tiles[index - layout.width - 1][height]?.yhalfstep &&
          !tile.yhalfstep
            ? tiles[index - layout.width - 1][height]
            : null,

          // Lower-Left
          // - Not at left edge
          !(index % layout.width === 0) &&
          // - Not at bottom edge
          index + layout.width < layout.width * layout.height &&
          // - Other tile exists
          tiles[index + layout.width - 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(
            !tiles[index + layout.width - 1][height]?.xhalfstep &&
            tile.xhalfstep
          ) &&
          // - Is y-hs, but other tile is not.
          !tiles[index + layout.width - 1][height]?.yhalfstep &&
          tile.yhalfstep
            ? tiles[index + layout.width - 1][height]
            : null,
        ].filter((v) => v),

        rightAdjacent: [
          // Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Other tile exists
          tiles[index + 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(tiles[index + 1][height]?.xhalfstep && !tile.xhalfstep)
            ? tiles[index + 1][height]
            : null,

          // Upper-Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Not at top edge
          index - layout.width >= 0 &&
          // - Other tile exists
          tiles[index - layout.width + 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(
            tiles[index - layout.width + 1][height]?.xhalfstep &&
            !tile.xhalfstep
          ) &&
          // - Is not y-hs, but other tile is.
          tiles[index - layout.width + 1][height]?.yhalfstep &&
          !tile.yhalfstep
            ? tiles[index - layout.width + 1][height]
            : null,

          // Lower-Right
          // - Not at right edge
          !(index % layout.width === layout.width - 1) &&
          // - Not at bottom edge
          index + layout.width < layout.width * layout.height &&
          // - Other tile exists
          tiles[index + layout.width + 1]?.length >= height &&
          // - Not x-hs away from other tile.
          !(
            tiles[index + layout.width + 1][height]?.xhalfstep &&
            !tile.xhalfstep
          ) &&
          // - Is y-hs, but other tile is not.
          !tiles[index + layout.width + 1][height]?.yhalfstep &&
          tile.yhalfstep
            ? tiles[index + layout.width + 1][height]
            : null,
        ].filter((v) => v),
      });
    })
  );

  let numTiles = tilesToProcess.length;
  const numPairs = numTiles >> 1;

  // Generate which tile designs are used. This is done by listing all
  // possible tile designs (without duplicates), then shuffling it.
  //
  // The values correspond with the character cdoes in the Mahjong Tiles
  // unicode block.
  let allTileValues = [
    ...Array(flowersAndSeasons ? 0x23 + 1 : 0x21 + 1).keys(),
  ];

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

  // Flower tiles (0x22) and Season tiles (0x23) are four unique tile designs 
  // each, rather than four of the same tile design.
  //Similar to the above, shuffle the selection.
  let flowerTiles = [0x22, 0x23, 0x24, 0x25],
    seasonTiles = [0x26, 0x27, 0x28, 0x29],
    nextFlowerTile = 0,
    nextSeasonTile = 0;

  if (flowersAndSeasons) {
    for (let i = flowerTiles.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = flowerTiles[i];
      flowerTiles[i] = flowerTiles[randValue];
      flowerTiles[randValue] = char;
    }

    for (let i = seasonTiles.length - 1; i > 0; i--) {
      randValue = Math.floor(seededRng.next() * (i + 1));

      char = seasonTiles[i];
      seasonTiles[i] = seasonTiles[randValue];
      seasonTiles[randValue] = char;
    }
  }

  // Form random pairs.
  for (let i = 0; i < numPairs; i++) {
    // Grab all the valid tiles ready to be matched.
    const validTiles = tilesToProcess.filter(
      (t) =>
        t.overlapping.length === 0 &&
        (t.leftAdjacent.length === 0 || t.rightAdjacent.length === 0)
    );

    // Choose first tile. Remove it from valid tile list so there's no chance
    // of it being picked up by the second tile.
    const firstTileIndex = Math.floor(seededRng.next() * validTiles.length);
    let firstTile = validTiles[firstTileIndex];

    validTiles.splice(firstTileIndex, 1);

    // Choose second tile.
    const secondTileIndex = Math.floor(seededRng.next() * validTiles.length);
    let secondTile = validTiles[secondTileIndex];

    // Assign the next tile character.
    if (orderedTilePairs[i] === FLOWER_TILE) {
      firstTile.tile.char =
        flowerTiles[
          (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
        ];
      secondTile.tile.char =
        flowerTiles[
          (nextFlowerTile = (nextFlowerTile + 1) % flowerTiles.length)
        ];
    } else if (orderedTilePairs[i] === SEASON_TILE) {
      firstTile.tile.char =
        seasonTiles[
          (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
        ];
      secondTile.tile.char =
        seasonTiles[
          (nextSeasonTile = (nextSeasonTile + 1) % seasonTiles.length)
        ];
    } else {
      firstTile.tile.char = orderedTilePairs[i];
      secondTile.tile.char = orderedTilePairs[i];
    }

    // Filter both of these tiles out of the "to process" list, then out of the
    // other validity criterias of all other tiles.
    tilesToProcess = tilesToProcess.filter(
      (t) => t.tile !== firstTile.tile && t.tile !== secondTile.tile
    );

    tilesToProcess.forEach((t) => {
      t.overlapping = t.overlapping.filter(
        (t) => t !== firstTile.tile && t !== secondTile.tile
      );
      t.leftAdjacent = t.leftAdjacent.filter(
        (t) => t !== firstTile.tile && t !== secondTile.tile
      );
      t.rightAdjacent = t.rightAdjacent.filter(
        (t) => t !== firstTile.tile && t !== secondTile.tile
      );
    });
  }

  // Remove unused or unreachable tiles.
  tiles.forEach((coord) => {
    coord?.forEach((tile) => {
      if (tile.char === undefined) {
        tile = null;
        numTiles--;
      }
    });
  });

  return {
    ...layout,
    tiles,
    numTiles,
    seed: finalSeed,
  };
}
