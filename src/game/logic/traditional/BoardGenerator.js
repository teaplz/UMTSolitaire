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
export function generateBoardWithPresolvedShuffle() {}
