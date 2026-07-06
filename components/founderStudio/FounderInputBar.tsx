"use client";

import { useState } from "react";

export function FounderInputBar() {
  const [value, setValue] = useState("");

  return (
    <form
      className="founder-input-bar"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label className="sr-only" htmlFor="founder-studio-prompt">
        What would help most right now?
      </label>
      <input
        id="founder-studio-prompt"
        className="founder-input-bar__field"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask Spark, FLAME, or FIRE…"
        autoComplete="off"
      />
      <button
        type="button"
        className="founder-input-bar__mic"
        aria-label="Voice input — coming soon"
        title="Voice input — coming soon"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </button>
    </form>
  );
}
