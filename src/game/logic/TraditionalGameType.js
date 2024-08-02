import * as BoardGenerator from "./traditional/BoardGenerator";

const LAYOUT_CODE_TURTLE =
  "MJS01f8y2XDHHLRX5GKRX6RQJJQLC4Z8FLRQP2Cg7zCNPQLRC4Z8Z4Z8CXDLQPNNPQLRX4RQJJQLX6GKRX5HHLR";

// Generate a full playable board.
//
// For now, just generate the classic "turtle" layout.
export function generateBoard({ fullTest = false }) {
  const turtleLayoutCode = fullTest
    ? BoardGenerator.generateLayoutCode({
        tiles: BoardGenerator.generateTurtleBoard(),
        width: 15,
        height: 8,
      })
    : LAYOUT_CODE_TURTLE;

  const board = BoardGenerator.generateBoardLayout(turtleLayoutCode);

  return {
    ...board,
    seed: 0,
    layoutCode: turtleLayoutCode,
  };
}
