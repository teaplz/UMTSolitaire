import * as BoardGenerator from "./twocorner/BoardGenerator";
import * as BoardLayoutGenerator from "./twocorner/BoardLayoutGenerator";

export function generateBoard({
  layoutCode,
  boardWidth,
  boardHeight,
  seed,
  useBlindShuffle = false,
  allowSinglePairs = false,
}) {
  let generatedBoard, finalLayoutCode;

  try {
    // Generate the board based on the provided layout code or from a basic rectangular board based on the provided width and
    // height.
    finalLayoutCode =
      layoutCode != null
        ? layoutCode
        : BoardLayoutGenerator.generateLayoutCode({
            width: boardWidth,
            height: boardHeight,
          });

    console.log(
      "Attempting to create board using layout code: " + finalLayoutCode
    );

    generatedBoard = useBlindShuffle
      ? BoardGenerator.generateBoardWithSimpleShuffle({
          ...BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          allowSinglePairs,
        })
      : BoardGenerator.generateBoardWithPresolvedShuffle({
          ...BoardLayoutGenerator.generateBoardLayout(finalLayoutCode),
          seed,
          allowSinglePairs,
        });
  } catch (e) {
    console.error(e.message);
    console.error("Invalid generated board, switching to default 17x8 board.");

    finalLayoutCode = BoardLayoutGenerator.generateLayoutCode({
      width: 17,
      height: 8,
    });

    console.log(
      "Attempting to create board using layout code: " + finalLayoutCode
    );

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
