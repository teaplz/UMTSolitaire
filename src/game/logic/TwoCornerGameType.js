import * as BoardGenerator from "./twocorner/BoardGenerator";

import * as BoardLayoutGenerator from "./twocorner/BoardLayoutGenerator";
export * as BoardLayoutGenerator from "./twocorner/BoardLayoutGenerator";

import * as DefaultBoardLayouts from "./twocorner/DefaultBoardLayouts";
export * as DefaultBoardLayouts from "./twocorner/DefaultBoardLayouts";

export {
  MAX_BOARD_WIDTH,
  MAX_BOARD_HEIGHT,
} from "./twocorner/BoardLayoutGenerator";

export function generateBoard({
  layoutCode,
  boardWidth,
  boardHeight,
  seed,
  useBlindShuffle = false,
  tileDistribution,
}) {
  let generatedBoard, finalLayoutCode;

  try {
    // Generate the board based on the provided layout code or from a basic
    // rectangular board based on the provided width and height.
    finalLayoutCode =
      layoutCode ??
      BoardLayoutGenerator.generateLayoutCode({
        width: boardWidth,
        height: boardHeight,
      });

    console.log(
      "Attempting to create Two-Corner board with layout code '" +
        finalLayoutCode +
        (seed != null ? "' and " + "seed '" + seed : "") +
        "' and Shuffle Type '" +
        (useBlindShuffle ? "Simple" : "Presolved") +
        "' and Tile Dist Option '" +
        tileDistribution +
        "'"
    );

    generatedBoard = useBlindShuffle
      ? BoardGenerator.generateBoardWithSimpleShuffle({
          ...BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          tileDistribution,
        })
      : BoardGenerator.generateBoardWithPresolvedShuffle({
          ...BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          tileDistribution,
        });
  } catch (e) {
    console.error(e.message);
    console.error("Invalid generated board, switching to default 17x8 board.");

    finalLayoutCode = BoardLayoutGenerator.generateLayoutCode({
      width: 17,
      height: 8,
    });

    generatedBoard = BoardGenerator.generateBoardWithPresolvedShuffle({
      ...BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
    });
  }

  return { ...generatedBoard, layoutCode: finalLayoutCode };
}

export {
  searchSimplestValidPath,
  searchAllPossibleMatches,
  PathDirection,
} from "./twocorner/PathLogic";
