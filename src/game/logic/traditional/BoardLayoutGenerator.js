// Functions related to generating the board itself, including encoding/decoding
// the layout code and the procedural (or completely random) generation of the
// board's tile placement.
//
// These utilize a "layout code" in the following structure:
//
// {MJS}{xx}{x}{x}{xx}{xxxxxxxxxxxxxxxxxxxx...}
//  |    |   |  |  |   |
//  |    |   |  |  |   Tile Layout (see below)
//  |    |   |  |  Simple Checksum of Tile Layout (base-32)
//  |    |   |  Board Height (base-32)
//  |    |   Board Width (base-32)
//  |    Layout Code Version ID (base-32)
//  GameType ID (should always be "MJS")
//
// The tile layout is dynamically-sized and consist of the following repeating
// sequence until all tile placements are taken care of:
//
// Scanning the board, from left-to-right, wrapping between rows:
//
// {1111111}{1111111}{1111111}{11111111} - 7+7+7+8 = 29-bit
//  |        |        |        |
//  |        |        |        Amount of empty spaces before this one.
//  |        |        Bit mask of placed tiles, by height.
//  |        Bit mask of tiles, by height, that are half-shifted rightward.
//  Bit mask of tiles, by height, that are half-shifted downward.
//
// This value is encoded to a six-character base-32 string. When the layout
// string is complete, it receives multiple passes through a
// subtitution array (see tileLayoutCompressSubstitution) for common
// patterns as a form of compression (using uppercase letters)
//
// The entire layout code, sans both identifiers, is run through vowel
// substitution passes to avoid accidentally forming profanity that might
// trip social media checks when shared.

import { GameTypeLayoutCodeIDs } from "../../util/GameTypes";

export const MAX_BOARD_WIDTH = 20,
  MAX_BOARD_HEIGHT = 12,
  MAX_BOARD_DEPTH = 7;

const LAYOUT_CODE_VERSION_NUMBER = 1;

export function generateLayoutCode({ tiles, width, height }) {
  let layoutCode,
    tileLayout = "",
    curSegment = 0;

  let w = parseInt(width),
    h = parseInt(height);

  if (
    isNaN(w) ||
    isNaN(h) ||
    w < 1 ||
    h < 1 ||
    w > MAX_BOARD_WIDTH ||
    h > MAX_BOARD_HEIGHT
  ) {
    console.error("generateLayoutCodeFromBoard: Invalid width or height.");
    return null;
  }

  // First four parts of the layout code.
  layoutCode = GameTypeLayoutCodeIDs.TRADITIONAL;
  layoutCode += LAYOUT_CODE_VERSION_NUMBER.toString(32).padStart(2, "0");
  layoutCode += w.toString(32).slice(0, 1);
  layoutCode += h.toString(32).slice(0, 1);

  // Generate tile layout part of the layout code.
  tiles.forEach((v) => {
    if (v.length > 0) {
      curSegment = Math.min(curSegment, 255);

      v.forEach((t, i) => {
        if (t !== null && i < MAX_BOARD_DEPTH) {
          curSegment |= 1 << (i + 8);
          if (t.xhalfstep) curSegment |= 1 << (i + 15);
          if (t.yhalfstep) curSegment |= 1 << (i + 22);
        }
      });

      tileLayout += curSegment.toString(32).padStart(6, 0);
      curSegment = 0;
    } else {
      curSegment++;
    }
  });

  // After 32-bit encoding, compress by running the overall tile layout
  // through multiple substitution passes that utilize uppercase alphabet
  // characters.
  //
  // (value at array index) => 'F' + (array index)
  tileLayoutCompressSubstitution.forEach(
    (str, index) =>
      (tileLayout = tileLayout.replaceAll(
        str,
        String.fromCharCode("G".charCodeAt() + index)
      ))
  );

  // Fifth and final parts of the layout code. First is the checksum of the tile
  // layout to prevent random tampering, then it's the tile layout itself.
  layoutCode += getChecksumForTileLayout(tileLayout) + tileLayout;

  // Run the entire layout code, sans identifiers, through multiple vowel
  // subsitution passes, sanitizing it for shareability.
  let layoutCodeWithoutIDs = layoutCode.slice(5);

  layoutCodeVowelSubstitutions.unusedLowercase.forEach(
    (ch, index) =>
      (layoutCodeWithoutIDs = layoutCodeWithoutIDs.replaceAll(
        ch,
        String.fromCharCode("w".charCodeAt() + index)
      ))
  );
  layoutCodeVowelSubstitutions.unusedUppercase.forEach(
    (ch, index) =>
      (layoutCodeWithoutIDs = layoutCodeWithoutIDs.replaceAll(
        ch,
        String.fromCharCode("B".charCodeAt() + index)
      ))
  );

  // Combine identifiers with the sanitized portion of the layout code to
  // finalize.
  layoutCode = layoutCode.slice(0, 5).concat(layoutCodeWithoutIDs);

  return layoutCode;
}

