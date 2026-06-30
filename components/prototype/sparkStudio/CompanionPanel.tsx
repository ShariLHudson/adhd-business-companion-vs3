"use client";

import type { CompanionMode } from "./types";
import {
  COMPANION_GUIDE_QUESTION,
  COMPANION_OPENING,
  COMPANION_OPTIONS,
} from "./mockData";

type CompanionPanelProps = {
  mode: CompanionMode;
  dimmed?: boolean;
  onGuide: () => void;
  onOptions: () => void;
  onWriteFirst: () => void;
};

export function CompanionPanel({
  mode,
  dimmed,
  onGuide,
  onOptions,
  onWriteFirst,
}: CompanionPanelProps) {
  const showActions = mode === "default";

  return (
    <aside
      className={`spark-studio-companion${dimmed ? " spark-studio-companion--dimmed" : ""}`}
      aria-label="Spark Companion"
    >
      <h2 className="spark-studio-companion__title">Spark Companion</h2>

      <div className="spark-studio-companion__message">
        {mode === "default" && (
          <p className="spark-studio-companion__text">
            {COMPANION_OPENING.split("\n\n").map((paragraph) => (
              <span key={paragraph.slice(0, 24)}>
                {paragraph}
                <br />
                <br />
              </span>
            ))}
          </p>
        )}
        {mode === "guide" && (
          <p className="spark-studio-companion__text spark-studio-companion__text--focus">
            {COMPANION_GUIDE_QUESTION}
          </p>
        )}
        {mode === "options" && (
          <ul className="spark-studio-companion__options">
            {COMPANION_OPTIONS.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        )}
        {mode === "writeFirst" && (
          <p className="spark-studio-companion__text spark-studio-companion__text--quiet">
            I&apos;ll stay nearby while you write. Say the word when you want me
            back in.
          </p>
        )}
      </div>

      {showActions && (
        <div className="spark-studio-companion__actions">
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--soft"
            onClick={onGuide}
          >
            Yes, guide me
          </button>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--soft"
            onClick={onOptions}
          >
            Show me options
          </button>
          <button
            type="button"
            className="spark-studio-btn spark-studio-btn--soft"
            onClick={onWriteFirst}
          >
            Let me write first
          </button>
        </div>
      )}

      <form
        className="spark-studio-companion__input"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          className="spark-studio-companion__field"
          placeholder="Share a thought…"
          aria-label="Message Spark Companion"
        />
        <button
          type="button"
          className="spark-studio-companion__icon-btn"
          aria-label="Voice input"
        >
          <span aria-hidden>🎙</span>
        </button>
        <button
          type="submit"
          className="spark-studio-companion__icon-btn spark-studio-companion__icon-btn--send"
          aria-label="Send message"
        >
          <span aria-hidden>→</span>
        </button>
      </form>
    </aside>
  );
}
