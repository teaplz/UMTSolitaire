const AdvancedSettingsModalBody = ({
  showAllValidMatches,
  showMatchingTiles,
  useEmoji,
  toggleHighlightAllMatches,
  toggleHighlightMatchesForTile,
  toggleEmojiMode,
  backModal,
}) => {
  return (
    <div>
      <h1>Advanced Options</h1>
      <div>
        <button onClick={toggleHighlightAllMatches} style={{marginBottom: 0}}>
          {showAllValidMatches ? "Hide All Matches" : "Show All Matches"}
        </button>
        <br />
        Cheat to show every possible match at once.
      </div>
      <div>
        <button onClick={toggleHighlightMatchesForTile} style={{marginBottom: 0}}>
          {showMatchingTiles
            ? "Hide Matches For Selected Tile"
            : "Show Matches For Selected Tile"}
        </button>
        <br />
        Cheat to show every matching tile for the selected tile.
      </div>
      <div>
        <button onClick={toggleEmojiMode} style={{marginBottom: 0}}>
          {useEmoji ? "Force Text Glyphs for Tiles" : "Force Emoji for Tiles"}
        </button>
        <br />
        Click if tiles aren't displaying correctly.
      </div>
      <div>
        <button onClick={backModal}>Back to Settings</button>
      </div>
    </div>
  );
};

export default AdvancedSettingsModalBody;
