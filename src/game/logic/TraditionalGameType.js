import * as BoardGenerator from "./traditional/BoardGenerator";
import * as BoardLayoutGenerator from "./traditional/BoardLayoutGenerator";

const LAYOUT_CODE_TURTLE =
  "MJS01f8y2XDHHLRX5GKRX6RQJJQLC4Z8FLRQP2Cg7zCNPQLRC4Z8Z4Z8CXDLQPNNPQLRX4RQJJQLX6GKRX5HHLR";

export const ALL_FLOWER_TILES = [0x22, 0x23, 0x24, 0x25],
  ALL_SEASON_TILES = [0x26, 0x27, 0x28, 0x29];

// Generate a full playable board.
//
// For now, just generate the classic "turtle" layout.
export function generateBoard({
  layoutCode,
  seed,
  useBlindShuffle = false,
  fullTest = false,
}) {
  const turtleLayoutCode = fullTest
    ? BoardLayoutGenerator.generateLayoutCode({
        tiles: BoardLayoutGenerator.generateTurtleBoard(),
        width: 15,
        height: 8,
      })
    : layoutCode != null
    ? layoutCode
    : LAYOUT_CODE_TURTLE;

  if (fullTest) console.log("Generated layout code: " + layoutCode);

  const board = useBlindShuffle
    ? BoardGenerator.generateBoardWithSimpleShuffle({
        layout: BoardLayoutGenerator.generateBoardLayout(turtleLayoutCode),
        seed,
      })
    : BoardGenerator.generateBoardWithPresolvedShuffle({
        layout: BoardLayoutGenerator.generateBoardLayout(turtleLayoutCode),
        seed,
      });

  updateTileVisibilityAndSelectability(
    board.obstructedTiles,
    board.obstructedTileRegions
  );

  return {
    ...board,
    layoutCode: turtleLayoutCode,
  };
}

export function updateTileVisibilityAndSelectability(
  obstructedTiles,
  obstructedTileRegions
) {
  obstructedTiles.forEach((t) => {
    t.tile.hidden =
      t.char !== null &&
      obstructedTileRegions[t.tile.id].reduce(
        (acc, cur) => acc | cur.region,
        0
      ) === 0b1111 &&
      !t.overlapping.some((t) => t.char === null);

    t.tile.selectable =
      t.tile.char !== null &&
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

  const selectableTiles = tiles.flat().filter((t) => t?.selectable);

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
