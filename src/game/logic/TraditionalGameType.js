import * as BoardGenerator from "./traditional/BoardGenerator";

import * as BoardLayoutGenerator from "./traditional/BoardLayoutGenerator";
export * as BoardLayoutGenerator from "./traditional/BoardLayoutGenerator";

import * as DefaultBoardLayouts from "./traditional/DefaultBoardLayouts";
export * as DefaultBoardLayouts from "./traditional/DefaultBoardLayouts";

export const ALL_FLOWER_TILES = [0x22, 0x23, 0x24, 0x25],
  ALL_SEASON_TILES = [0x26, 0x27, 0x28, 0x29];

export {
  MAX_BOARD_WIDTH,
  MAX_BOARD_HEIGHT,
  MAX_BOARD_DEPTH,
} from "./traditional/BoardLayoutGenerator";

export function generateBoard({
  layoutCode,
  seed,
  useBlindShuffle = false,
  tileDistribution,
}) {
  let generatedBoard,
    finalLayoutCode = layoutCode ?? DefaultBoardLayouts.TURTLE.code;

  try {
    console.log(
      "Attempting to create Traditional board with layout code '" +
        finalLayoutCode +
        (seed != null ? "' and seed '" + seed : "") +
        "' and Shuffle Type '" +
        (useBlindShuffle ? "Simple" : "Presolved") +
        "' and Tile Dist Option '" +
        tileDistribution +
        "'"
    );

    generatedBoard = useBlindShuffle
      ? BoardGenerator.generateBoardWithSimpleShuffle({
          layout: BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          tileDistribution,
        })
      : BoardGenerator.generateBoardWithPresolvedShuffle({
          layout: BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          tileDistribution,
        });
  } catch (e) {
    console.error(e.message);
    console.error("Invalid generated board, switching to default board.");

    finalLayoutCode = DefaultBoardLayouts.TURTLE.code;

    generatedBoard = BoardGenerator.generateBoardWithPresolvedShuffle({
      layout: BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
    });
  }

  updateTileVisibilityAndSelectability(
    generatedBoard?.obstructedTiles,
    generatedBoard?.obstructedTileRegions
  );

  return {
    ...generatedBoard,
    layoutCode: finalLayoutCode,
  };
}

export function updateTileVisibilityAndSelectability(
  obstructedTiles,
  obstructedTileRegions
) {
  obstructedTiles?.forEach((t) => {
    t.tile.hidden =
      t.tile.char != null &&
      obstructedTileRegions[t.tile.id].reduce(
        (acc, cur) => acc | cur.region,
        0
      ) === 0b1111 &&
      !t.overlapping.some((t) => t.char === null);

    t.tile.selectable =
      t.tile.char != null &&
      (t.overlapping.length === 0 ||
        !t.overlapping.some((t) => t.char !== null)) &&
      (t.leftAdjacent.length === 0 ||
        !t.leftAdjacent.some((t) => t.char !== null) ||
        t.rightAdjacent.length === 0 ||
        !t.rightAdjacent.some((t) => t.char !== null));
  });
}

export function searchAllPossibleMatches(tiles) {
  const result = [];

  const selectableTiles = tiles?.flat().filter((t) => t?.selectable);

  if (selectableTiles == null) return null;

  for (let i = 0; i < selectableTiles.length; i++) {
    for (let j = i + 1; j < selectableTiles.length; j++) {
      if (tileMatches(selectableTiles[i], selectableTiles[j])) {
        result.push([selectableTiles[i].id, selectableTiles[j].id]);
      }
    }
  }

  return result;
}

export function tileMatches(tile1, tile2) {
  return (
    tile1.char === tile2.char ||
    (ALL_FLOWER_TILES.includes(tile1.char) &&
      ALL_FLOWER_TILES.includes(tile2.char)) ||
    (ALL_SEASON_TILES.includes(tile1.char) &&
      ALL_SEASON_TILES.includes(tile2.char))
  );
}

export { calculateObstructedTiles } from "./traditional/BoardGenerator";