export function generateBoardLayout(layoutCode) {
  if (
    layoutCode === null ||
    layoutCode.length < 6 ||
    layoutCode.slice(0, 3) !== GameTypeLayoutCodeIDs.TRADITIONAL
  ) {
    return null;
  }

  const layoutCodeVer = parseInt(layoutCode.slice(3, 5), 32);

  // If we want backwards-compatibility support, here would be the place to
  // do it.
  if (layoutCodeVer !== LAYOUT_CODE_VERSION_NUMBER) {
    return null;
  }

  // Unsanitize layout code.
  let layoutCodeWithoutIDs = layoutCode.slice(5);

  layoutCodeVowelSubstitutions.unusedLowercase.forEach(
    (ch, index) =>
      (layoutCodeWithoutIDs = layoutCodeWithoutIDs.replaceAll(
        String.fromCharCode("w".charCodeAt() + index),
        ch
      ))
  );
  layoutCodeVowelSubstitutions.unusedUppercase.forEach(
    (ch, index) =>
      (layoutCodeWithoutIDs = layoutCodeWithoutIDs.replaceAll(
        String.fromCharCode("B".charCodeAt() + index),
        ch
      ))
  );

  let boardWidth = parseInt(layoutCodeWithoutIDs.slice(0, 1), 32);
  let boardHeight = parseInt(layoutCodeWithoutIDs.slice(1, 2), 32);
  let tileLayoutChecksum = layoutCodeWithoutIDs.slice(2, 4);
  let tileLayout = layoutCodeWithoutIDs.slice(4);

  // Validate the rest of the layout code.
  if (
    isNaN(boardWidth) ||
    isNaN(boardHeight) ||
    boardWidth < 1 ||
    boardHeight < 1 ||
    boardWidth > MAX_BOARD_WIDTH ||
    boardHeight > MAX_BOARD_HEIGHT ||
    tileLayoutChecksum === "" ||
    tileLayout === ""
  ) {
    return null;
  }

  // Check tile layout with its checksum.
  if (getChecksumForTileLayout(tileLayout) !== tileLayoutChecksum) {
    return null;
  }

  // Decompress tile layout.
  tileLayoutCompressSubstitution.forEach(
    (str, index) =>
      (tileLayout = tileLayout.replaceAll(
        String.fromCharCode("G".charCodeAt() + index),
        str
      ))
  );

  // Parse tile layout.
  const maxTilesSize = boardWidth * boardHeight;
  let tiles = [],
    tileStrPointer = 0;

  // For each coordinate with tiles on it, add tiles to the tile layout array.
  while (tileStrPointer < tileLayout.length) {
    let curCoord = parseInt(
      tileLayout.slice(tileStrPointer, tileStrPointer + 6),
      32
    );

    tileStrPointer += 6;

    const emptySpacesBefore = curCoord % (1 << 8),
      tileMask = (curCoord >>> 8) % (1 << 7),
      tileXHS = (curCoord >>> 15) % (1 << 7),
      tileYHS = (curCoord >>> 22) % (1 << 7);

    // Malformed layout code, somehow.
    if (tiles.length + emptySpacesBefore + 1 > maxTilesSize) return null;

    // Empty spaces prior to this coordinate.
    for (let i = 0; i < emptySpacesBefore; i++) {
      tiles.push(null);
    }

    // Push tiles into the coordinate, with null entries as "empty space".
    tiles.push(
      Array.from({ length: 32 - Math.clz32(tileMask) }, (_, i) => {
        if ((tileMask & (1 << i)) > 0) {
          return {
            xhalfstep: (tileXHS & (1 << i)) > 0,
            yhalfstep: (tileYHS & (1 << i)) > 0,
          };
        } else {
          return null;
        }
      })
    );
  }

  // Pad out the remaining coordinates.
  while (tiles.length < maxTilesSize) {
    tiles.push(null);
  }

  return { tiles, width: boardWidth, height: boardHeight };
}

