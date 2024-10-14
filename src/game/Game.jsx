import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ReactModal from "react-modal";

import { GameTypeLayoutCodeIDs, GameTypes } from "./GameTypes";

import * as TraditionalGameType from "./logic/TraditionalGameType";
import * as TwoCornerGameType from "./logic/TwoCornerGameType";

import GameBoard from "./board/GameBoard";

import GameTimer from "./GameTimer";

import PauseModalBody from "./modal/PauseModalBody";
import NewBoardModalBody from "./modal/NewBoardModalBody";
import GameEndModalBody from "./modal/GameEndModalBody";
import HelpModalBody from "./modal/HelpModalBody";
import SettingsModalBody from "./modal/SettingsModalBody";
import LayoutEditModalBody from "./modal/LayoutEditModalBody";

import "./modal/Modal.css";
import "./GameBar.css";
import { TileDistributionOptions } from "./logic/shared/TileDistributionOptions";

ReactModal.setAppElement(document.getElementById("root"));

export default function Game({
  backgroundColor,
  backgroundImage,
  setBackgroundColor,
  setBackgroundImage,
}) {
  const gameStateVer = 7;

  // ----------------
  // Begin State List
  // ----------------

  //
  // Game Settings and Debug Options
  //

  // When enabled, use emojis instead of text glyphs for the game tiles.
  // Automatically determined by the browser capabilities, but can be toggled
  // manually as a debugging option.
  const [useEmoji, setUseEmoji] = useState(false);

  // Replace the Red Dragon tile with another, as some browsers do not support
  // it correctly.
  const [fixRedDragonBug, setFixRedDragonBug] = useState(false);
  const [overrideRedDragonBugFix, setOverrideRedDragonBugFix] = useState(null);

  // Remove "3D" effect for tiles for better performance.
  const [lowDetailMode, setLowDetailMode] = useState(false);

  // Debug / Cheat: Show all tiles matching the currently selected tile.
  const [showMatchingTiles, setShowMatchingTiles] = useState(false);

  // Debug / Cheat: Show all valid matches on the board.
  const [showAllValidMatches, setShowAllValidMatches] = useState(false);

  // Toggles the ability to cycle through a matching pair as a "hint". Currently
  // not available as an option.
  const [canUseHint, setCanUseHint] = useState(true);

  // Determines when the currently-selected tile would be deselected after
  // another click, either when clicking another tile, the same tile, or any
  // tile. Currently not available as an option.
  const DeselectBehavior = {
    ON_ANOTHER_TILE: "ON_ANOTHER_TILE",
    ON_SAME_TILE: "ON_SAME_TILE",
    ON_ANY_TILE: "ON_ANY_TILE",
  };
  const [deselectBehavior, setDeselectBehavior] = useState(
    DeselectBehavior.ON_ANY_TILE
  );

  //
  // Modals
  //

  const GameModals = {
    HELP: "HELP",
    PAUSE: "PAUSE",
    SETTINGS: "SETTINGS",
    LAYOUT_EDIT: "LAYOUT_EDIT",
    NEW_BOARD: "NEW_BOARD",
    GAME_WON: "GAME_WON",
    GAME_LOST: "GAME_LOST",
  };

  // Determines whether or not the modal is displayed.
  const [modalDisplayed, setModalDisplayed] = useState(false);

  // Current modal.
  const [modalState, setModalState] = useState(null);

  // Stack to keep track of modal history.
  const [modalHistory, setModalHistory] = useState([]);

  //
  // Board Generation
  //

  // The type of game being played.
  const [gameType, setGameType] = useState(GameTypes.TRADITIONAL);

  // Board dimensions, for use with basic board generation with certain
  // gametypes.
  const [boardWidth, setBoardWidth] = useState();
  const [boardHeight, setBoardHeight] = useState();

  // The code to represent the tile structure.
  const [layoutCode, setLayoutCode] = useState();

  // Determines the "seed" for the randomized tile selection.
  const [seed, setSeed] = useState();

  // If enabled, do a faster simple shuffle that does not gaurantee
  // winnable boards, for an extra challenge.
  const [blindShuffle, setBlindShuffle] = useState();

  // Determines how the tiles are distributed on the board.
  const [tileDistribution, setTileDistribution] = useState();

  //
  // Game and Board State
  //

  // Whether or not the game ended.
  const [gameEnded, setGameEnded] = useState(true);

  // The overall tile state. Uses an array of the object
  // {id, char}
  const [tiles, setTiles] = useState([]);

  // The current selected tile.
  const [selectedTile, setSelectedTile] = useState(null);

  // Shortcut for the number of tiles.
  const [numTiles, setNumTiles] = useState(136);

  // The history of each match made in the current game. Uses an array of the
  // object {char, tile1, tile2}, with tile1 and tile2 being ids.
  const [tileHistory, setTileHistory] = useState([]);

  // List of tiles that are currently in its removal animation.
  const [tilesInRemovalAnimation, setTilesInRemovalAnimation] = useState([]);

  // All tile ids matching the same char as the selected tile. Used alongside
  // showMatchingTiles.
  const [hintedTiles, setHintedTiles] = useState([]);

  // All matching tile pairs. Uses a multi-dimensional array of the structure
  // [[tile1, tile2], ...], with tile1 and tile2 being ids.
  const [allValidMatchingTiles, setAllValidMatchingTiles] = useState([]);

  // Shuffled version of the above state, for when the player clicks the Hint
  // button to show a random match.
  const [allValidMatchesAtRandom, setAllValidMatchesAtRandom] = useState([]);

  // Determines which match from the shuffled array to display.
  const [allValidMatchesRandomCycle, setAllValidMatchesRandomCycle] =
    useState(0);

  // Determines if one of the matches from the above state are being displayed.
  const [randomMatchDisplayed, setRandomMatchDisplayed] = useState(false);

  // For certain gametypes, this shows the path between two tiles for display as
  // line segments. Uses an array for each tile location, which are arrays showing
  // the segment's direction in strings (which are concatenasted, with "-start"
  // and "-end" to show the endpoints)
  const [pathingTiles, setPathingTiles] = useState([]);

  // For certain gametpyes, this shows all the initial tile obstructions
  // (overlapping and x-adjacent).
  const [tileObstructions, setTileObstructions] = useState([]);

  // For certain gametpyes, this shows all whether or not a tile is obstructed
  // by other tiles.
  const [tileOverlapRegions, setTileOverlapRegions] = useState([]);

  // --------------
  // End State List
  // --------------

  const [searchParams] = useSearchParams();

  const timerRef = useRef();

  // First time initialization.
  useEffect(() => {
    checkFontCompatibility();

    // Get game state and URL search parameters.
    const gameState = loadGameState(),
      layoutParam = searchParams?.get("g"),
      seedParam = searchParams?.get("s"),
      blindShuffleParam = searchParams?.get("ts") !== null,
      tileDistributionParam = searchParams?.get("td");

    // Get the initial board, in order of priority:
    // - Create from URL search parameters. (Shared hyperlink)
    // - Recreate from the browser's web storage. (Persistence)
    // - Create basic board. (Default)
    if (layoutParam !== null) {
      resetGameState({
        newGameType: null,
        newLayoutCode: layoutParam,
        newSeed: seedParam,
        newBoardWidth: null,
        newBoardHeight: null,
        newBlindShuffle: blindShuffleParam,
        newTileDistribution: tileDistributionParam,
      });
    } else if (
      gameState !== null &&
      "v" in gameState &&
      gameState.v === gameStateVer
    ) {
      try {
        setTiles(gameState.tiles);
        setGameType(gameState.gameType);
        setBoardWidth(gameState.boardWidth);
        setBoardHeight(gameState.boardHeight);
        setSeed(gameState.seed);
        setLayoutCode(gameState.layoutCode);
        setBlindShuffle(gameState.blindShuffle);
        setTileDistribution(gameState.tileDistribution);
        setNumTiles(gameState.numTiles);
        setTileHistory(gameState.tileHistory);

        if (gameState.gameType === GameTypes.TRADITIONAL) {
          const obstructions = TraditionalGameType.calculateObstructedTiles({
            tiles: gameState.tiles,
            width: gameState.boardWidth,
            height: gameState.boardHeight,
          });

          setTileObstructions(obstructions.obstructedTiles);
          setTileOverlapRegions(obstructions.obstructedTileRegions);
        }

        const newTimer = new Date();

        newTimer.setSeconds(
          newTimer.getSeconds() +
            gameState.timer.seconds +
            gameState.timer.minutes * 60 +
            gameState.timer.hours * 3600
        );

        timerRef.current.reset(newTimer);

        setGameEnded(false);
      } catch (e) {
        console.log(e);

        resetGameState({
          newGameType: GameTypes.TRADITIONAL,
          newLayoutCode: null,
          newBoardWidth: null,
          newBoardHeight: null,
          newBlindShuffle: null,
          newTileDistribution: null,
        });
      }
    } else {
      resetGameState({
        newGameType: GameTypes.TRADITIONAL,
        newLayoutCode: null,
        newBoardWidth: null,
        newBoardHeight: null,
        newBlindShuffle: null,
        newTileDistribution: null,
      });
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
        console.error(e.message);
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
        console.error(e.message);
        return;
      }
    } else {
      return;
    }

    localStorage.setItem(
      "gamestate",
      JSON.stringify({
        v: gameStateVer,
        gameType: gameType,
        tiles: tiles,
        boardWidth: boardWidth,
        boardHeight: boardHeight,
        seed: seed,
        layoutCode: layoutCode,
        blindShuffle: blindShuffle,
        tileDistribution: tileDistribution,
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
              setFixRedDragonBug(true);
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
      setFixRedDragonBug(true);
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
      setFixRedDragonBug(true);
    }
  }

  // Resets the game state while generating a new board.
  function resetGameState({
    newGameType = gameType,
    newLayoutCode = layoutCode,
    newSeed,
    newBoardWidth = boardWidth,
    newBoardHeight = boardHeight,
    newBlindShuffle = blindShuffle,
    newTileDistribution = tileDistribution,
  } = {}) {
    let generatedBoard, useGameType;

    // If we're getting the new board from a layout code, base its
    // gametype on the layout code.
    if (newLayoutCode != null && newGameType === null) {
      const layoutCodeID = newLayoutCode?.slice(0, 3);
      useGameType = Object.keys(GameTypeLayoutCodeIDs).find(
        (key) => GameTypeLayoutCodeIDs[key] === layoutCodeID
      );
    } else {
      useGameType = newGameType;
    }

    try {
      if (useGameType === GameTypes.TRADITIONAL) {
        generatedBoard = TraditionalGameType.generateBoard({
          layoutCode: newLayoutCode,
          seed: newSeed,
          useBlindShuffle: newBlindShuffle,
          tileDistribution: parseInt(newTileDistribution ?? 0),
        });
      } else if (useGameType === GameTypes.TWOCORNER) {
        generatedBoard = TwoCornerGameType.generateBoard({
          layoutCode: newLayoutCode,
          boardWidth: newBoardWidth,
          boardHeight: newBoardHeight,
          seed: newSeed,
          useBlindShuffle: newBlindShuffle,
          tileDistribution: parseInt(newTileDistribution ?? 0),
        });
      } else {
        console.error("Invalid gametype selection! Cancel the board reset.");
        return;
      }
    } catch (e) {
      console.error(e.message);
      console.error("Failed to generate the board! Cancel the board reset.");
      return;
    }

    setGameType(useGameType);
    setTiles(generatedBoard.tiles);
    setBoardWidth(generatedBoard.width);
    setBoardHeight(generatedBoard.height);
    setSeed(generatedBoard.seed);
    setLayoutCode(generatedBoard.layoutCode);
    setBlindShuffle(newBlindShuffle);
    setTileDistribution(newTileDistribution);
    setNumTiles(generatedBoard.numTiles);
    setSelectedTile(null);
    setTileHistory([]);
    setHintedTiles([]);
    setAllValidMatchingTiles([]);
    setAllValidMatchesAtRandom([]);
    setTilesInRemovalAnimation([]);

    if (useGameType === GameTypes.TRADITIONAL) {
      setTileObstructions(generatedBoard.obstructedTiles);
      setTileOverlapRegions(generatedBoard.obstructedTileRegions);
    } else if (useGameType === GameTypes.TWOCORNER) {
      setPathingTiles([]);
    }

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
    let allValidMatches;

    if (gameType === GameTypes.TRADITIONAL) {
      allValidMatches = TraditionalGameType.searchAllPossibleMatches(tiles);
    } else if (gameType === GameTypes.TWOCORNER) {
      allValidMatches = TwoCornerGameType.searchAllPossibleMatches(
        tiles,
        boardWidth,
        boardHeight
      );
    }

    if (allValidMatches == null) {
      allValidMatches = [];
    }

    console.log(`Number of Valid Matches: ${allValidMatches.length}`);

    setAllValidMatchingTiles([...new Set(allValidMatches.flat())]);

    // Shuffle the valid matches array sp that when the player clicks the hint
    // button, it'll display a random match, with subsequent clicks displaying
    // another random match through the array.
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

  // Logic for clicking on a tile on the board.
  function handleTileClick(tileId) {
    if (gameType === GameTypes.TRADITIONAL) {
      const tileObj = tiles.flat().find((t) => t?.id === tileId),
        selectedTileObj = tiles.flat().find((t) => t?.id === selectedTile);

      if (tileObj == null) {
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
        selectedTileObj != null &&
        TraditionalGameType.tileMatches(tileObj, selectedTileObj)
      ) {
        // Clicked a matching tile.

        // Sanity check to see if they're both selectable.
        if (tileObj.selectable && selectedTileObj.selectable) {
          // Push the match into the tile history stack.
          setTileHistory([
            ...tileHistory,
            {
              char1: tileObj.char,
              char2: selectedTileObj.char,
              tile1: tileId,
              tile2: selectedTile,
            },
          ]);

          // Put both tiles in their removal animation.
          setTilesInRemovalAnimation([{ ...tileObj }, { ...selectedTileObj }]);

          // Blank out both tiles.

          // Update tile selectability and visibility for board. (TODO: Only
          // change affected tiles).
          const newTiles = tiles.slice();
          tileObj.char = null;
          selectedTileObj.char = null;
          setTiles(newTiles);

          TraditionalGameType.updateTileVisibilityAndSelectability(
            tileObstructions,
            tileOverlapRegions
          );

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
            setHintedTiles(
              tiles
                .flat()
                .filter((t) => t?.char === tileObj.char && !t.hidden)
                .map((t) => t.id)
            );
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
          setHintedTiles(
            tiles
              .flat()
              .filter((t) => t?.char === tileObj.char && !t.hidden)
              .map((t) => t.id)
          );
        }
      }
    } else if (gameType === GameTypes.TWOCORNER) {
      if (tiles[tileId].char === null) {
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

        const path = TwoCornerGameType.searchSimplestValidPath(
          tileId,
          selectedTile,
          tiles.slice(),
          boardWidth,
          boardHeight
        );

        if (path !== null) {
          // There is a correct path between them. These tiles are matched!

          // Push the match into the tile history stack.
          setTileHistory([
            ...tileHistory,
            {
              char: tiles[tileId].char,
              tile1: tileId,
              tile2: selectedTile,
            },
          ]);

          // Put both tiles in their removal animation.
          setTilesInRemovalAnimation([
            { ...tiles[tileId] },
            { ...tiles[selectedTile] },
          ]);

          // Blank out both tiles.
          const newTiles = tiles.slice();
          newTiles[tileId].char = null;
          newTiles[selectedTile].char = null;
          setTiles(newTiles);

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
            setHintedTiles(
              tiles
                .filter((t) => t.char === tiles[tileId].char)
                .map((t) => t.id)
            );
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
          setHintedTiles(
            tiles.filter((t) => t.char === tiles[tileId].char).map((t) => t.id)
          );
        }
      }
    }
  }

  // Revert the board to the previous state.
  function undoMatch({ doHideModal = false }) {
    if (tileHistory.length > 0) {
      if (gameType === GameTypes.TRADITIONAL) {
        const newTiles = tiles.slice();
        const lastMatch = tileHistory.slice(-1)[0];

        newTiles.flat().find((t) => t?.id === lastMatch.tile1).char =
          lastMatch.char1;
        newTiles.flat().find((t) => t?.id === lastMatch.tile2).char =
          lastMatch.char2;

        setTiles(newTiles);
        setTileHistory(tileHistory.slice(0, -1));
        setHintedTiles([]);
        setSelectedTile(null);
        setTilesInRemovalAnimation([]);

        // Update tile selectability and visibility for board. (TODO: Only
        // change affected tiles).
        TraditionalGameType.updateTileVisibilityAndSelectability(
          tileObstructions,
          tileOverlapRegions
        );
      } else if (gameType === GameTypes.TWOCORNER) {
        const newTiles = tiles.slice();
        const lastMatch = tileHistory.slice(-1)[0];

        newTiles[lastMatch.tile1].char = lastMatch.char;
        newTiles[lastMatch.tile2].char = lastMatch.char;

        setTiles(newTiles);
        setTileHistory(tileHistory.slice(0, -1));
        setHintedTiles([]);
        setPathingTiles([]);
        setSelectedTile(null);
        setTilesInRemovalAnimation([]);
      }

      if (gameEnded) timerRef.current.start();

      setGameEnded(false);

      if (doHideModal) hideModal();
    }
  }

  // Allow the board to display the next valid matching pair.
  function showOneMatch() {
    if (!canUseHint) return;

    setRandomMatchDisplayed(true);

    setAllValidMatchesRandomCycle(
      (allValidMatchesRandomCycle + 1) % allValidMatchesAtRandom.length
    );
  }

  // Display amd/or update the chosen modal.
  function showModal(newState) {
    timerRef.current.pause();

    setModalDisplayed(true);

    if (newState) {
      setModalHistory(modalHistory.concat(modalState));
      setModalState(newState);
    }
  }

  // Hide the modal.
  function hideModal() {
    if (!gameEnded) timerRef.current.start();

    setModalDisplayed(false);
    setModalHistory([]);
  }

  // Go to the previous modal in the history.
  const prevModal = () => {
    if (modalHistory.length === 0) hideModal();
    else {
      setModalState(modalHistory[modalHistory.length - 1]);
      setModalHistory(modalHistory.slice(0, -1));
    }
  };

  // Generate the URL for sharing/bookmarking the current game board.
  function generateShareUrls() {
    const layoutUrl = `${window.location.href.split("?")[0]}?g=${layoutCode}`;

    return {
      layoutUrl,
      gameUrl: `${layoutUrl}&s=${seed}${blindShuffle ? "&ts" : ""}${
        tileDistribution != TileDistributionOptions.PRIORITIZE_SINGLE_PAIRS
          ? `&td=${tileDistribution}`
          : ""
      }`,
    };
  }

  // Display the correct modal JSX.
  function renderModalBody(modalState) {
    switch (modalState) {
      case GameModals.HELP:
        return <HelpModalBody {...{ useEmoji, closeModal: hideModal }} />;
      case GameModals.PAUSE:
        return (
          <PauseModalBody
            {...{
              gameType,
              seed,
              layoutCode,
              tilesMatchable: allValidMatchingTiles.length,
              shareUrls: generateShareUrls(),
              resetGameState,
              hideModal,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
              helpModal: () => showModal(GameModals.HELP),
              settingsModal: () => showModal(GameModals.SETTINGS),
              layoutEditModal: () => showModal(GameModals.LAYOUT_EDIT),
            }}
          />
        );
      case GameModals.SETTINGS:
        return (
          <SettingsModalBody
            {...{
              backgroundColor,
              setBackgroundColor,
              backgroundImage,
              setBackgroundImage,
              lowDetailMode,
              setLowDetailMode,
              useEmoji,
              setUseEmoji,
              overrideRedDragonBugFix,
              setOverrideRedDragonBugFix,
              showAllValidMatches,
              setShowAllValidMatches,
              showMatchingTiles,
              setShowMatchingTiles,
              prevModal,
            }}
          />
        );
      case GameModals.LAYOUT_EDIT:
        return (
          <LayoutEditModalBody
            {...{
              initialLayout: layoutCode,
              startNewGame: resetGameState,
              prevModal,
            }}
          />
        );
      case GameModals.NEW_BOARD:
        return (
          <NewBoardModalBody
            {...{
              prevGameType: gameType,
              prevWidth: boardWidth,
              prevHeight: boardHeight,
              prevBlindShuffle: blindShuffle,
              prevTileDistribution: tileDistribution,
              prevSeed: seed,
              prevLayoutCode: layoutCode,
              handleResetBoard: resetGameState,
              prevModal,
            }}
          />
        );
      case GameModals.GAME_WON:
        return (
          <GameEndModalBody
            {...{
              gameWon: true,
              numTiles,
              clearTime: timerRef.current,
              gameType,
              seed,
              layoutCode,
              shareUrls: generateShareUrls(),
              handleResetBoard: resetGameState,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
              helpModal: () => showModal(GameModals.HELP),
              settingsModal: () => showModal(GameModals.SETTINGS),
              layoutEditModal: () => showModal(GameModals.LAYOUT_EDIT),
            }}
          />
        );
      case GameModals.GAME_LOST:
        return (
          <GameEndModalBody
            {...{
              gameWon: false,
              remainingTiles: numTiles - tileHistory.length * 2,
              gameType,
              seed,
              layoutCode,
              canUndo: tileHistory.length === 0,
              shareUrls: generateShareUrls(),
              handleUndoMatch: () => undoMatch({ doHideModal: true }),
              handleResetBoard: resetGameState,
              newBoardModal: () => showModal(GameModals.NEW_BOARD),
              helpModal: () => showModal(GameModals.HELP),
              settingsModal: () => showModal(GameModals.SETTINGS),
              layoutEditModal: () => showModal(GameModals.LAYOUT_EDIT),
            }}
          />
        );
      default:
        return null;
    }
  }

  // Render the game board, game bar, and modal.
  return (
    <>
      <GameBoard
        {...{
          boardWidth:
            gameType === GameTypes.TWOCORNER ? boardWidth + 2 : boardWidth,
          boardHeight:
            gameType === GameTypes.TWOCORNER ? boardHeight + 2 : boardHeight,
          tiles,
          pathingTiles,
          padBoard: gameType !== GameTypes.TWOCORNER,
          tilesInRemovalAnimation,
          hintedTiles,
          wholeMatchingTiles: showAllValidMatches
            ? allValidMatchingTiles
            : randomMatchDisplayed
            ? allValidMatchesAtRandom[allValidMatchesRandomCycle]
            : [],
          selectedTile,
          useEmoji,
          fixRedDragonBug: overrideRedDragonBugFix ?? fixRedDragonBug,
          lowDetailMode,
          handleTileClick,
        }}
      />

      <div className="game-bar">
        <button
          className="game-bar-pause-button"
          onClick={() => showModal(GameModals.PAUSE)}
        >
          <svg
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
        <div>{renderModalBody(modalState)}</div>
      </ReactModal>
    </>
  );
}
