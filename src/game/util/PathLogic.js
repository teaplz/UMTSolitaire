/**
 * Check the simplest (i.e. least amount of segments) nikakudori path between
 * two tiles on the provided game board.
 *
 * This utilizes an iterative depth-first search approach, with special modifications
 * to account for the limited amount of line segments.
 *
 * @param {!number} firstTile The tile index to start from
 * @param {!number} secondTile The tile index to end up on
 * @param {!{{<id: number, char: number>}}[]} board The tiles
 * themselves, which should be (1 + boardWidth + 1) * (1 + boardHeight + 1)
 * to account for the edges.
 * @param {!number} boardWidth Width of the board, excluding the edges.
 * @param {!number} boardHeight Height of the board, excluding the edges.
 * @returns {?{{<segment: number[], dir: string>}}[]} An array of line segments
 * showing one of the simplest paths. Segments are list of tile indexes in order.
 * Dir can be the directions from the PathDirection enum.
 */
export function checkSimplestPath(
  firstTile,
  secondTile,
  board,
  boardWidth,
  boardHeight
) {
  if (firstTile === secondTile) return null;

  console.debug(
    `Checking path between tile ${firstTile} and tile ${secondTile}`
  );

  const boardWidthWithEdges = boardWidth + 2,
    boardHeightWithEdges = boardHeight + 2;

  let paths = [],
    simplestPath = null;

  const tileXdelta =
    (secondTile % boardWidthWithEdges) - (firstTile % boardWidthWithEdges);
  const tileYdelta =
    (secondTile -
      (secondTile % boardWidthWithEdges) -
      (firstTile - (firstTile % boardWidthWithEdges))) /
    boardWidthWithEdges;

  // Do not check opposite direction if in the same row or column.

  if (tileYdelta !== 0 || tileXdelta > 0) {
    paths.push([{ segment: [firstTile], dir: PathDirection.RIGHT }]);
  }

  if (tileYdelta !== 0 || tileXdelta < 0) {
    if (tileXdelta < 0)
      paths.push([{ segment: [firstTile], dir: PathDirection.LEFT }]);
    else paths.unshift([{ segment: [firstTile], dir: PathDirection.LEFT }]);
  }

  if (tileXdelta !== 0 || tileYdelta > 0) {
    if (tileYdelta >= 0)
      paths.push([{ segment: [firstTile], dir: PathDirection.DOWN }]);
    else paths.unshift([{ segment: [firstTile], dir: PathDirection.DOWN }]);
  }

  if (tileXdelta !== 0 || tileYdelta < 0) {
    if (tileYdelta < 0)
      paths.push([{ segment: [firstTile], dir: PathDirection.UP }]);
    else paths.push([{ segment: [firstTile], dir: PathDirection.UP }]);
  }

  while (paths.length > 0) {
    const path = paths.pop();

    console.debug(
      `Checking path: ${path.at(-1).segment} | ${path.at(-1).dir} | length: ${
        path.length
      } | queue: ${paths.length}`
    );

    // If we already found a three-line path, we shouldn't look for more
    // three-line paths.
    if (simplestPath !== null && path.length === 3) {
      continue;
    }

    const curSegment = path.at(-1);
    const lastTile = curSegment.segment.at(-1);
    let nextTile;

    switch (curSegment.dir) {
      case PathDirection.RIGHT:
        nextTile = board[lastTile + 1];

        // We found the path, or a simpler one!
        if (nextTile.id === secondTile) {
          curSegment.segment.push(nextTile.id);

          // If it is a one-line or two-line path, it's one of the
          // absolute shortest paths. We're done!
          if (path.length < 3) {
            return path;
          }

          simplestPath = path;
          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char !== null) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // On first and second segment, check U if second tile is above and
        // check D if the second tile is below.
        // On second segment, only check if on same column.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            secondTile % boardWidthWithEdges !==
              nextTile.id % boardWidthWithEdges
          )
        ) {
          if (
            secondTile - (secondTile % boardWidthWithEdges) <
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.UP });
            if (tileYdelta < 0) paths.push(newPath);
            else paths.unshift(newPath);
          } else if (
            secondTile - (secondTile % boardWidthWithEdges) >
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.DOWN });
            if (tileYdelta >= 0) paths.push(newPath);
            else paths.unshift(newPath);
          }
        }

        if (
          (path.length === 2 &&
            secondTile % boardWidthWithEdges <
              nextTile.id % boardWidthWithEdges) ||
          nextTile.id % boardWidthWithEdges === boardWidthWithEdges - 1
        ) {
          continue;
        }

        if (tileXdelta >= 0) paths.push(path);
        else paths.unshift(path);
        continue;
      case PathDirection.LEFT:
        nextTile = board[lastTile - 1];

        // We found the path, or a simpler one!
        if (nextTile.id === secondTile) {
          curSegment.segment.push(nextTile.id);

          // If it is a one-line or two-line path, it's one of the
          // absolute shortest paths. We're done!
          if (path.length < 3) {
            return path;
          }

          simplestPath = path;
          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char !== null) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // On first and second segment, check U if second tile is above and
        // check D if the second tile is below.
        // On second segment, only check if on same column.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            secondTile % boardWidthWithEdges !==
              nextTile.id % boardWidthWithEdges
          )
        ) {
          if (
            secondTile - (secondTile % boardWidthWithEdges) <
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.UP });
            if (tileYdelta < 0) paths.push(newPath);
            else paths.unshift(newPath);
          } else if (
            secondTile - (secondTile % boardWidthWithEdges) >
            nextTile.id - (nextTile.id % boardWidthWithEdges)
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.DOWN });
            if (tileYdelta >= 0) paths.push(newPath);
            else paths.unshift(newPath);
          }
        }

        if (
          (path.length === 2 &&
            secondTile % boardWidthWithEdges >
              nextTile.id % boardWidthWithEdges) ||
          nextTile.id % boardWidthWithEdges === 0
        ) {
          continue;
        }

        if (tileXdelta < 0) paths.push(path);
        else paths.unshift(path);
        continue;
      case PathDirection.DOWN:
        nextTile = board[lastTile + boardWidthWithEdges];

        // We found the path, or a simpler one!
        if (nextTile.id === secondTile) {
          curSegment.segment.push(nextTile.id);

          // If it is a one-line or two-line path, it's one of the
          // absolute shortest paths. We're done!
          if (path.length < 3) {
            return path;
          }

          simplestPath = path;
          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char !== null) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // On first and second segment, check L if second tile is left and
        // check R if the second tile is right.
        // On second segment, only check if on same row.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            secondTile - (secondTile % boardWidthWithEdges) !==
              nextTile.id - (nextTile.id % boardWidthWithEdges)
          )
        ) {
          if (
            secondTile % boardWidthWithEdges <
            nextTile.id % boardWidthWithEdges
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.LEFT });
            if (tileXdelta < 0) paths.push(newPath);
            else paths.unshift(newPath);
          } else if (
            secondTile % boardWidthWithEdges >
            nextTile.id % boardWidthWithEdges
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.RIGHT });
            if (tileXdelta >= 0) paths.push(newPath);
            else paths.unshift(newPath);
          }
        }

        if (
          (path.length === 2 &&
            secondTile - (secondTile % boardWidthWithEdges) <
              nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
          nextTile.id >= boardWidthWithEdges * (boardHeightWithEdges - 1)
        ) {
          continue;
        }

        if (tileYdelta >= 0) paths.push(path);
        else paths.unshift(path);
        continue;
      case PathDirection.UP:
        nextTile = board[lastTile - boardWidthWithEdges];

        // We found the path, or a simpler one!
        if (nextTile.id === secondTile) {
          curSegment.segment.push(nextTile.id);

          // If it is a one-line or two-line path, it's one of the
          // absolute shortest paths. We're done!
          if (path.length < 3) {
            return path;
          }

          simplestPath = path;
          continue;
        }

        // Obstruction in the path. Skip.
        if (nextTile.char !== null) {
          continue;
        }

        curSegment.segment.push(nextTile.id);

        // On first and second segment, check L if second tile is left and
        // check R if the second tile is right.
        // On second segment, only check if on same row.
        if (
          path.length < 3 &&
          !(
            path.length === 2 &&
            secondTile - (secondTile % boardWidthWithEdges) !==
              nextTile.id - (nextTile.id % boardWidthWithEdges)
          )
        ) {
          if (
            secondTile % boardWidthWithEdges <
            nextTile.id % boardWidthWithEdges
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.LEFT });
            if (tileXdelta < 0) paths.push(newPath);
            else paths.unshift(newPath);
          } else if (
            secondTile % boardWidthWithEdges >
            nextTile.id % boardWidthWithEdges
          ) {
            const newPath = path.map((i) => ({
              segment: [].concat(i.segment),
              dir: i.dir,
            }));
            newPath.push({ segment: [nextTile.id], dir: PathDirection.RIGHT });
            if (tileXdelta >= 0) paths.push(newPath);
            else paths.unshift(newPath);
          }
        }

        if (
          (path.length === 2 &&
            secondTile - (secondTile % boardWidthWithEdges) >
              nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
          nextTile.id < boardWidthWithEdges
        ) {
          continue;
        }

        if (tileYdelta < 0) paths.push(path);
        else paths.unshift(path);
        continue;
      default:
        break;
    }
  }

  console.debug("Simplest path in checkSimplestPath" + simplestPath);
  return simplestPath;
}

