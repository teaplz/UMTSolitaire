import "./App.css";

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Game from "./game/Game";

export const BackgroundOptions = {
  BACKGROUND_NORMAL: "BACKGROUND_NORMAL",
  BACKGROUND_FANCY: "BACKGROUND_FANCY",
};

export const BACKGROUND_COLOR_DEFAULT = "#153737";

function App() {
  const [preload, setPreload] = useState(true);

  const [backgroundOption, setBackgroundOption] = useState(
    BackgroundOptions.BACKGROUND_NORMAL
  );

  const [backgroundColor, setBackgroundColor] = useState(
    BACKGROUND_COLOR_DEFAULT
  );

  const [backgroundImage, setBackgroundImage] = useState(null);

  // Get the current state from the browser's web stoarge.
  useEffect(() => {
    // Check if LocalStorage is active.
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("test", "1");
        if (localStorage.getItem("test") === "1") {
          localStorage.removeItem("test");
        }
      } catch (e) {
        return;
      }
    } else {
      return;
    }

    const appSettingsJson = localStorage.getItem("appSettings");
    const appSettings = JSON.parse(appSettingsJson);

    if (appSettings !== null) {
      setBackgroundOption(appSettings.backgroundOption);
      setBackgroundColor(appSettings.backgroundColor);
      setBackgroundImage(appSettings.backgroundImage);
    }

    setPreload(false);
  }, []);

  // Save the current state to the browser's web storage.
  useEffect(() => {
    if (preload) {
      return;
    }

    // Check if LocalStorage is active.
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("test", "1");
        if (localStorage.getItem("test") === "1") {
          localStorage.removeItem("test");
        }
      } catch (e) {
        return;
      }
    } else {
      return;
    }

    localStorage.setItem(
      "appSettings",
      JSON.stringify({
        backgroundOption,
        backgroundColor,
        backgroundImage,
      })
    );
  }, [backgroundOption, backgroundColor, backgroundImage]);

  return (
    <div
      className={`App ${
        backgroundOption === BackgroundOptions.BACKGROUND_FANCY
          ? "animatedBackground"
          : ""
      }`}
      style={{
        backgroundColor: backgroundColor,
        backgroundImage:
          backgroundOption === BackgroundOptions.BACKGROUND_NORMAL &&
          backgroundImage?.trim()
            ? `url(${backgroundImage})`
            : "",
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="*"
            element={
              <Game
                {...{
                  backgroundOption,
                  backgroundColor,
                  backgroundImage,
                  setBackgroundOption,
                  setBackgroundColor,
                  setBackgroundImage,
                }}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
