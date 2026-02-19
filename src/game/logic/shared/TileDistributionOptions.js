export const TileDistributionOptions = Object.freeze({
  // For each full set of tiles, have it use one of each pair for all tiles
  // before moving on to their next.
  //
  // Smaller Board - Pairs (A,B,C,A,B,C)
  // Larger Board  - Pairs (A,B,C,A,B,C)
  //
  // This approach allows smaller boards to show all tile designs (with 50%
  // boards showing at least one pair), but make them easy due to the lack of
  // ambiguous matches.
  SINGLE_PAIRS: 0,

  // When the board does not use a complete set of tiles, have it use all four
  // of a tile before moving on to the next tile. Beyond one full set of tiles,
  // use one of each pair before moving to their next.
  //
  // Smaller Board - Quads (A,A,B,B,C,C)
  // Larger Board  - Pairs (A,B,C,A,B,C)
  //
  // This is the most balanced approach, allowing more ambiguous matches with
  // smaller boards (at the cost of less uniqute tile designs), but skewing
  // larger boards towards less ambiguous matches.
  PRIORITIZE_BOTH_PAIRS: 1,

  // For each full set of tiles, have it use all four of a tile before moving
  // on to the next tile.
  //
  // Smaller Board - Quads (A,A,B,B,C,C)
  // Larger Board  - Quads (A,A,B,B,C,C)
  //
  // This approach is similar to PRIORITIZE_BOTH_PAIRS for smaller baords, but
  // potentially makes larger boards more difficult due to more ambiguous
  // matches.
  ALWAYS_BOTH_PAIRS: 2,

  // For each full set of tiles, use a random assortment.
  //
  // This is a more realistic approach, similar to dumping entire sets on the
  // board until it fills up the layout.
  RANDOM_PER_SET: 3,

  // Use a completely random assortment of tile pairs.
  //
  // This is the least realistic approach, but can be funny.
  RANDOM: 4,
});

export const TileDistributionOptionDescriptions = Object.freeze({
  [TileDistributionOptions.SINGLE_PAIRS]: `A balanced approach where, for each full set of tiles, 
  it uses one pair of each tile before moving on to their next pair. Shows more unique tiles for smaller boards,
  but makes them much easier.`,

  [TileDistributionOptions.PRIORITIZE_BOTH_PAIRS]: `A balanced approach where, for the first full set of tiles,
  it uses both pairs of each tile before moving on to the next tile. For each set of tiles afterwards, it uses
  one pair of each tile before moving on to their next pair.`,

  [TileDistributionOptions.ALWAYS_BOTH_PAIRS]: `A balanced approach where, for each full set of tiles,  it uses 
  both pairs of each tile before moving on to the next tile. Makes larger boards potentially more difficult.`,

  [TileDistributionOptions.RANDOM_PER_SET]: `A realistic approach where, for each full set of tiles, it uses a random
  assortment.`,

  [TileDistributionOptions.RANDOM]: `Use a completely random assortment of tile pairs. This is the least realistic
  approach, but can be funny.`,
});
