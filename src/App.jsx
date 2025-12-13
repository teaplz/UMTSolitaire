import "./App.css";

import { useEffect, useState } from "react";

import Game from "./game/Game";

export const BACKGROUND_COLOR_DEFAULT = "#153737";

function App() {
  const [preload, setPreload] = useState(true);

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
        backgroundColor,
        backgroundImage,
      })
    );
  }, [backgroundColor, backgroundImage]);

  return (
    <div
      className="App"
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage?.trim()
          ? `url(${backgroundImage})`
          : "",
      }}
    >
      <Game
        {...{
          backgroundColor,
          backgroundImage,
          setBackgroundColor,
          setBackgroundImage,
        }}
      />
    </div>
  );
}

export default App;
