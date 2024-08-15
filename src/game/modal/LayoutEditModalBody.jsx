import { useState, useEffect } from "react";

import {
  MAX_BOARD_HEIGHT,
  MAX_BOARD_WIDTH,
} from "../logic/twocorner/BoardLayoutGenerator";

import * as BoardLayoutGenerator from "../logic/twocorner/BoardLayoutGenerator";

import { GameTypes } from "../util/GameTypes";

import "./LayoutEditModalBody.css";

const LayoutEditModalBody = ({ initialLayout, startNewGame, backModal }) => {
  const numTileTypes = 2;
  const tileColors = ["black", "goldenrod"];

  const [layout, setLayout] = useState([]);
  const [layoutCode, setLayoutCode] = useState(null);
  const [numTiles, setNumTiles] = useState(0);

  useEffect(() => {
    if (initialLayout != null) {
      try {
        const decodedLayoutObj =
          BoardLayoutGenerator.generateBoardLayout(initialLayout);

        const layoutStartX = (MAX_BOARD_WIDTH - decodedLayoutObj.width) >> 1,
          layoutStartY = (MAX_BOARD_HEIGHT - decodedLayoutObj.height) >> 1,
          layoutStart = layoutStartY * MAX_BOARD_WIDTH,
          layoutEnd = layoutStart + decodedLayoutObj.height * MAX_BOARD_WIDTH;

        let layoutCursor = 0;

        setLayout(
          Array.from({ length: MAX_BOARD_HEIGHT * MAX_BOARD_WIDTH }, (_, i) => {
            if (
              i < layoutStart ||
              i >= layoutEnd ||
              i % MAX_BOARD_WIDTH < layoutStartX ||
              i % MAX_BOARD_WIDTH >= layoutStartX + decodedLayoutObj.width
            ) {
              return 0;
            } else {
              return parseInt(decodedLayoutObj.layoutMask[layoutCursor++], 10);
            }
          })
        );
      } catch (ex) {
        console.log(ex);
        resetEditor();
      }
    } else {
      resetEditor();
    }
  }, []);

  // Reset to the default board.
  const resetEditor = () => {
    setLayout(
      Array.from({ length: MAX_BOARD_HEIGHT * MAX_BOARD_WIDTH }, () => 0)
    );
  };

  // Toggle the chosen tile type.
  const toggleTile = (id) => {
    const updatedLayout = layout.slice();

    updatedLayout[id] = (updatedLayout[id] + 1) % numTileTypes;

    setLayout(updatedLayout);
  };

  // Generate the layout code from the current layout.
  const generateLayoutCode = () => {
    let margins = [0, MAX_BOARD_WIDTH, 0, MAX_BOARD_HEIGHT];

    // Left
    let marginPoint = false;

    for (let x = 0; x < MAX_BOARD_WIDTH; x++) {
      for (let y = 0; y < MAX_BOARD_HEIGHT; y++) {
        if (layout[y * MAX_BOARD_WIDTH + x] !== 0) {
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

    for (let x = MAX_BOARD_WIDTH - 1; x >= 0; x--) {
      for (let y = 0; y < MAX_BOARD_HEIGHT; y++) {
        if (layout[y * MAX_BOARD_WIDTH + x] !== 0) {
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

    for (let y = 0; y < MAX_BOARD_HEIGHT; y++) {
      for (let x = 0; x < MAX_BOARD_WIDTH; x++) {
        if (layout[y * MAX_BOARD_WIDTH + x] !== 0) {
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

    for (let y = MAX_BOARD_HEIGHT - 1; y >= 0; y--) {
      for (let x = 0; x < MAX_BOARD_WIDTH; x++) {
        if (layout[y * MAX_BOARD_WIDTH + x] !== 0) {
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
        layoutMask += layout[y * MAX_BOARD_WIDTH + x];
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

  // Render the layout.
  const renderLayout = () => {
    return Array.from({ length: MAX_BOARD_HEIGHT }, (_, y) => (
      <div className="row" key={"layoutEditorRow-" + y}>
        {Array.from({ length: MAX_BOARD_WIDTH }, (_, x) => (
          <span
            className="cell"
            key={"layoutEditorCell-" + y * MAX_BOARD_WIDTH + x}
            style={{
              backgroundColor: tileColors[layout[y * MAX_BOARD_WIDTH + x]],
            }}
            onClick={() => toggleTile(y * MAX_BOARD_WIDTH + x)}
          ></span>
        ))}
      </div>
    ));
  };

  return (
    <div>
      <h1>Puzzle Layout Edit</h1>
      <div className="layoutEditor">{renderLayout()}</div>
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
