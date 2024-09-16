export const GameTypes = Object.freeze({
  TRADITIONAL: "TRADITIONAL",
  TWOCORNER: "TWOCORNER",
});

export const GameTypeLayoutCodeIDs = Object.freeze({
  [GameTypes.TRADITIONAL]: "MJS",
  [GameTypes.TWOCORNER]: "2CO",
});

export const GameTypeStrings = Object.freeze({
  [GameTypes.TRADITIONAL]: "Traditional Mahjong Tile Solitaire",
  [GameTypes.TWOCORNER]: "Two-Corner Mahjong Tile Solitaire"
});

export const GameTypeShortStrings = Object.freeze({
  [GameTypes.TRADITIONAL]: "Traditional",
  [GameTypes.TWOCORNER]: "Two-Corner"
});