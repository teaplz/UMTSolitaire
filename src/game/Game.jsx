import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ReactModal from "react-modal";

import { checkSimplestPath, checkAllPossibleMatches } from "./util/PathLogic";
import {
  generateBoardWithSimpleShuffle,
  generateBoardWithPresolvedShuffle,
  generateRectangularBoardWithSimpleShuffle,
  generateRectangularBoardWithPresolvedShuffle,
} from "./util/BoardGenerator";

import GameBoard from "./board/GameBoard";

import GameTimer from "./GameTimer";

import PauseModalBody from "./modal/PauseModalBody";
import NewBoardModalBody from "./modal/NewBoardModalBody";
import AdvancedSettingsModalBody from "./modal/AdvancedSettingsModalBody";
import GameWinModalBody from "./modal/GameWinModalBody";
import GameLoseModalBody from "./modal/GameLoseModalBody";
import HelpModalBody from "./modal/HelpModalBody";
import BackgroundColorModalBody from "./modal/BackgroundColorModalBody";
import LayoutEditModalBody from "./modal/LayoutEditModalBody";

import "./modal/Modal.css";
import "./GameBar.css";

ReactModal.setAppElement(document.getElementById("root"));

export default function Game({
  backgroundOption,
  backgroundColor,
  backgroundImage,
  setBackgroundOption,
  setBackgroundColor,
  setBackgroundImage,
}) {
  const gameStateVer = 6;

  // Settings
  const [useEmoji, setUseEmoji] = useState(false);
  const [showMatchingTiles, setShowMatchingTiles] = useState(false);
  const [showAllValidMatches, setShowAllValidMatches] = useState(false);
  const [fixRedDragonBugs, setFixRedDragonBugs] = useState(false);
  const [canUseHint, setCanUseHint] = useState(true);

  const DeselectBehavior = {
    ON_ANOTHER_TILE: "ON_ANOTHER_TILE",
    ON_SAME_TILE: "ON_SAME_TILE",
    ON_ANY_TILE: "ON_ANY_TILE",
  };

  const [deselectBehavior, setDeselectBehavior] = useState(
    DeselectBehavior.ON_ANY_TILE
  );

  const EmptySpace = {
    BLANK: "BLANK",
    TILE_BACK: "TILE_BACK",
  };

  const [emptySpace, setEmptySpace] = useState(EmptySpace.BLANK);

  // Game State
  const [gameEnded, setGameEnded] = useState(true);

  // Modal
  const GameModals = {
    HELP: "HELP",
    PAUSE: "PAUSE",
    SETTINGS_ADVANCED: "SETTINGS_ADVANCED",
    SETTINGS_BACKGROUND: "SETTINGS_BACKGROUND",
    LAYOUT_EDIT: "LAYOUT_EDIT",
    NEW_BOARD: "NEW_BOARD",
    GAME_WON: "GAME_WON",
    GAME_LOST: "GAME_LOST",
  };
  const [modalDisplayed, setModalDisplayed] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [prevModalState, setPrevModalState] = useState(null);

  // Board Generation Options
  const [boardWidth, setBoardWidth] = useState(17);
  const [boardHeight, setBoardHeight] = useState(8);
  const [seed, setSeed] = useState(1);
  const [layoutCode, setLayoutCode] = useState(null);
  const [blindShuffle, setBlindShuffle] = useState(false);
  const [allowSinglePairs, setAllowSinglePairs] = useState(false);

  // Tile State
  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [numTiles, setNumTiles] = useState(136);

  // Tile History
  const [tileHistory, setTileHistory] = useState([]);

  // Tile Hinting
  const [hintedTiles, setHintedTiles] = useState([]);
  const [allValidMatchingTiles, setAllValidMatchingTiles] = useState([]);
  const [allValidMatchesAtRandom, setAllValidMatchesAtRandom] = useState([]);
  const [allValidMatchesRandomCycle, setAllValidMatchesRandomCycle] =
    useState(0);
  const [randomMatchDisplayed, setRandomMatchDisplayed] = useState(false);

  // Pathing Maps
  const [pathingTiles, setPathingTiles] = useState([]);

  const [searchParams] = useSearchParams();

  const timerRef = useRef();

  // First time initialization.
  useEffect(() => {
    checkFontCompatibility();

    const gameState = loadGameState(),
      layout = searchParams?.get("l"),
      seed = searchParams?.get("s"),
      blindShuffle = searchParams?.get("ts") !== null,
      allowSinglePairs = searchParams?.get("sp") !== null;

    // Get the initial board, in order of priority:
    // - Create from URL search parameters. (Shared hyperlink)
    // - Recreate from the browser's web storage. (Persistence)
    // - Create basic 17x8 board. (Default)
    if (layout !== null) {
      resetGameState(seed, null, null, blindShuffle, allowSinglePairs, layout);
    } else if (
      gameState !== null &&
      "v" in gameState &&
      gameState.v === gameStateVer
    ) {
      try {
        setTiles(
          gameState.tiles.map((t, i) => ({
            id: i,
            char: t,
            inRemovalAnim: false,
          }))
        );
        setBoardWidth(gameState.boardWidth);
        setBoardHeight(gameState.boardHeight);
        setSeed(gameState.seed);
        setLayoutCode(gameState.layoutCode);
        setBlindShuffle(gameState.blindShuffle);
        setAllowSinglePairs(gameState.allowSinglePairs);
        setNumTiles(gameState.numTiles);
        setTileHistory(gameState.tileHistory);

        const newTimer = new Date();

        newTimer.setSeconds(
          newTimer.getSeconds() +
            gameState.timer.seconds +
            gameState.timer.minutes * 60 +
            gameState.timer.hours * 3600
        );

        timerRef.current.reset(newTimer);

        setGameEnded(false);
      } catch {
        resetGameState(null, 17, 8);
      }
    } else {
      resetGameState();
    }
  }, []);

  // Get the current game state from the browser's web stoarge.
  function loadGameState() {
    // Check if LocalStorage is active.
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("test", "1");
        if (localStorage.getItem("test") === "1") {
          localStorage.removeItem("test");
        }
      } catch (e) {
        return null;
      }
    } else {
      return null;
    }

    const gameStateJson = localStorage.getItem("gamestate");

    if (gameStateJson !== null) {
      return JSON.parse(gameStateJson);
    } else {
      return null;
    }
  }

  // Save the current game state to the browser's web storage.
  function saveGameState() {
    // Check if LocalStorage is active.
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("test", "1");
        if (localStorage.getItem("test") === "1") {
          localStorage.removeItem("test");
        }
      } catch (e) {
        return;
      }
    } else {
      return;
    }

    localStorage.setItem(
      "gamestate",
      JSON.stringify({
        v: gameStateVer,
        tiles: tiles.map((t) => (t.inRemovalAnim ? null : t.char)),
        boardWidth: boardWidth,
        boardHeight: boardHeight,
        seed: seed,
        layoutCode: layoutCode,
        blindShuffle: blindShuffle,
        allowSinglePairs: allowSinglePairs,
        numTiles: numTiles,
        tileHistory: tileHistory,
        timer: {
          seconds: timerRef.current.seconds,
          minutes: timerRef.current.minutes,
          hours: timerRef.current.hours,
        },
      })
    );
  }

  // Checks with some font issues regarding the Mahjong Tiles Unicode Block.
  function checkFontCompatibility() {
    // Currently, all mahjong tiles are Non-RGI with the exception of Red Dragon,
    // and the only system font that supports all of these tiles as emojis is the
    // Segoe UI Emoji family, included in Windows 10+.
    //
    // It is unlikely that future Unicode Emoji specifications will support
    // all tiles as RGI, and I'm unsure if other system font providers will
    // support them (whether in the proper orientation or just outright).
    // So for now, we'll just assume that only desktop Windows 10+ can run the
    // emoji mode.
    if (navigator.userAgentData)
      // Use the UA-CH API, if able.
      navigator.userAgentData
        .getHighEntropyValues(["platformVersion"])
        .then((ua) => {
          if (ua.platform === "Windows" && parseInt(ua.platformVersion) >= 1) {
            console.log("Windows 10+ detected, using emoji tiles.");
            setUseEmoji(true);

            // Windows 11+ changes the angle of the Red Dragon emoji.
            // Replace with a different emoji.
            if (parseInt(ua.platformVersion) >= 13) {
              setFixRedDragonBugs(true);
            }
          }
        });
    else if (
      window.navigator &&
      /Windows NT \d{2}/.test(window.navigator.userAgent)
    ) {
      // Check the User Agent directly, if the UA-CH API cannot be accessed.
      console.log("Windows 10+ detected, using emoji tiles.");
      setUseEmoji(true);

      // Windows 11+ changes the angle of the Red Dragon emoji. Although we
      // should only replace it with a different emoji outside of Windows 10,
      // they have chosen not to update the UA in favor of switching over to
      // UA-CH. As it is impossible to use UA to detect modern Windows versions,
      // just replace the emoji for all modern Windows versions.
      setFixRedDragonBugs(true);
    }

    // Chrome for Android has a bug where it'll not respect VS15/U+FE0E and
    // always render the Red Dragon tile as emoji. For now, just replace it
    // with a red version of the blue White Dragon tile.
    if (
      navigator.userAgentData
        ? navigator.userAgentData.brands.some((item) => {
            return item.brand === "Chromium";
          }) === true && navigator.userAgentData.mobile === true
        : window.navigator &&
          window.navigator.userAgent.includes("Chrome") &&
          window.navigator.userAgent.includes("Mobile")
    ) {
      setFixRedDragonBugs(true);
    }
  }

  // Resets the game state while generating a new board.
  function resetGameState(
    newSeed,
    newBoardWidth = boardWidth,
    newBoardHeight = boardHeight,
    newBlindShuffle = blindShuffle,
    newAllowSinglePairs = allowSinglePairs,
    newLayoutCode = layoutCode
  ) {
    let generatedBoard;

    if (newLayoutCode != null) {
      // Generate the board based on the provided layout code. Fallback to the
      // default board if it fails.

      if (newBlindShuffle) {
        generatedBoard = generateBoardWithSimpleShuffle(
          newSeed,
          newLayoutCode,
          newAllowSinglePairs
        );
      } else {
        generatedBoard = generateBoardWithPresolvedShuffle(
          newSeed,
          newLayoutCode,
          newAllowSinglePairs
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

      if (newBlindShuffle) {
        generatedBoard = generateRectangularBoardWithSimpleShuffle(
          newSeed,
          newBoardWidth,
          newBoardHeight,
          newAllowSinglePairs
        );
      } else {
        generatedBoard = generateRectangularBoardWithPresolvedShuffle(
          newSeed,
          newBoardWidth,
          newBoardHeight,
          newAllowSinglePairs
        );
      }
    }

    if (generatedBoard === null) {
      console.log("Failed to generate board! Cancel board reset.");
      return;
    }

    setTiles(generatedBoard.tiles);
    setBoardWidth(generatedBoard.width);
    setBoardHeight(generatedBoard.height);
    setSeed(generatedBoard.seed);
    setLayoutCode(generatedBoard.layoutCode);
    setBlindShuffle(newBlindShuffle);
    setAllowSinglePairs(newAllowSinglePairs);
    setNumTiles(generatedBoard.numTiles);
    setSelectedTile(null);
    setTileHistory([]);
    setHintedTiles([]);
    setAllValidMatchingTiles([]);
    setAllValidMatchesAtRandom([]);
    setPathingTiles([]);
    setModalDisplayed(false);
    setGameEnded(false);
    timerRef.current.reset();
  }

  // Every time the tile array is updated, save the game state and check the
  // number of valid matches.
  useEffect(() => {
    if (!gameEnded) {
      checkAllValidMatches();
      saveGameState();
    }
  }, [tiles]);

  // Check all possible matches for the current board. Display them in debugging
  // options, and check the game end state when there are no matches remaining.
  function checkAllValidMatches() {
    const allValidMatches = checkAllPossibleMatches(
      tiles,
      boardWidth,
      boardHeight
    );

    console.log(`Number of Valid Matches: ${allValidMatches.length}`);

    // Debug: Show all the valid matches in the console.
    if (showAllValidMatches) {
      console.log(
        "Valid Matches: " +
          allValidMatches.reduce(
            (a, b) =>
              a.concat(
                `[${String.fromCodePoint(0x1f000 + tiles[b[0]].char)}, ${
                  (b[0] % (boardWidth + 2)) - 1 + 1
                },${
                  (b[0] - (b[0] % (boardWidth + 2)) - (boardWidth + 2)) /
                    (boardWidth + 2) +
                  1
                } <-> ${(b[1] % (boardWidth + 2)) - 1 + 1},${
                  (b[1] - (b[1] % (boardWidth + 2)) - (boardWidth + 2)) /
                    (boardWidth + 2) +
                  1
                }] `
              ),
            ""
          )
      );
    }

    setAllValidMatchingTiles([...new Set(allValidMatches.flat())]);

    // Use Fisher-Yates shuffle to shuffle the valid matches array. That way,
    // when the player clicks the hint button, it'll display a random match,
    // with subsequent clicks displaying another random match through the array.
    const allValidMatchesAtRandom = allValidMatches.slice();

    {
      let curIndex = allValidMatchesAtRandom.length,
        randIndex;

      while (curIndex != 0) {
        randIndex = Math.floor(Math.random() * curIndex);
        curIndex--;

        [
          allValidMatchesAtRandom[curIndex],
          allValidMatchesAtRandom[randIndex],
        ] = [
          allValidMatchesAtRandom[randIndex],
          allValidMatchesAtRandom[curIndex],
        ];
      }
    }

    setAllValidMatchesAtRandom(allValidMatchesAtRandom);
    setAllValidMatchesRandomCycle(0);
    setRandomMatchDisplayed(false);

    // If there are no matching tiles, then we either won or lost the game.
    if (allValidMatches.length === 0) {
      timerRef.current.pause();
      setGameEnded(true);

      if (numTiles - tileHistory.length * 2 > 0)
        showModal(GameModals.GAME_LOST);
      else showModal(GameModals.GAME_WON);
    }
  }

  function handleTileClick(tileId) {
    if (tiles[tileId].char === null || tiles[tileId].inRemovalAnim === true) {
      // Clicked an empty space.
      return;
    } else if (selectedTile === tileId) {
      // Clicked the same tile.
      if (
        deselectBehavior === DeselectBehavior.ON_SAME_TILE ||
        deselectBehavior === DeselectBehavior.ON_ANY_TILE
      ) {
        setSelectedTile(null);
        setHintedTiles([]);
      }
    } else if (
      selectedTile !== null &&
      tiles[tileId].char === tiles[selectedTile].char
    ) {
      // Clicked a matching tile.

      const path = checkSimplestPath(
        tileId,
        selectedTile,
        tiles.slice(),
        boardWidth,
        boardHeight
      );

      if (path !== null) {
        // There is a correct path between them. These tiles are matched!

        const newTiles = tiles.slice();

        // Remove tiles that were in their fadeout animation from the board.
        newTiles.forEach((tile) => {
          if (tile.inRemovalAnim === true) {
            tile.inRemovalAnim = false;
            tile.char = null;
          }
        });

        // Change the matched tiles to their fadeout animation.
        newTiles[tileId].inRemovalAnim = true;
        newTiles[selectedTile].inRemovalAnim = true;

        setTiles(newTiles);

        // Push the match into the tile history stack.
        setTileHistory([
          ...tileHistory,
          {
            char: tiles[tileId].char,
            tile1: tileId,
            tile2: selectedTile,
          },
        ]);

        // Generate the pathing tiles for display.
        const pathingTiles = tiles.map(() => []);

        path.forEach((line) => {
          line.segment.forEach((node) => {
            pathingTiles[node].push(line.dir);
          });
        });

        pathingTiles[tileId].push("-start");
        pathingTiles[selectedTile].push("-end");

        setPathingTiles(pathingTiles);

        setSelectedTile(null);
        setHintedTiles([]);
      } else if (
        deselectBehavior === DeselectBehavior.ON_ANOTHER_TILE ||
        deselectBehavior === DeselectBehavior.ON_ANY_TILE
      ) {
        // There is no correct path. Select it if necessary.

        setSelectedTile(tileId);

        // Update the hinting system, if it's enabled.
        if (showMatchingTiles === true) {
          const hintedTiles = tiles.filter(
            (t) => t.char === tiles[tileId].char
          );

          setHintedTiles(hintedTiles);
        }
      }
    } else if (
      selectedTile === null ||
      deselectBehavior === DeselectBehavior.ON_ANOTHER_TILE ||
      deselectBehavior === DeselectBehavior.ON_ANY_TILE
    ) {
      // Clicked a non-matching tile.
      setSelectedTile(tileId);

      // Update the hinting system, if it's enabled.
      if (showMatchingTiles === true) {
        const hintedTiles = tiles.filter((t) => t.char === tiles[tileId].char);

        setHintedTiles(hintedTiles);
      }
    }
  }

  // Revert the board to the previous state.
  function undoMatch(doHideModal = false) {
    if (tileHistory.length > 0) {
      const newTiles = tiles.slice();
      const lastMatch = tileHistory.slice(-1)[0];

      newTiles[lastMatch.tile1].char = lastMatch.char;
      newTiles[lastMatch.tile1].inRemovalAnim = false;

      newTiles[lastMatch.tile2].char = lastMatch.char;
      newTiles[lastMatch.tile2].inRemovalAnim = false;

      setTiles(newTiles);
      setTileHistory(tileHistory.slice(0, -1));
      setHintedTiles([]);
      setPathingTiles([]);
      setSelectedTile(null);

      if (gameEnded) timerRef.current.start();

      setGameEnded(false);

      if (doHideModal) hideModal();
    }
  }

  function showOneMatch() {
    if (!canUseHint) return;

    setRandomMatchDisplayed(true);

    setAllValidMatchesRandomCycle(
      (allValidMatchesRandomCycle + 1) % allValidMatchesAtRandom.length
    );
  }

  function showModal(newState) {
    timerRef.current.pause();

    setModalDisplayed(true);

    if (newState) {
      setPrevModalState(modalState);
      setModalState(newState);
    }
  }

  function hideModal() {
    if (!gameEnded) timerRef.current.start();

    setModalDisplayed(false);
  }

  function generateShareUrls() {
    const layoutUrl = `${window.location.href.split("?")[0]}?l=${layoutCode}`;

    return {
      layoutUrl,
      gameUrl: `${layoutUrl}&s=${seed}${blindShuffle ? "&ts" : ""}${
        allowSinglePairs ? "&sp" : ""
      }`,
    };
  }

  function renderModalBody(modalState) {
    switch (modalState) {
      case GameModals.HELP:
        return <HelpModalBody {...{ useEmoji, closeModal: hideModal }} />;
      case GameModals.PAUSE:
        return (
          <PauseModalBody
            {...{
              seed,
              layoutCode,
              tilesMatchable: allValidMatchingTiles.length,
              shareUrls: generateShareUrls(),
              resetGameState,
              hideModal,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
              advancedSettingsModal: () =>
                showModal(GameModals.SETTINGS_ADVANCED),
              backgroundColorModal: () =>
                showModal(GameModals.SETTINGS_BACKGROUND),
              layoutEditModal: () => showModal(GameModals.LAYOUT_EDIT),
            }}
          />
        );
      case GameModals.SETTINGS_ADVANCED:
        return (
          <AdvancedSettingsModalBody
            {...{
              showAllValidMatches,
              showMatchingTiles,
              useEmoji,
              toggleHighlightAllMatches: () =>
                setShowAllValidMatches((prevState) => !prevState),
              toggleHighlightMatchesForTile: () =>
                setShowMatchingTiles((prevState) => !prevState),
              toggleEmojiMode: () => setUseEmoji((prevState) => !prevState),
              backModal: () => showModal(prevModalState),
            }}
          />
        );
      case GameModals.SETTINGS_BACKGROUND:
        return (
          <BackgroundColorModalBody
            {...{
              backgroundOption,
              backgroundColor,
              backgroundImage,
              setBackgroundOption,
              setBackgroundColor,
              setBackgroundImage,
              backModal: () => showModal(prevModalState),
            }}
          />
        );
      case GameModals.LAYOUT_EDIT:
        return (
          <LayoutEditModalBody
            {...{
              initialLayout: layoutCode,
              startNewGame: resetGameState,
              backModal: () => showModal(prevModalState),
            }}
          />
        );
      case GameModals.NEW_BOARD:
        return (
          <NewBoardModalBody
            {...{
              prevWidth: boardWidth,
              prevHeight: boardHeight,
              prevBlindShuffle: blindShuffle,
              prevAllowSinglePairs: allowSinglePairs,
              prevSeed: seed,
              layoutCode,
              handleResetBoard: resetGameState,
              backModal: () => showModal(prevModalState),
            }}
          />
        );
      case GameModals.GAME_WON:
        return (
          <GameWinModalBody
            {...{
              numTiles,
              clearTime: timerRef.current,
              seed,
              layoutCode,
              shareUrls: generateShareUrls(),
              handleResetBoard: resetGameState,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
            }}
          />
        );
      case GameModals.GAME_LOST:
        return (
          <GameLoseModalBody
            {...{
              remainingTiles: numTiles - tileHistory.length * 2,
              seed,
              layoutCode,
              canUndo: tileHistory.length === 0,
              shareUrls: generateShareUrls(),
              handleUndoMatch: () => undoMatch(true),
              handleResetBoard: resetGameState,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <GameBoard
        {...{
          boardWidth,
          boardHeight,
          tiles,
          pathingTiles,
          hintedTiles,
          wholeMatchingTiles: showAllValidMatches
            ? allValidMatchingTiles
            : randomMatchDisplayed
            ? allValidMatchesAtRandom[allValidMatchesRandomCycle]
            : [],
          selectedTile,
          useEmoji,
          fixRedDragonBugs,
          handleTileClick,
        }}
      />

      <div className="game-bar">
        <button
          className="game-bar-pause-button"
          onClick={() => showModal(GameModals.PAUSE)}
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="7vmin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        </button>
        <div>
          <GameTimer ref={timerRef} />
        </div>
        <div>
          <button
            className="game-bar-button"
            onClick={undoMatch}
            disabled={tileHistory.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4vmin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <polygon points="11 19 2 12 11 5 11 19"></polygon>
              <polygon points="22 19 13 12 22 5 22 19"></polygon>
            </svg>
          </button>
          <button
            className="game-bar-button"
            onClick={showOneMatch}
            disabled={!canUseHint}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4vmin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button
            className="game-bar-button"
            onClick={() => showModal(GameModals.HELP)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4vmin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <button
            className="game-bar-button portrait-mode"
            onClick={() => showModal(GameModals.PAUSE)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4vmin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>
      </div>

      <ReactModal
        isOpen={modalDisplayed}
        contentLabel={modalState}
        onRequestClose={hideModal}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        className="GameModal"
      >
        {renderModalBody(modalState)}
      </ReactModal>
    </>
  );
}
