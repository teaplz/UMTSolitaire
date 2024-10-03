import { HexColorPicker } from "react-colorful";

import { BACKGROUND_COLOR_DEFAULT } from "../../App";
import { useState } from "react";

const BackgroundColorModalBody = ({
  backgroundColor,
  backgroundImage,
  setBackgroundColor,
  setBackgroundImage,
  prevModal,
}) => {
  const [newBackgroundColor, setNewBackgroundColor] = useState(backgroundColor);
  const [newBackgroundImage, setNewBackgroundImage] = useState(
    backgroundImage || ""
  );

  const [displayAdvanced, setDisplayAdvanced] = useState(false);

  return (
    <>
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

export default BackgroundColorModalBody;