/**
 * Check all valid matches on the current game board.
 *
 * This utilizes an depth-first search approach, with special modifications
 * to account for the limited amount of line segments.
 *
 * @param {!{{<id: number, char: number>}}[]} board The tiles
 * themselves, which should be (1 + boardWidth + 1) * (1 + boardHeight + 1)
 * to account for the edges.
 * @param {!number} boardWidth Width of the board, excluding the edges.
 * @param {!number} boardHeight Height of the board, excluding the edges.
 * @returns {?number[][]} An array of valid matching tile ID pairs.
 */
export function checkAllPossibleMatches(board, boardWidth, boardHeight) {
  const boardWidthWithEdges = boardWidth + 2,
    boardHeightWithEdges = boardHeight + 2;

  let validMatches = [];

  console.debug(
    `Checking all possible matches for a board with dimensions ${boardWidth} x ${boardHeight}`
  );

  // Throw out a path for each valid tile.
  board.forEach((tile) => {
    // Ignore missing tiles.
    if (tile.char === null) return;

    // Check each tile for matches against later tiles. We've already checked
    // against earlier tiles in earlier checks.
    let uncheckedMatchingTiles = [];

    for (let i = tile.id + 1; i < board.length; i++) {
      if (board[i].char === tile.char) {
        uncheckedMatchingTiles.push(i);
      }
    }

    // No matches to check.
    if (uncheckedMatchingTiles.length === 0) return;

    console.debug(
      `Checking tile ${tile.id} with tiles ${uncheckedMatchingTiles}`
    );

    // Get the X and Y ranges to check. This prevents the pathing algorithm
    // from exploring areas it doesn't need to.
    let checkRangeX = [],
      checkRangeY = [];

    uncheckedMatchingTiles.forEach((tile) => {
      checkRangeX.push(tile % boardWidthWithEdges);
      checkRangeY.push(tile - (tile % boardWidthWithEdges));
    });

    if (uncheckedMatchingTiles.length > 1) {
      checkRangeX.sort((a, b) => a - b);
      checkRangeY.sort((a, b) => a - b);
    }

    // Starting paths.
    let paths = [];

    paths.push([{ segment: [tile.id], dir: PathDirection.RIGHT }]);
    paths.push([{ segment: [tile.id], dir: PathDirection.LEFT }]);
    paths.push([{ segment: [tile.id], dir: PathDirection.UP }]);
    paths.push([{ segment: [tile.id], dir: PathDirection.DOWN }]);

    while (paths.length > 0) {
      const path = paths.pop();

      const curSegment = path.at(-1);
      const lastTile = curSegment.segment.at(-1);
      let nextTile;

      switch (curSegment.dir) {
        case PathDirection.RIGHT:
          nextTile = board[lastTile + 1];

          // Did we find a path?
          if (uncheckedMatchingTiles.includes(nextTile.id)) {
            validMatches.push([tile.id, nextTile.id]);

            uncheckedMatchingTiles.splice(
              uncheckedMatchingTiles.indexOf(nextTile.id),
              1
            );

            if (uncheckedMatchingTiles.length === 0) break;

            // Generate new ranges to check
            uncheckedMatchingTiles.forEach((tile) => {
              checkRangeX.push(tile % boardWidthWithEdges);
              checkRangeY.push(tile - (tile % boardWidthWithEdges));
            });

            if (uncheckedMatchingTiles.length > 1) {
              checkRangeX.sort((a, b) => a - b);
              checkRangeY.sort((a, b) => a - b);
            }

            continue;
          }

          // Obstruction in the path. Skip.
          if (nextTile.char !== null) {
            continue;
          }

          curSegment.segment.push(nextTile.id);

          // Branch out to different segments if necessary.
          // On second segment, only check if on same column.
          if (
            path.length < 3 &&
            !(
              path.length === 2 &&
              !checkRangeX.includes(nextTile.id % boardWidthWithEdges)
            )
          ) {
            if (
              checkRangeY[0] <
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            ) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.UP });
              paths.push(newPath);
            }

            if (
              checkRangeY.at(-1) >
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            ) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.DOWN });
              paths.push(newPath);
            }
          }

          // Path is going too far away from the range or is nearing the edge
          // of the board.
          if (
            (path.length === 2 &&
              checkRangeX.at(-1) < nextTile.id % boardWidthWithEdges) ||
            nextTile.id % boardWidthWithEdges === boardWidthWithEdges - 1
          ) {
            continue;
          }

          paths.push(path);
          continue;
        case PathDirection.LEFT:
          nextTile = board[lastTile - 1];

          // Did we find a path?
          if (uncheckedMatchingTiles.includes(nextTile.id)) {
            validMatches.push([tile.id, nextTile.id]);

            uncheckedMatchingTiles.splice(
              uncheckedMatchingTiles.indexOf(nextTile.id),
              1
            );

            if (uncheckedMatchingTiles.length === 0) break;

            // Generate new ranges to check
            uncheckedMatchingTiles.forEach((tile) => {
              checkRangeX.push(tile % boardWidthWithEdges);
              checkRangeY.push(tile - (tile % boardWidthWithEdges));
            });

            if (uncheckedMatchingTiles.length > 1) {
              checkRangeX.sort((a, b) => a - b);
              checkRangeY.sort((a, b) => a - b);
            }

            continue;
          }

          // Obstruction in the path. Skip.
          if (nextTile.char !== null) {
            continue;
          }

          curSegment.segment.push(nextTile.id);

          // Branch out to different segments if necessary.
          // On second segment, only check if on same column.
          if (
            path.length < 3 &&
            !(
              path.length === 2 &&
              !checkRangeX.includes(nextTile.id % boardWidthWithEdges)
            )
          ) {
            if (
              checkRangeY[0] <
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            ) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.UP });
              paths.push(newPath);
            }

            if (
              checkRangeY.at(-1) >
              nextTile.id - (nextTile.id % boardWidthWithEdges)
            ) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.DOWN });
              paths.push(newPath);
            }
          }

          // Path is going too far away from the range or is nearing the edge
          // of the board.
          if (
            (path.length === 2 &&
              checkRangeX[0] > nextTile.id % boardWidthWithEdges) ||
            nextTile.id % boardWidthWithEdges === 0
          ) {
            continue;
          }

          paths.push(path);
          continue;
        case PathDirection.DOWN:
          nextTile = board[lastTile + boardWidthWithEdges];

          // Did we find a path?
          if (uncheckedMatchingTiles.includes(nextTile.id)) {
            validMatches.push([tile.id, nextTile.id]);

            uncheckedMatchingTiles.splice(
              uncheckedMatchingTiles.indexOf(nextTile.id),
              1
            );

            if (uncheckedMatchingTiles.length === 0) break;

            // Generate new ranges to check
            uncheckedMatchingTiles.forEach((tile) => {
              checkRangeX.push(tile % boardWidthWithEdges);
              checkRangeY.push(tile - (tile % boardWidthWithEdges));
            });

            if (uncheckedMatchingTiles.length > 1) {
              checkRangeX.sort((a, b) => a - b);
              checkRangeY.sort((a, b) => a - b);
            }

            continue;
          }

          // Obstruction in the path. Skip.
          if (nextTile.char !== null) {
            continue;
          }

          curSegment.segment.push(nextTile.id);

          // Branch out to different segments if necessary.
          // On second segment, only check if on same row.
          if (
            path.length < 3 &&
            !(
              path.length === 2 &&
              !checkRangeY.includes(
                nextTile.id - (nextTile.id % boardWidthWithEdges)
              )
            )
          ) {
            if (checkRangeX[0] < nextTile.id % boardWidthWithEdges) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.LEFT });
              paths.push(newPath);
            }

            if (checkRangeX.at(-1) > nextTile.id % boardWidthWithEdges) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({
                segment: [nextTile.id],
                dir: PathDirection.RIGHT,
              });
              paths.push(newPath);
            }
          }

          // Path is going too far away from the range or is nearing the edge
          // of the board.
          if (
            (path.length === 2 &&
              checkRangeY.at(-1) <
                nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
            nextTile.id >= boardWidthWithEdges * (boardHeightWithEdges - 1)
          ) {
            continue;
          }

          paths.push(path);
          continue;
        case PathDirection.UP:
          nextTile = board[lastTile - boardWidthWithEdges];

          // Did we find a path?
          if (uncheckedMatchingTiles.includes(nextTile.id)) {
            validMatches.push([tile.id, nextTile.id]);

            uncheckedMatchingTiles.splice(
              uncheckedMatchingTiles.indexOf(nextTile.id),
              1
            );

            if (uncheckedMatchingTiles.length === 0) break;

            // Generate new ranges to check
            uncheckedMatchingTiles.forEach((tile) => {
              checkRangeX.push(tile % boardWidthWithEdges);
              checkRangeY.push(tile - (tile % boardWidthWithEdges));
            });

            if (uncheckedMatchingTiles.length > 1) {
              checkRangeX.sort((a, b) => a - b);
              checkRangeY.sort((a, b) => a - b);
            }

            continue;
          }

          // Obstruction in the path. Skip.
          if (nextTile.char !== null) {
            continue;
          }

          curSegment.segment.push(nextTile.id);

          // Branch out to different segments if necessary.
          // On second segment, only check if on same row.
          if (
            path.length < 3 &&
            !(
              path.length === 2 &&
              !checkRangeY.includes(
                nextTile.id - (nextTile.id % boardWidthWithEdges)
              )
            )
          ) {
            if (checkRangeX[0] < nextTile.id % boardWidthWithEdges) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({ segment: [nextTile.id], dir: PathDirection.LEFT });
              paths.push(newPath);
            }

            if (checkRangeX.at(-1) > nextTile.id % boardWidthWithEdges) {
              const newPath = path.map((i) => ({
                segment: [].concat(i.segment),
                dir: i.dir,
              }));
              newPath.push({
                segment: [nextTile.id],
                dir: PathDirection.RIGHT,
              });
              paths.push(newPath);
            }
          }

          // Path is going too far away from the range or is nearing the edge
          // of the board.
          if (
            (path.length === 2 &&
              checkRangeY[0] >
                nextTile.id - (nextTile.id % boardWidthWithEdges)) ||
            nextTile.id < boardWidthWithEdges
          ) {
            continue;
          }

          paths.push(path);
          continue;
        default:
          break;
      }
    }
  });

  return validMatches;
}

export const PathDirection = {
  UP: "U",
  DOWN: "D",
  LEFT: "L",
  RIGHT: "R",
};
