import { HexColorPicker } from "react-colorful";

import { BACKGROUND_COLOR_DEFAULT } from "../../App";
import { useState } from "react";

const SettingsModalBody = ({
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
}) => {
  const [newBackgroundColor, setNewBackgroundColor] = useState(backgroundColor);
  const [newBackgroundImage, setNewBackgroundImage] = useState(
    backgroundImage || ""
  );

  const [newUseEmoji, setNewUseEmoji] = useState(useEmoji);
  const [newOverrideRedDragonBugFix, setNewOverrideRedDragonBugFix] = useState(
    overrideRedDragonBugFix == null ? "auto" : overrideRedDragonBugFix
  );
  const [newLowDetailMode, setNewLowDetailMode] = useState(lowDetailMode);

  const [newShowAllValidMatches, setNewShowAllValidMatches] =
    useState(showAllValidMatches);
  const [newShowMatchingTiles, setNewShowMatchingTiles] =
    useState(showMatchingTiles);

  const [displayAdvanced, setDisplayAdvanced] = useState(false);
  
  // After clicking the Advanced Settings button 10 times, it brings up special
  // "debugging" (cheating) options.
  const [debugDisplayCounter, setDebugDisplayCounter] = useState(0);

  return (
    <>
      <h1>Settings</h1>
      <hr />
      <div>
        <h2>
          <label htmlFor="optBgColor">Change Background Color</label>
        </h2>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <HexColorPicker
            color={newBackgroundColor}
            onChange={setNewBackgroundColor}
            style={{
              width: "75%",
            }}
          />
          <div
            style={{
              backgroundColor: newBackgroundColor,
              width: "20%",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: "1em" }}>
        <button
          onClick={() => {
            setNewBackgroundColor(BACKGROUND_COLOR_DEFAULT);
            setNewBackgroundImage("");
          }}
        >
          Reset Background
        </button>
      </div>
      <hr />
      <div>
        <button
          onClick={() => {
            setDisplayAdvanced(!displayAdvanced);
            setDebugDisplayCounter(debugDisplayCounter + 1);
          }}
        >
          {displayAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>
      </div>
      {displayAdvanced && (
        <>
          <div style={{ paddingTop: "1em" }}>
            <input
              type="checkbox"
              id="optLowDetail"
              checked={newLowDetailMode}
              onChange={() => setNewLowDetailMode(!newLowDetailMode)}
            ></input>
            <label htmlFor="optLowDetail">
              Low Detail Mode - Enable if performance is slow.
            </label>
          </div>
          <div style={{ paddingTop: "1em" }}>
            <input
              type="checkbox"
              id="optUseEmoji"
              checked={newUseEmoji}
              onChange={() => setNewUseEmoji(!newUseEmoji)}
            ></input>
            <label htmlFor="optUseEmoji">
              Use Emoji - May not work with most browsers.
            </label>
          </div>
          <div style={{ paddingTop: "1em" }}>
            <label htmlFor="selRedDragonFix">
              "Red Dragon" tile replacement:&nbsp;
            </label>
            <select
              id="selRedDragonFix"
              onChange={({ target: { value: v } }) =>
                setNewOverrideRedDragonBugFix(v)
              }
              defaultValue={overrideRedDragonBugFix}
            >
              <option value="auto">Auto</option>
              <option value="true">Enable</option>
              <option value="false">Disable</option>
            </select>
            <br />
            Change if the Red Dragon tile is drastically different from the
            others.
          </div>
          {debugDisplayCounter > 9 && (
            <>
              <div style={{ marginTop: "2em" }}>
                <div>
                  <input
                    type="text"
                    id="optBgImage"
                    value={newBackgroundImage}
                    onChange={(e) => setNewBackgroundImage(e.target.value)}
                    style={{
                      width: "70%",
                    }}
                  ></input>
                </div>
                <div>
                  <label htmlFor="optBgImage">
                    Background Image URL (optional, animated backgrounds may
                    decrease performance and battery life)
                  </label>
                </div>
              </div>
              <div style={{ paddingTop: "1em" }}>
                <input
                  type="checkbox"
                  id="optShowMatchingTiles"
                  checked={newShowMatchingTiles}
                  onChange={() =>
                    setNewShowMatchingTiles(!newShowMatchingTiles)
                  }
                ></input>
                <label htmlFor="optShowMatchingTiles">
                  Show all matches for selected tile.
                </label>
              </div>
              <div style={{ paddingTop: "1em" }}>
                <input
                  type="checkbox"
                  id="optShowAllValidMatches"
                  checked={newShowAllValidMatches}
                  onChange={() =>
                    setNewShowAllValidMatches(!newShowAllValidMatches)
                  }
                ></input>
                <label htmlFor="optShowAllValidMatches">
                  Show all valid matches.
                </label>
              </div>
            </>
          )}
        </>
      )}
      <hr />
      <div>
        <button
          onClick={() => {
            setBackgroundColor(newBackgroundColor);
            setBackgroundImage(
              newBackgroundImage != "" ? newBackgroundImage : null
            );
            setLowDetailMode(newLowDetailMode);
            setUseEmoji(newUseEmoji);
            setOverrideRedDragonBugFix(
              newOverrideRedDragonBugFix == "auto"
                ? null
                : newOverrideRedDragonBugFix == "true"
            );
            setShowMatchingTiles(newShowMatchingTiles);
            setShowAllValidMatches(newShowAllValidMatches);
            prevModal();
          }}
          className="large-button"
        >
          Accept Changes
        </button>
        <button onClick={prevModal} className="large-button">
          Cancel Changes
        </button>
      </div>
    </>
  );
};

export default SettingsModalBody;
