import { useState, useEffect } from "react";

import {
  layoutCodeVersionNumber,
  layoutCodeRadix,
  layoutCodeRadixBits,
  decodeLayoutCode,
} from "../logic/twocorner/BoardGenerator";

import { GameTypes } from "../util/GameTypes";

import "./LayoutEditModalBody.css";

const LayoutEditModalBody = ({ initialLayout, startNewGame, backModal }) => {
  const maxHeight = 12,
    maxWidth = 20;

  const numTileTypes = 2;
  const tileColors = ["black", "goldenrod"];

  const [layout, setLayout] = useState([]);
  const [layoutCode, setLayoutCode] = useState(null);
  const [numTiles, setNumTiles] = useState(0);

  useEffect(() => {
    if (initialLayout != null) {
      try {
        const decodedLayoutObj = decodeLayoutCode(initialLayout);

        const layoutStartX = (maxWidth - decodedLayoutObj.width) >> 1,
          layoutStartY = (maxHeight - decodedLayoutObj.height) >> 1,
          layoutStart = layoutStartY * maxWidth,
          layoutEnd = layoutStart + decodedLayoutObj.height * maxWidth;

        let layoutCursor = 0;

        setLayout(
          Array.from({ length: maxHeight * maxWidth }, (_, i) => {
            if (
              i < layoutStart ||
              i >= layoutEnd ||
              i % maxWidth < layoutStartX ||
              i % maxWidth >= layoutStartX + decodedLayoutObj.width
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
    setLayout(Array.from({ length: maxHeight * maxWidth }, () => 0));
  };

  // Toggle the chosen tile type.
  const toggleTile = (id) => {
    const updatedLayout = layout.slice();

    updatedLayout[id] = (updatedLayout[id] + 1) % numTileTypes;

    setLayout(updatedLayout);
  };

  // Generate the layout code from the current layout.
  const generateLayoutCode = () => {
    let code = GameTypes.TWOCORNER.toString(16).padStart(2, "0");
    code += layoutCodeVersionNumber.toString(16).padStart(2, "0");

    let margins = [0, maxWidth, 0, maxHeight];

    // Left
    let marginPoint = false;

    for (let x = 0; x < maxWidth; x++) {
      for (let y = 0; y < maxHeight; y++) {
        if (layout[y * maxWidth + x] !== 0) {
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

    for (let x = maxWidth - 1; x >= 0; x--) {
      for (let y = 0; y < maxHeight; y++) {
        if (layout[y * maxWidth + x] !== 0) {
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

    for (let y = 0; y < maxHeight; y++) {
      for (let x = 0; x < maxWidth; x++) {
        if (layout[y * maxWidth + x] !== 0) {
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

    for (let y = maxHeight - 1; y >= 0; y--) {
      for (let x = 0; x < maxWidth; x++) {
        if (layout[y * maxWidth + x] !== 0) {
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

    code += width.toString(layoutCodeRadix).slice(0, 1);
    code += height.toString(layoutCodeRadix).slice(0, 1);

    const digitsPerLine = Math.ceil((width + 1) / layoutCodeRadixBits);

    for (let y = margins[2]; y < margins[3]; y++) {
      let lineMask = "1";

      for (let x = margins[0]; x < margins[1]; x++) {
        if (layout[y * maxWidth + x] === 1) lineMask += "1";
        else lineMask += "0";
      }

      code += parseInt(
        lineMask.padEnd(digitsPerLine * layoutCodeRadixBits, "0"),
        2
      ).toString(layoutCodeRadix);
    }

    setLayoutCode(code);
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
    return Array.from({ length: maxHeight }, (_, y) => (
      <div className="row" key={"layoutEditorRow-" + y}>
        {Array.from({ length: maxWidth }, (_, x) => (
          <span
            className="cell"
            key={"layoutEditorCell-" + y * maxWidth + x}
            style={{
              backgroundColor: tileColors[layout[y * maxWidth + x]],
            }}
            onClick={() => toggleTile(y * maxWidth + x)}
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
