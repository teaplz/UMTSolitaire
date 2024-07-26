import {
  generateBoardWithSimpleShuffle,
  generateBoardWithPresolvedShuffle,
  generateRectangularBoardWithSimpleShuffle,
  generateRectangularBoardWithPresolvedShuffle,
} from "./twocorner/BoardGenerator";

export function generateBoard({
  layoutCode,
  boardWidth,
  boardHeight,
  seed,
  useBlindShuffle = false,
  allowSinglePairs = false,
} = {}) {
  let generatedBoard;

  if (layoutCode != null) {
    // Generate the board based on the provided layout code. Fallback to the
    // default board if it fails.

    if (useBlindShuffle) {
      generatedBoard = generateBoardWithSimpleShuffle(
        seed,
        layoutCode,
        allowSinglePairs
      );
    } else {
      generatedBoard = generateBoardWithPresolvedShuffle(
        seed,
        layoutCode,
        allowSinglePairs
      );
    }

    if (generatedBoard === null) {
      console.error(
        "Invalid generated board, switching to default 17x8 board."
      );

      generatedBoard = generateRectangularBoardWithPresolvedShuffle(
        null,
        17,
        8
      );
    }
  } else {
    // Generate a basic rectangular board based on the provided width and
    // height.

    if (useBlindShuffle) {
      generatedBoard = generateRectangularBoardWithSimpleShuffle(
        seed,
        boardWidth,
        boardHeight,
        allowSinglePairs
      );
    } else {
      generatedBoard = generateRectangularBoardWithPresolvedShuffle(
        seed,
        boardWidth,
        boardHeight,
        allowSinglePairs
      );
    }
  }

  return generatedBoard;
}

export {
  searchSimplestValidPath,
  searchAllPossibleMatches,
  PathDirection
} from "./twocorner/PathLogic";
