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

import { GameTypeLayoutCodeIDs, GameTypes } from "../../GameTypes";

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
    throw new Error("Invalid width or height.");
  }

  // First four parts of the layout code.
  layoutCode = GameTypeLayoutCodeIDs[GameTypes.TRADITIONAL];
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
  // (value at array index) => 'G' + (array index)

  // Basic substitution (L-Z)

  tileLayoutCompressSubstitution.forEach(
    (str, index) =>
      (tileLayout = tileLayout.replaceAll(
        str,
        String.fromCharCode("L".charCodeAt() + index)
      ))
  );

  // Repeater checks (G-K). Replaces repeating patterns of a certain number
  // of characters with the following sequence:
  // {x}{x}{x...}
  //  |  |  |
  //  |  |  The pattern.
  //  |  How many times to repeat. 32-bit number.
  //  The pattern size. See tileLayoutRepeatCompressSubstitution array.

  let tempTileLayout = "";

  for (let i = 0; i < tileLayout.length; i++) {
    let repeats = 0,
      curRepeatSize = tileLayoutRepeatCompressLargestSequence + 1;

    while (
      curRepeatSize >
        tileLayoutRepeatCompressLargestSequence -
          tileLayoutRepeatCompressSubstitution.length +
          1 &&
      repeats < 1
    ) {
      repeats = 0;
      curRepeatSize--;

      // Ignore at edge of string.
      if (i + 2 * curRepeatSize >= tileLayout.length) {
        continue;
      }

      while (
        repeats < 31 &&
        i + (repeats + 2) * curRepeatSize < tileLayout.length &&
        tileLayout.substring(
          i + repeats * curRepeatSize,
          i + (repeats + 1) * curRepeatSize
        ) ===
          tileLayout.substring(
            i + (repeats + 1) * curRepeatSize,
            i + (repeats + 2) * curRepeatSize
          )
      ) {
        repeats++;
      }
    }

    if (repeats > 0) {
      tempTileLayout +=
        tileLayoutRepeatCompressSubstitution[
          tileLayoutRepeatCompressLargestSequence - curRepeatSize
        ] +
        repeats.toString(32) +
        tileLayout.substring(i, i + curRepeatSize);

      i += (repeats + 1) * curRepeatSize - 1;
    } else {
      tempTileLayout += tileLayout[i];
    }
  }

  tileLayout = tempTileLayout;

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
    typeof layoutCode !== 'string' ||
    layoutCode.length < 6 ||
    layoutCode.slice(0, 3) !== GameTypeLayoutCodeIDs[GameTypes.TRADITIONAL]
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

  // Repeater checks (G-K). When x (num of characters in sequence) is reached,
  // replace x + y (num of repeats) + z (sequence) with z * y+1.
  let doAnotherCycle = true;
  let cycle = 0;

  while (doAnotherCycle) {
    cycle++;

    if (cycle === 5) {
      throw new Error("Invalid layout code.");
    }

    doAnotherCycle = false;
    let tempTileLayout = "";

    for (let i = 0; i < tileLayout.length; i++) {
      // Check if this is the first part in a repeat check.
      let repeatSize = tileLayoutRepeatCompressSubstitution.findIndex(
        (sub) => sub === tileLayout[i]
      );

      if (repeatSize !== -1) {
        repeatSize = tileLayoutRepeatCompressLargestSequence - repeatSize;

        // If there is a nested repeat check, there will be a next cycle.
        if (
          Array.from(tileLayout.substring(i + 1, i + 2 + repeatSize)).some(
            (c) => tileLayoutRepeatCompressSubstitution.includes(c)
          )
        ) {
          doAnotherCycle = true;
          tempTileLayout += tileLayout[i];
        } else {
          tempTileLayout += tileLayout
            .substring(i + 2, i + 2 + repeatSize)
            .repeat(parseInt(tileLayout[i + 1], 32) + 1);
          i += 1 + repeatSize;
        }
      } else {
        tempTileLayout += tileLayout[i];
      }
    }

    tileLayout = tempTileLayout;
  }

  // Basic substitution (L-Z)
  tileLayoutCompressSubstitution.forEach(
    (str, index) =>
      (tileLayout = tileLayout.replaceAll(
        String.fromCharCode("L".charCodeAt() + index),
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
    if (tiles.length + emptySpacesBefore + 1 > maxTilesSize) {
      console.error("Layout code attempted to push beyond boundary.");
      break;
    }

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

  return (checksum % 1024).toString(32).padStart(2, "0");
}

// For subtituting common patterns for compression. Runs top-to-bottom.
// Starts at "L" (after vowel subtitution and repeating checks) and
// ignores vowels.
const tileLayoutCompressSubstitution = [
  "000000000000", // L
  "0000o0", // M
  "000080", // N
  null, // O
  "0000", // P
  "000", // Q
  "vo", // R
  "fo", // S
  "7o", // T
  null, // U
  "3o", // V
  "1o", // W
  "0o", // X
  "08", // Y
  "00", // Z
];

// For the initial character in repeat check sequences, determining the number
// of characters in each pattern.
const tileLayoutRepeatCompressLargestSequence = 6;
const tileLayoutRepeatCompressSubstitution = [
  "G", // 6
  "H", // 5
  "J", // 4
  "K", // 3
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
