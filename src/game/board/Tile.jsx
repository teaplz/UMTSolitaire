import ClassNames from "classnames";

// The component for each individual tile, displayed as a mahjong tile from
// the Mahjong Tiles Unicode block (U+1F000 to U+1F02B).
export default function Tile({
  char,
  isSelected,
  canBeMatchedWithSelected,
  canBeMatchedWithOther,
  useEmoji,
  fixRedDragonBugs,
}) {
  // Check if tile is valid to display. They should be sent in the "char"
  // property from 0 (U+1F000) to 43 (U+1F02B).

  if (typeof char !== "number" || char < 0x00 || char > 0x2b) {
    return (
      <span className="game-tile-empty">&#x1F02B;{!useEmoji && "\uFE0E"}</span>
    );
  }

  // Colorize the tile by status.
  let tileStatusClass;

  // Whether or not the tile is currently selected.
  if (isSelected) tileStatusClass = "game-tile-selected";
  // Whether or not the tile is highlighted as a valid match of a currently selected tile.
  else if (canBeMatchedWithSelected) tileStatusClass = "game-tile-hint-current";
  // Whether or not the tile is highlighted as a valid match in general.
  else if (canBeMatchedWithOther) tileStatusClass = "game-tile-hint-all";

  if (useEmoji) {
    // In certain versions of Windows, change the revamped Red Dragon emoji
    // to one of the Flower emojis (Plum?)
    if (char === 0x04 && fixRedDragonBugs) char = 0x22;

    // If we're using the non-standard emoji variant, just display them normally.
    return (
      <span className={tileStatusClass}>
        {String.fromCodePoint(0x1f000 + char)}
      </span>
    );
  } else {
    // If we're using the standard text presentation, make them colorized.
    let tileColorClass;

    if ((char >= 0x07 && char <= 0x0f) || char === 0x04) {
      // Characters and Red Dragon
      tileColorClass = "game-tile-glyph-red";

      // In certain browsers, change the Red Dragon glyph to a re-colored
      // White Dragon glyph so that it isn't forced as an emoji.
      if (char === 0x04 && fixRedDragonBugs) char = 0x06;
    } else if ((char >= 0x10 && char <= 0x18) || char === 0x05) {
      // Bamboos and Green Dragon
      tileColorClass = "game-tile-glyph-green";
    } else if (
      (char >= 0x19 && char <= 0x21) ||
      char === 0x06 ||
      char === 0x2b
    ) {
      // Pins and White Dragon
      tileColorClass = "game-tile-glyph-blue";
    } else if (char >= 0x22 && char <= 0x25) {
      // Flowers
      tileColorClass = "game-tile-glyph-flowers";
    } else if (char >= 0x26 && char <= 0x29) {
      // Seasons
      tileColorClass = "game-tile-glyph-seasons";
    }

    // Don't render an empty class attribute if both values are empty.
    const classNames = ClassNames(tileColorClass, tileStatusClass);

    return (
      <span className={classNames === "" ? null : classNames}>
        {String.fromCodePoint(0x1f000 + char)}&#xFE0E;
      </span>
    );
  }
}
