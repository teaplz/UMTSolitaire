import { useState, useEffect } from "react";

import * as TraditionalGameType from "../logic/TraditionalGameType";
import * as TwoCornerGameType from "../logic/TwoCornerGameType";

import { GameTypeLayoutCodeIDs, GameTypes } from "../util/GameTypes";

import "./LayoutEditModalBody.css";

const LayoutEditModalBody = ({ initialLayout, startNewGame, backModal }) => {
  const numTileTypes = 2;
  const tileColors = ["black", "goldenrod"];
  const tileUnderLayerColors = ["black", "#6a5110"]; // -25% lum
  const tileString = ["Empty", "Tile"];

  const [layout, setLayout] = useState([]);
  const [curLayer, setCurLayer] = useState(0);
  const [layoutCode, setLayoutCode] = useState(null);
  const [numTiles, setNumTiles] = useState(0);

  const [editorGameType, setEditorGameType] = useState(GameTypes.TWOCORNER);
  const [editorWidth, setEditorWidth] = useState(
    TwoCornerGameType.MAX_BOARD_WIDTH
  );
  const [editorHeight, setEditorHeight] = useState(
    TwoCornerGameType.MAX_BOARD_HEIGHT
  );
  const [editorLayers, setEditorLayers] = useState(1);

  const [isDrawing, setIsDrawing] = useState(false);
  const [editorPaintState, setEditorPaintState] = useState(1);

  // Generate the initial layout when entering the modal.
  useEffect(() => {
    if (initialLayout != null) {
      try {
        // Determine which gametype is being used based on the layout code and
        // adjust the board accordingly.
        const useGameType = Object.keys(GameTypeLayoutCodeIDs).find(
          (key) => GameTypeLayoutCodeIDs[key] === initialLayout?.slice(0, 3)
        );

        if (useGameType === GameTypes.TRADITIONAL) {
          // Get the layout object from the layout code.
          const decodedLayoutObj =
            TraditionalGameType.BoardLayoutGenerator.generateBoardLayout(
              initialLayout
            );

          setEditorGameType(useGameType);
          setEditorWidth(TraditionalGameType.MAX_BOARD_WIDTH);
          setEditorHeight(TraditionalGameType.MAX_BOARD_HEIGHT);
          setEditorLayers(TraditionalGameType.MAX_BOARD_DEPTH);

          // Initialize all layers to 0.
          let baseLayout = Array.from(
            {
              length: TraditionalGameType.MAX_BOARD_DEPTH,
            },
            () =>
              Array.from(
                {
                  length:
                    TraditionalGameType.MAX_BOARD_HEIGHT *
                    TraditionalGameType.MAX_BOARD_WIDTH,
                },
                () => 0
              )
          );

          // Position the layout to the editor grid's center.
          const layoutStart =
            ((TraditionalGameType.MAX_BOARD_HEIGHT - decodedLayoutObj.height) >>
              1) *
              TraditionalGameType.MAX_BOARD_WIDTH +
            ((TraditionalGameType.MAX_BOARD_WIDTH - decodedLayoutObj.width) >>
              1);

          // Run through the layout and change to 1 when appropriate.
          decodedLayoutObj.tiles?.forEach((coord, i) => {
            coord?.forEach((t, h) => {
              if (t !== null && h < TraditionalGameType.MAX_BOARD_DEPTH) {
                baseLayout[h][
                  layoutStart +
                    i +
                    Math.floor(i / decodedLayoutObj.width) *
                      (TraditionalGameType.MAX_BOARD_WIDTH -
                        decodedLayoutObj.width)
                ] = 1;
              }
            });
          });

          setLayout(baseLayout);
        } else if (useGameType === GameTypes.TWOCORNER) {
          // Get the layout object from the layout code.
          const decodedLayoutObj =
            TwoCornerGameType.BoardLayoutGenerator.generateBoardLayout(
              initialLayout
            );

          setEditorGameType(useGameType);
          setEditorWidth(TwoCornerGameType.MAX_BOARD_WIDTH);
          setEditorHeight(TwoCornerGameType.MAX_BOARD_HEIGHT);
          setEditorLayers(1);

          // Position the layout to the editor grid's center.
          const layoutStartX =
              (TwoCornerGameType.MAX_BOARD_WIDTH - decodedLayoutObj.width) >> 1,
            layoutStartY =
              (TwoCornerGameType.MAX_BOARD_HEIGHT - decodedLayoutObj.height) >>
              1,
            layoutStart = layoutStartY * TwoCornerGameType.MAX_BOARD_WIDTH,
            layoutEnd =
              layoutStart +
              decodedLayoutObj.height * TwoCornerGameType.MAX_BOARD_WIDTH;

          let layoutCursor = 0;

          // Map the layout mask to the editor grid.
          setLayout([
            Array.from(
              {
                length:
                  TwoCornerGameType.MAX_BOARD_HEIGHT *
                  TwoCornerGameType.MAX_BOARD_WIDTH,
              },
              (_, i) => {
                if (
                  i < layoutStart ||
                  i >= layoutEnd ||
                  i % TwoCornerGameType.MAX_BOARD_WIDTH < layoutStartX ||
                  i % TwoCornerGameType.MAX_BOARD_WIDTH >=
                    layoutStartX + decodedLayoutObj.width
                ) {
                  return 0;
                } else {
                  return parseInt(decodedLayoutObj.layoutMask[layoutCursor++]);
                }
              }
            ),
          ]);
        } else {
          throw new Error("Invalid layout code for editor. Resetting board.");
        }
      } catch (e) {
        console.error(e.message);
        resetEditor();
      }
    } else {
      resetEditor();
    }
  }, []);

  // Reset to the default board.
  const resetEditor = (gameType = GameTypes.TRADITIONAL) => {
    let newWidth,
      newHeight,
      newDepth,
      newGameType = gameType;

    if (newGameType === GameTypes.TRADITIONAL) {
      newWidth = TraditionalGameType.MAX_BOARD_WIDTH;
      newHeight = TraditionalGameType.MAX_BOARD_HEIGHT;
      newDepth = TraditionalGameType.MAX_BOARD_DEPTH;
    } else if (newGameType === GameTypes.TWOCORNER) {
      newWidth = TwoCornerGameType.MAX_BOARD_WIDTH;
      newHeight = TwoCornerGameType.MAX_BOARD_HEIGHT;
      newDepth = 1;
    } else {
      console.error("Invalid gametype selection! Resetting to Traditional.");
      newGameType = GameTypes.TRADITIONAL;
      newWidth = TraditionalGameType.MAX_BOARD_WIDTH;
      newHeight = TraditionalGameType.MAX_BOARD_HEIGHT;
      newDepth = TraditionalGameType.MAX_BOARD_DEPTH;
    }

    setEditorWidth(newWidth);
    setEditorHeight(newHeight);
    setEditorLayers(newDepth);
    setEditorGameType(newGameType);
    setCurLayer(0);
    setLayout(
      Array.from(
        {
          length: newDepth,
        },
        () =>
          Array.from(
            {
              length: newHeight * newWidth,
            },
            () => 0
          )
      )
    );
  };

  // Generate the layout code from the current layout.
  const generateLayoutCode = () => {
    if (layout.length === 0) return;

    let margins = [0, editorWidth, 0, editorHeight];

    // Left
    let marginPoint = false;

    for (let x = 0; x < editorWidth; x++) {
      for (let y = 0; y < editorHeight; y++) {
        for (let z = 0; z < editorLayers; z++) {
          if (layout[z][y * editorWidth + x] !== 0) {
            marginPoint = true;
            break;
          }
        }
      }
      if (marginPoint) {
        margins[0] = x;
        break;
      }
    }

    // Right
    marginPoint = false;

    for (let x = editorWidth - 1; x >= 0; x--) {
      for (let y = 0; y < editorHeight; y++) {
        for (let z = 0; z < editorLayers; z++) {
          if (layout[z][y * editorWidth + x] !== 0) {
            marginPoint = true;
            break;
          }
        }
      }
      if (marginPoint) {
        margins[1] = x + 1;
        break;
      }
    }

    // Top
    marginPoint = false;

    for (let y = 0; y < editorHeight; y++) {
      for (let x = 0; x < editorWidth; x++) {
        for (let z = 0; z < editorLayers; z++) {
          if (layout[z][y * editorWidth + x] !== 0) {
            marginPoint = true;
            break;
          }
        }
      }
      if (marginPoint) {
        margins[2] = y;
        break;
      }
    }

    // Bottom
    marginPoint = false;

    for (let y = editorHeight - 1; y >= 0; y--) {
      for (let x = 0; x < editorWidth; x++) {
        for (let z = 0; z < editorLayers; z++) {
          if (layout[z][y * editorWidth + x] !== 0) {
            marginPoint = true;
            break;
          }
        }
      }
      if (marginPoint) {
        margins[3] = y + 1;
        break;
      }
    }

    const width = margins[1] - margins[0],
      height = margins[3] - margins[2];

    if (editorGameType === GameTypes.TRADITIONAL) {
      let layoutStructure = [];

      for (let y = margins[2]; y < margins[3]; y++) {
        for (let x = margins[0]; x < margins[1]; x++) {
          let coord = [];
          for (let z = 0; z < editorLayers; z++) {
            if (layout[z][y * editorWidth + x] === 1) {
              coord.push({});
            } else {
              coord.push(null);
            }
          }
          let coordHeight = 0;

          coord.forEach((t, i) => {
            if (t !== null) coordHeight = i + 1;
          });
          layoutStructure.push(coord.slice(0, coordHeight));
        }
      }

      setLayoutCode(
        TraditionalGameType.BoardLayoutGenerator.generateLayoutCode({
          tiles: layoutStructure,
          width,
          height,
        })
      );
    } else if (editorGameType === GameTypes.TWOCORNER) {
      let layoutMask = "";

      for (let y = margins[2]; y < margins[3]; y++) {
        for (let x = margins[0]; x < margins[1]; x++) {
          layoutMask += layout[0][y * editorWidth + x];
        }
      }

      setLayoutCode(
        TwoCornerGameType.BoardLayoutGenerator.generateLayoutCode({
          layoutMask,
          width,
          height,
        })
      );
    } else {
      console.error("Invalid gametype in layout editor.");
    }
  };

  useEffect(() => {
    setNumTiles(
      layout.reduce((acc, layer) => {
        return (
          acc +
          layer.reduce((acc, val) => {
            return acc + (val === 1 ? 1 : 0);
          }, 0)
        );
      }, 0)
    );

    generateLayoutCode();
  }, [layout]);

  const paintTile = (id, force) => {
    if (!isDrawing && !force) return;

    if (layout[curLayer][id] !== editorPaintState) {
      const updatedLayout = layout.slice();

      updatedLayout[curLayer][id] = editorPaintState;

      setLayout(updatedLayout);
    }
  };

  // Render the layout.
  const renderLayout = () => {
    if (layout.length === 0) return;

    return (
      <div
        className="layoutEditor"
        onPointerDown={() => setIsDrawing(true)}
        onPointerUp={() => setIsDrawing(false)}
        onPointerLeave={() => setIsDrawing(false)}
      >
        {Array.from({ length: editorHeight }, (_, y) => (
          <div className="row" key={y}>
            {Array.from({ length: editorWidth }, (_, x) => (
              <span
                className="cell"
                key={y * editorWidth + x}
                style={{
                  backgroundColor:
                    curLayer > 0 && layout[curLayer][y * editorWidth + x] === 0
                      ? tileUnderLayerColors[
                          layout[curLayer - 1][y * editorWidth + x]
                        ]
                      : tileColors[layout[curLayer][y * editorWidth + x]],
                }}
                onPointerEnter={() => paintTile(y * editorWidth + x, false)}
                onPointerDown={() => paintTile(y * editorWidth + x, true)}
              ></span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderLayoutPalette = () => {
    return (
      <div className="layoutPalette">
        <span
          className="cell"
          style={{
            backgroundColor: tileColors[editorPaintState],
          }}
        ></span>
        {Array.from({ length: numTileTypes }, (_, i) => (
          <button
            onClick={() => setEditorPaintState(i)}
            key={i}
            disabled={editorPaintState === i}
          >
            {tileString[i]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1>Puzzle Layout Edit</h1>
      {renderLayout()}
      {renderLayoutPalette()}
      <div>
        <button
          onClick={() => setCurLayer(curLayer + 1)}
          disabled={curLayer >= editorLayers - 1}
        >
          Higher Layer
        </button>
        Layer {curLayer + 1}
        <button
          onClick={() => setCurLayer(curLayer - 1)}
          disabled={curLayer <= 0}
        >
          Lower Layer
        </button>
      </div>
      <div>Number of Tiles: {numTiles}</div>
      <div>
        <button onClick={() => resetEditor(GameTypes.TRADITIONAL)}>
          Reset Editor with Traditional Mode
        </button>
        <button onClick={() => resetEditor(GameTypes.TWOCORNER)}>
          Reset Editor with Two-Corner Mode
        </button>
      </div>
      <div>
        <button
          onClick={() =>
            startNewGame({
              newLayoutCode: layoutCode,
              newGameType: editorGameType,
            })
          }
        >
          Play With Layout
        </button>
      </div>
      <div>
        <button onClick={backModal}>Cancel</button>
      </div>
    </div>
  );
};

export default LayoutEditModalBody;
