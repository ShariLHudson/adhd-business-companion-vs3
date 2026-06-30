"use client";

import type { WorkspaceMode } from "./types";
import { COMPANION_PRIMARY, COMPANION_QUESTION } from "./mockData";

type WorkspaceCompanionProps = {
  mode: WorkspaceMode;
};

export function WorkspaceCompanion({ mode }: WorkspaceCompanionProps) {
  const quiet = mode === "review";
  const slim = mode === "writing";

  return (
    <aside
      className={`sw-companion sw-companion--${mode}${quiet ? " sw-companion--quiet" : ""}${slim ? " sw-companion--slim" : ""}`}
      aria-label="Spark Companion"
    >
      <h2 className="sw-companion__title">Spark Companion</h2>

      {!slim && (
        <div className="sw-companion__body">
          <p className="sw-companion__primary">{COMPANION_PRIMARY}</p>
          {!quiet && (
            <p className="sw-companion__question">{COMPANION_QUESTION}</p>
          )}
          {quiet && (
            <p className="sw-companion__aside">
              I&apos;ll stay close while you review. Tap Ask Spark when you want
              a second look.
            </p>
          )}
        </div>
      )}

      {slim && (
        <p className="sw-companion__slim-note">
          I&apos;m here while you write.
        </p>
      )}

      <form
        className="sw-companion__ask"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          className="sw-companion__input"
          placeholder="Ask Spark…"
          aria-label="Ask Spark"
        />
        <button
          type="button"
          className="sw-companion__mic"
          aria-label="Voice input"
        >
          <span className="sw-companion__mic-dot" aria-hidden />
        </button>
      </form>
    </aside>
  );
}
