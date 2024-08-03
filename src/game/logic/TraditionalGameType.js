import * as BoardGenerator from "./traditional/BoardGenerator";
import * as BoardLayoutGenerator from "./traditional/BoardLayoutGenerator";

const LAYOUT_CODE_TURTLE =
  "MJS01f8y2XDHHLRX5GKRX6RQJJQLC4Z8FLRQP2Cg7zCNPQLRC4Z8Z4Z8CXDLQPNNPQLRX4RQJJQLX6GKRX5HHLR";
  
export const FLOWER_TILE = 0x22, SEASON_TILE = 0x23;

// Generate a full playable board.
//
// For now, just generate the classic "turtle" layout.
export function generateBoard({ fullTest = false }) {
  const turtleLayoutCode = fullTest
    ? BoardLayoutGenerator.generateLayoutCode({
        tiles: BoardLayoutGenerator.generateTurtleBoard(),
        width: 15,
        height: 8,
      })
    : LAYOUT_CODE_TURTLE;

  const board = BoardGenerator.generateBoardWithPresolvedShuffle({
    layout: BoardLayoutGenerator.generateBoardLayout(turtleLayoutCode),
  });

  return {
    ...board,
    seed: 0,
    layoutCode: turtleLayoutCode,
  };
}
