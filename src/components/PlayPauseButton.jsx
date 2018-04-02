import React from "react";
import { button, pauseIcon, playIcon } from "./PlayPauseButton.module.css";

export default function PlayPauseButton({ playing, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={button}
      type="button"
    >
      <span className={playing ? pauseIcon : playIcon}>
        {playing ? "Pause" : "Play"}
      </span>
    </button>
  );
}
