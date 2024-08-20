// Functions related to generating the board itself, including encoding/decoding
// the layout code and the procedural (or completely random) generation of the
// board's tile placement.
//
// These utilize a "layout code" in the following structure:
//
// {2CO}{xx}{x}{x}{xx}{xxxxxxxxxxxxxxxxxxxx...}
//  |    |   |  |  |   |
//  |    |   |  |  |   Tile Layout (base-32)
//  |    |   |  |  Simple Checksum of Tile Layout (base-32)
//  |    |   |  Board Height (base-32)
//  |    |   Board Width (base-32)
//  |    Layout Code Version ID (base-32)
//  GameType ID (should always be "MJS")
//
// The tile layout is dynamically-sized and and currently consists of a binary
// mask for when tiles exist in each area of the grid
// (min # of digits per line * num of lines)

import { GameTypeLayoutCodeIDs, GameTypes } from "../../util/GameTypes";

export const MAX_BOARD_WIDTH = 20,
  MAX_BOARD_HEIGHT = 12;

const LAYOUT_CODE_VERSION_NUMBER = 1,
  layoutCodeRadix = 32,
  layoutCodeRadixBits = 5; // log_2(layoutCodeRadix)

// Generate a layout code, either from a specified layout mask or from
// a simple full rectangle of a specified size.
export function generateLayoutCode({ layoutMask, width, height }) {
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
    throw new Error("Invalid width or height.");
  }

  // First four parts of the layout code.
  let layoutCode = "";
  layoutCode += GameTypeLayoutCodeIDs[GameTypes.TWOCORNER];
  layoutCode += LAYOUT_CODE_VERSION_NUMBER.toString(32).padStart(2, "0");
  layoutCode += w.toString(32).slice(0, 1);
  layoutCode += h.toString(32).slice(0, 1);

  let tileLayout = "";

  const digitsPerLine = Math.ceil((width + 1) / layoutCodeRadixBits);

  if (layoutMask != null) {
    for (let y = 0; y < height; y++) {
      tileLayout += parseInt(
        ("1" + layoutMask.slice(y * width, (y + 1) * width)).padEnd(
          digitsPerLine * layoutCodeRadixBits,
          "0"
        ),
        2
      ).toString(layoutCodeRadix);
    }
  } else {
    const lineMask = "1"
      .repeat(width + 1)
      .padEnd(digitsPerLine * layoutCodeRadixBits, "0");

    // If we have an odd amount of tiles in general, both width and height are
    // odd. To keep things even, we make the centermost tile empty.
    const removeCenterTile = width % 2 !== 0 && height % 2 !== 0;

    for (let i = 0; i < height; i++) {
      if (removeCenterTile && i === height >> 1) {
        tileLayout += parseInt(
          lineMask.slice(0, (width >> 1) + 1) +
            "0" +
            lineMask.slice((width >> 1) + 2),
          2
        ).toString(layoutCodeRadix);
      } else {
        tileLayout += parseInt(lineMask, 2).toString(layoutCodeRadix);
      }
    }
  }

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

// Decode and validate the layout code.
export function generateBoardLayout(layoutCode) {
  if (
    layoutCode === null ||
    layoutCode.length < 6 ||
    layoutCode.slice(0, 3) !== GameTypeLayoutCodeIDs[GameTypes.TWOCORNER]
  ) {
    throw new Error("Invalid layout code.");
  }

  const layoutCodeVer = parseInt(layoutCode.slice(3, 5), 32);

  // If we want backwards-compatibility support, here would be the place to
  // do it.
  if (layoutCodeVer !== LAYOUT_CODE_VERSION_NUMBER) {
    throw new Error("Invalid layout code.");
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
    throw new Error("Invalid layout code.");
  }

  // Check tile layout with its checksum.
  if (getChecksumForTileLayout(tileLayout) !== tileLayoutChecksum) {
    throw new Error("Invalid layout code, checksum doesn't match.");
  }

  // Decompress tile layout.
  tileLayoutCompressSubstitution.forEach(
    (str, index) =>
      (tileLayout = tileLayout.replaceAll(
        String.fromCharCode("G".charCodeAt() + index),
        str
      ))
  );

  const digitsPerLine = Math.ceil((boardWidth + 1) / layoutCodeRadixBits);

  if (tileLayout.length !== digitsPerLine * boardHeight) {
    throw new Error("Invalid layout code.");
  }

  let layoutMask = "";

  for (let i = 0; i < boardHeight; i++) {
    const nextWidth = parseInt(
      tileLayout.slice(i * digitsPerLine, (i + 1) * digitsPerLine),
      layoutCodeRadix
    );

    if (isNaN(nextWidth)) {
      throw new Error("Invalid layout code.");
    }

    layoutMask += nextWidth.toString(2).slice(1, boardWidth + 1);
  }

  return { layoutMask, width: boardWidth, height: boardHeight };
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
  "g0000g0000g0000g0000", // G
  "vvvvgvvvvgvvvvgvvvvg", // H
  null, // I
  "g0000g0000", // J
  "vvvvgvvvvg", // K
  "000080000080", // L
  "000000", // M
  "vvvvvv", // N
  null, // O
  "g0000", // P
  "001g", // Q
  "0000", // R
  "vvvvg", // S
  "vvvv", // T
  null, // U
  "vvvs", // V
  "vvs", // W
  "vvv", // X
  "vu", // Y
  "vv", // Z
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
