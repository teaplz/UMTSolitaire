import { HexColorPicker } from "react-colorful";

import { BackgroundOptions, BACKGROUND_COLOR_DEFAULT } from "../../App";
import { useState } from "react";

const BackgroundColorModalBody = ({
  backgroundOption,
  backgroundColor,
  backgroundImage,
  setBackgroundOption,
  setBackgroundColor,
  setBackgroundImage,
  backModal,
}) => {
  const [newBackgroundColor, setNewBackgroundColor] = useState(backgroundColor);
  const [newBackgroundImage, setNewBackgroundImage] = useState(
    backgroundImage || ""
  );
  const [newBackgroundOption, setNewBackgroundOption] =
    useState(backgroundOption);

  const [displayAdvanced, setDisplayAdvanced] = useState(false);

  return (
    <div>
      <div>
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
        <label htmlFor="optBgColor">Change Background Color</label>
      </div>
      <div style={{ marginTop: "1em" }}>
        <button
          onClick={() => {
            setNewBackgroundColor(BACKGROUND_COLOR_DEFAULT);
            setNewBackgroundImage("");
            setNewBackgroundOption(BackgroundOptions.BACKGROUND_NORMAL);
          }}
        >
          Reset Background
        </button>
      </div>
      <hr />
      <button onClick={() => setDisplayAdvanced(!displayAdvanced)}>
        {displayAdvanced ? "Hide" : "Show"} Advanced Settings
      </button>
      {displayAdvanced && (
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
          <div style={{ marginTop: "2em" }}>
            <input
              type="checkbox"
              id="optAnimatedBg"
              checked={
                newBackgroundOption === BackgroundOptions.BACKGROUND_FANCY
              }
              onChange={() =>
                setNewBackgroundOption(
                  newBackgroundOption === BackgroundOptions.BACKGROUND_FANCY
                    ? BackgroundOptions.BACKGROUND_NORMAL
                    : BackgroundOptions.BACKGROUND_FANCY
                )
              }
            ></input>
            <label htmlFor="optAnimatedBg">
              Enable Fancy Animated Background (ignores all of the above, may
              decrease performance and battery life)
            </label>
          </div>
        </>
      )}
      <hr />
      <div>
        <button
          onClick={() => {
            setBackgroundOption(newBackgroundOption);
            setBackgroundColor(newBackgroundColor);
            setBackgroundImage(
              newBackgroundImage != "" ? newBackgroundImage : null
            );
            backModal();
          }}
          className="large-button"
        >
          Accept Changes
        </button>
        <button onClick={backModal} className="large-button">
          Cancel Changes
        </button>
      </div>
    </div>
  );
};

export default BackgroundColorModalBody;
