export const TileDistributionOptions = Object.freeze({
  // For each full set of tiles, have it use one of each pair for all tiles 
  // before moving on to their next.
  //
  // Smaller Board - Pairs (A,B,C,A,B,C)
  // Larger Board  - Pairs (A,B,C,A,B,C)
  //
  // This is a balanced approach, with smaller boards having a better chance of
  // showing each tile design (with 50% boards showing at least one pair) and 
  // larger boards distributing the tiles evenly.
  PRIORITIZE_SINGLE_PAIRS: 0,

  // When the board does not use a complete set of tiles, have it use all four
  // of a tile before moving on to the next tile. Beyond one full set of tiles,
  // use one of each pair before moving to their next.
  //
  // Smaller Board - Quads (A,A,B,B,C,C)
  // Larger Board  - Pairs (A,B,C,A,B,C)
  //
  // This is a balanced approach, similar to PRIORITIZE_SINGLE_PAIRS, but can 
  // make the game easier for smaller boards due to skewed tile distribution.
  PRIORITIZE_BOTH_PAIRS: 1,

  // For each full set of tiles, have it use all four of a tile before moving 
  // on to the next tile.
  //
  // Smaller Board - Quads (A,A,B,B,C,C)
  // Larger Board  - Quads (A,A,B,B,C,C)
  //
  // It is similar to PRIORITIZE_BOTH_PAIRS, but makes the tile distribution 
  // skewed for both smaller and larger boards and makes the game easier.
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