// Quick-and-dirty checksum generator. Generates a 3-bit base-32 string from
// the input.
function getChecksumForTileLayout(str) {
  let checksum = 0;

  for (let i = 0; i < str.length; i++) {
    checksum += str.charCodeAt(i);
  }

  return (checksum % 1024).toString(32);
}

// For subtituting common patterns for compression. Runs top-to-bottom.
// Starts at "G" (after vowel subtitution) and ignores vowels.
const tileLayoutCompressSubstitution = [
  "0000o00000o00000o00000o0", // G
  "000080000080000080000080", // H
  null, // I
  "0001o00001o0", // J
  "0000o00000o0", // K
  "000080000080", // L
  "0007o0", // M
  "0003o0", // N
  null, // O
  "0001o0", // P
  "0000o0", // Q
  "000080", // R
  "0007o", // S
  "0003o", // T
  null, // U
  "0001o", // V
  "0000o", // W
  "00008", // X
  "000", // Y
  "00", // Z
];

// For subtitutiting out vowels. It happens at the very end when encoding and at
// the very beginning when decoding.
const layoutCodeVowelSubstitutions = {
  // Starts at the letter "w" (base32 ends at "v").
  unusedLowercase: [
    "a", // w
    "e", // x
    "i", // y
    "o", // z
  ],
  // Starts at the letter "B" ("A" will not be used).
  unusedUppercase: [
    "u", // B
    "0", // C
    "1", // D
    null, // E
    "3", // F
  ],
};

// Used for debugging purposes. This is a manual recreation of the classic
// "Turtle" layout. Not efficient in the slightest. May delete at some point.
export function generateTurtleBoard() {
  const tiles = Array.from({ length: 15 * 8 }, (_) => []);

  // Row 1
  for (let x = 1; x < 13; x++) tiles[15 * 0 + x].push({});
  // Row 2
  for (let x = 3; x < 11; x++) tiles[15 * 1 + x].push({});
  for (let x = 4; x < 10; x++) tiles[15 * 1 + x].push({});
  // Row 3
  for (let x = 2; x < 12; x++) tiles[15 * 2 + x].push({});
  for (let x = 4; x < 10; x++) tiles[15 * 2 + x].push({});
  for (let x = 5; x < 9; x++) tiles[15 * 2 + x].push({});
  // Row 4
  for (let x = 0; x < 1; x++) tiles[15 * 3 + x].push({ yhalfstep: true });
  for (let x = 1; x < 13; x++) tiles[15 * 3 + x].push({});
  for (let x = 13; x < 15; x++) tiles[15 * 3 + x].push({ yhalfstep: true });
  for (let x = 4; x < 10; x++) tiles[15 * 3 + x].push({});
  for (let x = 5; x < 9; x++) tiles[15 * 3 + x].push({});
  for (let x = 6; x < 8; x++) tiles[15 * 3 + x].push({});
  for (let x = 6; x < 7; x++)
    tiles[15 * 3 + x].push({
      xhalfstep: true,
      yhalfstep: true,
    });
  // Row 5
  for (let x = 1; x < 13; x++) tiles[15 * 4 + x].push({});
  for (let x = 4; x < 10; x++) tiles[15 * 4 + x].push({});
  for (let x = 5; x < 9; x++) tiles[15 * 4 + x].push({});
  for (let x = 6; x < 8; x++) tiles[15 * 4 + x].push({});
  // Row 6
  for (let x = 2; x < 12; x++) tiles[15 * 5 + x].push({});
  for (let x = 4; x < 10; x++) tiles[15 * 5 + x].push({});
  for (let x = 5; x < 9; x++) tiles[15 * 5 + x].push({});
  // Row 7
  for (let x = 3; x < 11; x++) tiles[15 * 6 + x].push({});
  for (let x = 4; x < 10; x++) tiles[15 * 6 + x].push({});
  // Row 8
  for (let x = 1; x < 13; x++) tiles[15 * 7 + x].push({});

  return tiles;
}
