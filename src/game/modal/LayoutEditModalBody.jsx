import { useState, useEffect } from "react";

import * as TwoCornerGameType from "../logic/TwoCornerGameType";
import * as BoardLayoutGenerator from "../logic/twocorner/BoardLayoutGenerator";

import { GameTypes } from "../util/GameTypes";

import "./LayoutEditModalBody.css";

const LayoutEditModalBody = ({ initialLayout, startNewGame, backModal }) => {
  const numTileTypes = 2;
  const tileColors = ["black", "goldenrod"];
  const tileString = ["Empty", "Tile"];

  const [layout, setLayout] = useState([]);
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

  useEffect(() => {
    if (initialLayout != null) {
      try {
        const decodedLayoutObj =
          BoardLayoutGenerator.generateBoardLayout(initialLayout);

        const layoutStartX = (editorWidth - decodedLayoutObj.width) >> 1,
          layoutStartY = (editorHeight - decodedLayoutObj.height) >> 1,
          layoutStart = layoutStartY * editorWidth,
          layoutEnd = layoutStart + decodedLayoutObj.height * editorWidth;

        let layoutCursor = 0;

        setLayout(
          Array.from(
            {
              length: editorHeight * editorWidth,
            },
            (_, i) => {
              if (
                i < layoutStart ||
                i >= layoutEnd ||
                i % editorWidth < layoutStartX ||
                i % editorWidth >= layoutStartX + decodedLayoutObj.width
              ) {
                return 0;
              } else {
                return parseInt(
                  decodedLayoutObj.layoutMask[layoutCursor++],
                  10
                );
              }
            }
          )
        );
      } catch (e) {
        console.log(e.message);
        resetEditor();
      }
    } else {
      resetEditor();
    }
  }, []);

  // Reset to the default board.
  const resetEditor = () => {
    setLayout(
      Array.from(
        {
          length: editorHeight * editorWidth,
        },
        () => 0
      )
    );
  };

  // Generate the layout code from the current layout.
  const generateLayoutCode = () => {
    let margins = [0, editorWidth, 0, editorHeight];

    // Left
    let marginPoint = false;

    for (let x = 0; x < editorWidth; x++) {
      for (let y = 0; y < editorHeight; y++) {
        if (layout[y * editorWidth + x] !== 0) {
          marginPoint = true;
          break;
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
        if (layout[y * editorWidth + x] !== 0) {
          marginPoint = true;
          break;
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
        if (layout[y * editorWidth + x] !== 0) {
          marginPoint = true;
          break;
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
        if (layout[y * editorWidth + x] !== 0) {
          marginPoint = true;
          break;
        }
      }
      if (marginPoint) {
        margins[3] = y + 1;
        break;
      }
    }

    const width = margins[1] - margins[0],
      height = margins[3] - margins[2];

    let layoutMask = "";

    for (let y = margins[2]; y < margins[3]; y++) {
      for (let x = margins[0]; x < margins[1]; x++) {
        layoutMask += layout[y * editorWidth + x];
      }
    }

    setLayoutCode(
      BoardLayoutGenerator.generateLayoutCode({
        layoutMask,
        width,
        height,
      })
    );
  };

  useEffect(() => {
    setNumTiles(
      layout.reduce((acc, val) => {
        return acc + (val === 1 ? 1 : 0);
      }, 0)
    );

    generateLayoutCode();
  }, [layout]);

  const paintTile = (id, force) => {
    if (!isDrawing && !force) return;

    if (layout[id] !== editorPaintState) {
      const updatedLayout = layout.slice();

      updatedLayout[id] = editorPaintState;

      setLayout(updatedLayout);
    }
  };

  // Render the layout.
  const renderLayout = () => {
    return (
      <div
        className="layoutEditor"
        onPointerDown={() => setIsDrawing(true)}
        onPointerUp={() => setIsDrawing(false)}
      >
        {Array.from({ length: editorHeight }, (_, y) => (
          <div className="row" key={y}>
            {Array.from({ length: editorWidth }, (_, x) => (
              <span
                className="cell"
                key={y * editorWidth + x}
                style={{
                  backgroundColor: tileColors[layout[y * editorWidth + x]],
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
          <button onClick={() => setEditorPaintState(i)} key={i}>
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
      <div>Layout Code: {layoutCode}</div>
      <div>Number of Tiles: {numTiles}</div>
      <div>
        <button onClick={resetEditor}>Reset Editor</button>
      </div>
      <div>
        <button
          onClick={() =>
            startNewGame({
              newLayoutCode: layoutCode,
              newGameType: GameTypes.TWOCORNER,
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
