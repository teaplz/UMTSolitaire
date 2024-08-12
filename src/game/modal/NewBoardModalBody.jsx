import React, { useState } from "react";
import { GameTypes } from "../util/GameTypes";

const NewBoardModalBody = ({
  prevWidth,
  prevHeight,
  prevBlindShuffle,
  prevAllowSinglePairs,
  prevSeed,
  layoutCode,
  handleResetBoard,
  backModal,
}) => {
  const [boardWidth, setBoardWidth] = useState(prevWidth);
  const [boardHeight, setBoardHeight] = useState(prevHeight);
  const [customWidth, setCustomWidth] = useState(prevWidth);
  const [customHeight, setCustomHeight] = useState(prevHeight);

  const DifficultySettingsBits = {
    USE_HARD_SHUFFLE: 1,
    ALLOW_SINGLE_PAIRS: 2,
  };

  const [difficulty, setDifficulty] = useState(
    (prevBlindShuffle != null && prevBlindShuffle
      ? DifficultySettingsBits.USE_HARD_SHUFFLE
      : 0) +
      (prevAllowSinglePairs != null && prevAllowSinglePairs
        ? DifficultySettingsBits.ALLOW_SINGLE_PAIRS
        : 0)
  );

  const [seed, setSeed] = useState(prevSeed);

  const [newLayoutCode, setNewLayoutCode] = useState(layoutCode);

  const [useSimpleBoard, setUseSimpleBoard] = useState(true);

  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [useCustomSize, setUseCustomSize] = useState(false);

  return (
    <div>
      <h1>Start New Board</h1>
      <div>
        <h2>Board Layout</h2>
        <div>
          <input
            type="radio"
            name="layoutType"
            id="layoutTypeSimple"
            value="simple"
            onChange={() => {
              setUseSimpleBoard(true);
            }}
            checked={useSimpleBoard}
          ></input>
          <label htmlFor="layoutTypeSimple">Simple Board</label>
        </div>
        <div>
          <input
            type="radio"
            name="layoutType"
            id="layoutTypeCustom"
            value="custom"
            onChange={() => {
              setUseSimpleBoard(false);
            }}
            checked={!useSimpleBoard}
          ></input>
          <label htmlFor="layoutTypeCustom">Use Custom Layout Code</label>
        </div>
      </div>
      <div style={{ paddingTop: "1em" }}>
        {useSimpleBoard && (
          <>
            <div>
              <input
                type="radio"
                name="size"
                id="sizeShort"
                value="short"
                onChange={() => {
                  setBoardWidth(8);
                  setBoardHeight(5);
                  setUseCustomSize(false);
                }}
              ></input>
              <label htmlFor="sizeShort">Short (8&#x2a2f;5)</label>
            </div>
            <div>
              <input
                type="radio"
                name="size"
                id="sizeMedium"
                value="medium"
                onChange={() => {
                  setBoardWidth(12);
                  setBoardHeight(7);
                  setUseCustomSize(false);
                }}
              ></input>
              <label htmlFor="sizeMedium">Medium (12&#x2a2f;7)</label>
            </div>
            <div>
              <input
                type="radio"
                name="size"
                id="sizeLarge"
                value="large"
                onChange={() => {
                  setBoardWidth(17);
                  setBoardHeight(8);
                  setUseCustomSize(false);
                }}
              ></input>
              <label htmlFor="sizeLarge">Large (17&#x2a2f;8)</label>
            </div>
            <div>
              <input
                type="radio"
                name="size"
                id="sizeCustom"
                value="custom"
                onChange={() => {
                  setUseCustomSize(true);
                }}
              ></input>
              <label htmlFor="sizeCustom">Custom</label>
            </div>
            <div
              style={{
                display: useCustomSize ? "block" : "none",
                paddingTop: "1em",
              }}
            >
              <input
                type="range"
                id="customWidth"
                min="2"
                max="20"
                value={customWidth}
                onChange={({ target: { value: v } }) => {
                  setCustomWidth(v);
                }}
                style={{ width: "75%" }}
              ></input>
              {customWidth}
              <br />
              <label htmlFor="customWidth">Board Width</label>
            </div>
            <div style={{ display: useCustomSize ? "block" : "none" }}>
              <input
                type="range"
                id="customHeight"
                min="2"
                max="12"
                value={customHeight}
                onChange={({ target: { value: v } }) => {
                  setCustomHeight(v);
                }}
                style={{ width: "75%" }}
              ></input>
              {customHeight}
              <br />
              <label htmlFor="customHeight">Board Height</label>
            </div>
          </>
        )}
        {!useSimpleBoard && (
          <div>
            <input
              type="text"
              id="layoutCode"
              value={newLayoutCode}
              onChange={({ target: { value: v } }) => {
                setNewLayoutCode(v);
              }}
              style={{ width: "75%" }}
            ></input>
            <br />
            <label htmlFor="layoutCode">Layout Code</label>
          </div>
        )}
      </div>
      <div>
        <h2>Advanced Options</h2>
        <div>
          <input
            type="radio"
            name="difficulty"
            id="difficulty0"
            value="0"
            onChange={() => {
              setDifficulty(0);
            }}
            checked={difficulty === 0}
          ></input>
          <label htmlFor="difficulty0">
            Normal Mode - Always generates winnable boards.
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="difficulty"
            id="difficulty1"
            value="1"
            onChange={() => {
              setDifficulty(DifficultySettingsBits.ALLOW_SINGLE_PAIRS);
            }}
            checked={difficulty === DifficultySettingsBits.ALLOW_SINGLE_PAIRS}
          ></input>
          <label htmlFor="difficulty1">
            Slightly Hard Mode - Always generates winnable boards. For smaller
            boards, it allows single pairs of tiles.
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="difficulty"
            id="difficulty2"
            value="2"
            onChange={() => {
              setDifficulty(DifficultySettingsBits.USE_HARD_SHUFFLE);
            }}
            checked={difficulty === DifficultySettingsBits.USE_HARD_SHUFFLE}
          ></input>
          <label htmlFor="difficulty2">
            Hard Mode - True random shuffle that may generate unwinnable boards.
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="difficulty"
            id="difficulty3"
            value="3"
            onChange={() => {
              setDifficulty(
                DifficultySettingsBits.USE_HARD_SHUFFLE +
                  DifficultySettingsBits.ALLOW_SINGLE_PAIRS
              );
            }}
            checked={
              difficulty ===
              DifficultySettingsBits.USE_HARD_SHUFFLE +
                DifficultySettingsBits.ALLOW_SINGLE_PAIRS
            }
          ></input>
          <label htmlFor="difficulty3">
            Harder Mode - True random shuffle that may generate unwinnable
            boards. For smaller boards, it allows single pairs of tiles.
          </label>
        </div>
        <div style={{ paddingTop: "1em" }}>
          <input
            type="checkbox"
            id="optSeed"
            checked={useCustomSeed}
            onChange={() => setUseCustomSeed(!useCustomSeed)}
          ></input>
          <label htmlFor="optSeed">Use custom board number</label>
        </div>
        <div>
          <label htmlFor="optSeedNumber">Board Number: </label>
          <input
            type="text"
            id="optSeedNumber"
            value={seed}
            onChange={({ target: { value: v } }) => setSeed(v)}
            disabled={!useCustomSeed}
          ></input>
        </div>
      </div>
      <div style={{ paddingTop: "1em" }}>
        <button
          onClick={() =>
            useSimpleBoard
              ? handleResetBoard({
                  newGameType: GameTypes.TWOCORNER,
                  newLayoutCode: null,
                  newSeed: useCustomSeed ? parseInt(seed) : null,
                  newBoardWidth: useCustomSize
                    ? parseInt(customWidth)
                    : boardWidth,
                  newBoardHeight: useCustomSize
                    ? parseInt(customHeight)
                    : boardHeight,
                  newBlindShuffle: (difficulty & 1) !== 0,
                  newAllowSinglePairs: (difficulty & 2) !== 0,
                })
              : handleResetBoard({
                  newGameType: GameTypes.TWOCORNER,
                  newLayoutCode: layoutCode,
                  newSeed: useCustomSeed ? parseInt(seed) : null,
                  newBoardWidth: null,
                  newBoardHeight: null,
                  newBlindShuffle: (difficulty & 1) !== 0,
                  newAllowSinglePairs: (difficulty & 2) !== 0,
                })
          }
        >
          Start New Board
        </button>
      </div>
      <div>
        <button
          onClick={() =>
            handleResetBoard({
              newGameType: GameTypes.TRADITIONAL,
              newSeed: useCustomSeed ? parseInt(seed) : null,
              newBlindShuffle: (difficulty & 1) !== 0,
            })
          }
        >
          Start Classic Mahjong Solitaire (Traditional Layout)
        </button>
      </div>
      <div>
        <button onClick={backModal}>Go Back</button>
      </div>
    </div>
  );
};

export default NewBoardModalBody;
