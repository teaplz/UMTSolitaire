import React, { useState } from "react";
import { GameTypes, GameTypeShortStrings } from "../GameTypes";

import * as TraditionalGameType from "../logic/TraditionalGameType";
import * as TwoCornerGameType from "../logic/TwoCornerGameType";

import {
  TileDistributionOptionDescriptions,
  TileDistributionOptions,
} from "../logic/shared/TileDistributionOptions";

const NewBoardModalBody = ({
  prevGameType,
  prevWidth,
  prevHeight,
  prevBlindShuffle,
  prevTileDistribution,
  prevSeed,
  prevLayoutCode,
  handleResetBoard,
  prevModal,
}) => {
  const [isChoosingGame, setChoosingGame] = useState(true);

  const selectGameType = (selected) => {
    if (selected === null) {
      setGameSelection(prevGameType);
      setShuffleType(
        prevBlindShuffle ? ShuffleTypes.SIMPLE : ShuffleTypes.PRESOLVED
      );
      setTileDistribution(prevTileDistribution);

      setBaseBoardLayout(null);
      setBoardWidth(prevWidth);
      setBoardHeight(prevHeight);
    } else {
      setGameSelection(selected);
      setBaseBoardLayout(0);
    }

    if (selected === prevGameType || selected === null) {
      setCustomLayoutCode(prevLayoutCode);
    }

    if (
      selected === GameTypes.TRADITIONAL ||
      (selected === null && prevGameType === GameTypes.TRADITIONAL)
    ) {
      setLayoutCode(TraditionalGameType.DefaultBoardLayouts.TURTLE.code);
    } else {
      setLayoutCode(TwoCornerGameType.DefaultBoardLayouts.LARGE.code);
    }

    setChoosingGame(false);
  };

  const [gameSelection, setGameSelection] = useState(null);

  const [baseBoardLayout, setBaseBoardLayout] = useState();

  const [useCustomSize, setUseCustomSize] = useState(false);
  const [boardWidth, setBoardWidth] = useState(17);
  const [boardHeight, setBoardHeight] = useState(8);

  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [seed, setSeed] = useState(prevSeed);

  const [layoutCode, setLayoutCode] = useState();
  const [customLayoutCode, setCustomLayoutCode] = useState();

  const [useCustomShuffleAndDist, setUseCustomShuffleAndDist] = useState(false);
  const [shuffleType, setShuffleType] = useState(0);
  const ShuffleTypes = {
    PRESOLVED: 0,
    SIMPLE: 1,
  };
  const [tileDistribution, setTileDistribution] = useState(0);

  const renderGameSelection = (
    <>
      <h1>Start New Board</h1>
      <div className="buttonMenu">
        <button onClick={() => selectGameType(GameTypes.TRADITIONAL)}>
          <svg
            width="166"
            height="152"
            stroke="#000000"
            strokeWidth="4"
            fill="#f2f2f2"
          >
            <rect width="50" height="70" rx="5" ry="5" x="4" y="4" />
            <rect width="50" height="70" rx="5" ry="5" x="4" y="78" />
            <rect width="50" height="70" rx="5" ry="5" x="58" y="4" />
            <rect width="50" height="70" rx="5" ry="5" x="58" y="78" />
            <rect width="50" height="70" rx="5" ry="5" x="112" y="4" />
            <rect width="50" height="70" rx="5" ry="5" x="112" y="78" />
            <rect width="50" height="70" rx="5" ry="5" x="31" y="39" />
            <rect width="50" height="70" rx="5" ry="5" x="85" y="39" />
          </svg>
          <br />
          New Traditional Board
        </button>
        <button onClick={() => selectGameType(GameTypes.TWOCORNER)}>
          <svg
            width="166"
            height="152"
            stroke="#000000"
            strokeWidth="4"
            fill="#f2f2f2"
          >
            <rect width="50" height="70" rx="5" ry="5" x="4" y="4" />
            <rect width="50" height="70" rx="5" ry="5" x="4" y="78" />
            <rect width="50" height="70" rx="5" ry="5" x="112" y="4" />
            <rect width="50" height="70" rx="5" ry="5" x="112" y="78" />
            <path d="m60,35l24,0l0,85l22,0" fillOpacity="0" />
          </svg>
          <br />
          New Two-Corner Board
        </button>
      </div>
      <div className="buttonMenu" style={{ flex: 0 }}>
        <button onClick={() => selectGameType(null)}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m11.78,18.74c-3.58,0 -6.5,-2.9 -6.5,-6.47c0,-3.57 2.91,-6.47 6.5,-6.47c2.49,0 4.66,1.4 5.75,3.46l4.14,0c-1.29,-4.22 -5.23,-7.29 -9.89,-7.29c-5.71,0 -10.34,4.61 -10.34,10.29c0,5.68 4.63,10.29 10.34,10.29c2.98,0 5.66,-1.25 7.55,-3.26l-2.81,-2.62c-1.19,1.26 -2.87,2.05 -4.74,2.05z" />
            <polygon points="22,5 22,13 14,11" />
          </svg>
          <br />
          Use Same Board Layout
        </button>
        <button onClick={prevModal}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m12.69,5.95l0,-3.25c0,-0.57 -0.25,-1.09 -0.64,-1.34c-0.39,-0.25 -0.86,-0.2 -1.22,0.15l-5.15,5c-0.37,0.21 -0.61,0.47 -0.76,0.74l-2.97,2.88c-0.29,0.29 -0.46,0.73 -0.46,1.2c0,0.48 0.17,0.92 0.47,1.2l8.88,8.49c0.35,0.34 0.82,0.39 1.21,0.13c0.39,-0.25 0.63,-0.77 0.63,-1.33l0,-3.87c0.01,0 0.02,0 0.02,0c2.08,0 5.8,0.76 7.25,5.87c0.17,0.59 0.61,0.97 1.09,0.97c0.04,0 0.08,0 0.12,-0.01c0.53,-0.08 0.95,-0.61 1.02,-1.29c0.03,-0.27 0.66,-6.78 -2.42,-11.36c-1.66,-2.47 -4.04,-3.88 -7.09,-4.2zm0.02,7.03c-0.78,0 -1.29,0.09 -1.35,0.1c-0.57,0.11 -0.99,0.74 -0.99,1.48l0,2.3l-5.79,-5.54l1.93,-1.88c0.08,-0.07 0.14,-0.15 0.2,-0.25c0.08,-0.04 0.16,-0.11 0.23,-0.18l3.42,-3.33l0,1.68c0,0.82 0.5,1.48 1.14,1.49c2.9,0.05 5.09,1.13 6.5,3.22c0.78,1.16 1.25,2.53 1.54,3.83c-2.36,-2.58 -5.35,-2.94 -6.84,-2.94z" />
          </svg>
          <br />
          Go Back
        </button>
      </div>
    </>
  );

  const renderBoardSelection = (
    <>
      <h1>Start New {GameTypeShortStrings[gameSelection]} Board</h1>
      <h2>Base Layout</h2>
      <div className="buttonMenu bm-limit3" style={{ flex: 0 }}>
        {gameSelection === GameTypes.TRADITIONAL ? (
          <>
            <button
              onClick={() => {
                setBaseBoardLayout(0);
                setLayoutCode(
                  TraditionalGameType.DefaultBoardLayouts.TURTLE.code
                );
              }}
              disabled={baseBoardLayout === 0}
            >
              {TraditionalGameType.DefaultBoardLayouts.TURTLE.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(1);
                setLayoutCode(TraditionalGameType.DefaultBoardLayouts.CAT.code);
              }}
              disabled={baseBoardLayout === 1}
            >
              {TraditionalGameType.DefaultBoardLayouts.CAT.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(2);
                setLayoutCode(TraditionalGameType.DefaultBoardLayouts.DOG.code);
              }}
              disabled={baseBoardLayout === 2}
            >
              {TraditionalGameType.DefaultBoardLayouts.DOG.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(3);
                setLayoutCode(
                  TraditionalGameType.DefaultBoardLayouts.TINYTURTLE.code
                );
              }}
              disabled={baseBoardLayout === 3}
            >
              {TraditionalGameType.DefaultBoardLayouts.TINYTURTLE.name}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setBaseBoardLayout(0);
                setLayoutCode(TwoCornerGameType.DefaultBoardLayouts.LARGE.code);
              }}
              disabled={baseBoardLayout === 0}
            >
              {TwoCornerGameType.DefaultBoardLayouts.LARGE.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(1);
                setLayoutCode(
                  TwoCornerGameType.DefaultBoardLayouts.MEDIUM.code
                );
              }}
              disabled={baseBoardLayout === 1}
            >
              {TwoCornerGameType.DefaultBoardLayouts.MEDIUM.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(2);
                setLayoutCode(TwoCornerGameType.DefaultBoardLayouts.SMALL.code);
              }}
              disabled={baseBoardLayout === 2}
            >
              {TwoCornerGameType.DefaultBoardLayouts.SMALL.name}
            </button>
            <button
              onClick={() => {
                setBaseBoardLayout(3);
                setLayoutCode(TwoCornerGameType.DefaultBoardLayouts.HEART.code);
              }}
              disabled={baseBoardLayout === 3}
            >
              {TwoCornerGameType.DefaultBoardLayouts.HEART.name}
            </button>
          </>
        )}
        <button
          onClick={() => setBaseBoardLayout(null)}
          disabled={baseBoardLayout === null}
        >
          Custom
        </button>
      </div>
      {gameSelection === GameTypes.TRADITIONAL && baseBoardLayout === null && (
        <div>
          <input
            type="text"
            id="layoutCode"
            value={customLayoutCode}
            onChange={({ target: { value: v } }) => {
              setCustomLayoutCode(v);
            }}
            style={{ width: "75%" }}
          ></input>
          <br />
          <label htmlFor="layoutCode">Layout Code</label>
        </div>
      )}
      {gameSelection === GameTypes.TWOCORNER && baseBoardLayout === null && (
        <>
          <div className="buttonMenu" style={{ flex: 0 }}>
            <button
              onClick={() => setUseCustomSize(true)}
              disabled={useCustomSize}
            >
              Custom Rectangle Size
            </button>
            <button
              onClick={() => setUseCustomSize(false)}
              disabled={!useCustomSize}
            >
              Custom Layout Code
            </button>
          </div>
          {useCustomSize ? (
            <div>
              <label htmlFor="boardWidth">Board Width</label>:
              <input
                type="range"
                id="boardWidth"
                min="2"
                max="20"
                value={boardWidth}
                onChange={({ target: { value: v } }) => {
                  setBoardWidth(v);
                }}
              ></input>
              {boardWidth}
              <br />
              <label htmlFor="boardHeight">Board Height</label>:
              <input
                type="range"
                id="boardHeight"
                min="2"
                max="12"
                value={boardHeight}
                onChange={({ target: { value: v } }) => {
                  setBoardHeight(v);
                }}
              ></input>
              {boardHeight}
            </div>
          ) : (
            <div>
              <input
                type="text"
                id="layoutCode"
                value={customLayoutCode}
                onChange={({ target: { value: v } }) => {
                  setCustomLayoutCode(v);
                }}
                style={{ width: "75%" }}
              ></input>
              <br />
              <label htmlFor="layoutCode">Layout Code</label>
            </div>
          )}
        </>
      )}
      <hr />
      <h2>Advanced Options</h2>
      <div>
        <input
          type="checkbox"
          id="optSeed"
          checked={useCustomSeed}
          onChange={() => setUseCustomSeed(!useCustomSeed)}
        ></input>
        <label htmlFor="optSeed">Use custom board number</label>
      </div>
      <div>
        <label htmlFor="optSeedNumber">Custom Board Number: </label>
        <input
          type="text"
          id="optSeedNumber"
          value={seed}
          onChange={({ target: { value: v } }) => setSeed(v)}
          disabled={!useCustomSeed}
        ></input>
      </div>
      <div style={{ paddingTop: "1em" }}>
        <input
          type="checkbox"
          id="optShuffle"
          checked={useCustomShuffleAndDist}
          onChange={() => setUseCustomShuffleAndDist(!useCustomShuffleAndDist)}
        ></input>
        <label htmlFor="optShuffle">
          Use custom tile shuffling/distribution
        </label>
      </div>
      {useCustomShuffleAndDist && (
        <>
          <div>
            <label htmlFor="selShuffle">Shuffle Type: </label>
            <select
              id="selShuffle"
              onChange={({ target: { value: v } }) => setShuffleType(v)}
              defaultValue={shuffleType}
            >
              <option value={ShuffleTypes.PRESOLVED}>Normal</option>
              <option value={ShuffleTypes.SIMPLE}>
                Purely Random (may be unwinnable)
              </option>
            </select>
          </div>
          <div>
            <label htmlFor="selTileDistribution">Tile Distribution: </label>
            <select
              id="selTileDistribution"
              onChange={({ target: { value: v } }) => setTileDistribution(v)}
              defaultValue={tileDistribution}
            >
              <option value={TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS}>
                Prioritize Single Pairs
              </option>
              <option value={TileDistributionOptions.PRIORITIZE_BOTH_PAIRS}>
                Prioritize Both Pairs
              </option>
              <option value={TileDistributionOptions.ALWAYS_BOTH_PAIRS}>
                Always Both Pairs
              </option>
              <option value={TileDistributionOptions.RANDOM_PER_SET}>
                Random Per Set
              </option>
              <option value={TileDistributionOptions.RANDOM}>Random</option>
            </select>
            <br />
            {TileDistributionOptionDescriptions[tileDistribution]}
          </div>
        </>
      )}
      <hr />
      <div className="buttonMenu">
        <button
          onClick={() =>
            handleResetBoard({
              newGameType: gameSelection,
              newLayoutCode:
                baseBoardLayout === null
                  ? gameSelection == GameTypes.TWOCORNER && useCustomSize
                    ? null
                    : customLayoutCode
                  : layoutCode,
              newSeed: useCustomSeed ? parseInt(seed) : null,
              newBlindShuffle: shuffleType == ShuffleTypes.SIMPLE,
              newTileDistribution: tileDistribution,
              newBoardWidth: parseInt(boardWidth),
              newBoardHeight: parseInt(boardHeight),
            })
          }
        >
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <polygon points="5 19  19 12  5 5  5 19"></polygon>
          </svg>
          <br />
          Start Game
        </button>
        <button onClick={prevModal}>
          <svg
            width="2em"
            viewBox="0 0 24 24"
            fill="#000000"
            stroke="none"
            strokeWidth="2"
          >
            <path d="m12.69,5.95l0,-3.25c0,-0.57 -0.25,-1.09 -0.64,-1.34c-0.39,-0.25 -0.86,-0.2 -1.22,0.15l-5.15,5c-0.37,0.21 -0.61,0.47 -0.76,0.74l-2.97,2.88c-0.29,0.29 -0.46,0.73 -0.46,1.2c0,0.48 0.17,0.92 0.47,1.2l8.88,8.49c0.35,0.34 0.82,0.39 1.21,0.13c0.39,-0.25 0.63,-0.77 0.63,-1.33l0,-3.87c0.01,0 0.02,0 0.02,0c2.08,0 5.8,0.76 7.25,5.87c0.17,0.59 0.61,0.97 1.09,0.97c0.04,0 0.08,0 0.12,-0.01c0.53,-0.08 0.95,-0.61 1.02,-1.29c0.03,-0.27 0.66,-6.78 -2.42,-11.36c-1.66,-2.47 -4.04,-3.88 -7.09,-4.2zm0.02,7.03c-0.78,0 -1.29,0.09 -1.35,0.1c-0.57,0.11 -0.99,0.74 -0.99,1.48l0,2.3l-5.79,-5.54l1.93,-1.88c0.08,-0.07 0.14,-0.15 0.2,-0.25c0.08,-0.04 0.16,-0.11 0.23,-0.18l3.42,-3.33l0,1.68c0,0.82 0.5,1.48 1.14,1.49c2.9,0.05 5.09,1.13 6.5,3.22c0.78,1.16 1.25,2.53 1.54,3.83c-2.36,-2.58 -5.35,-2.94 -6.84,-2.94z" />
          </svg>
          <br />
          Go Back
        </button>
      </div>
    </>
  );

  return isChoosingGame ? renderGameSelection : renderBoardSelection;
};

export default NewBoardModalBody;
