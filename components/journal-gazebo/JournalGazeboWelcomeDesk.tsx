"use client";

import { useLayoutEffect, useRef } from "react";
import {
  JOURNAL_WELCOME_CREATE_FIRST,
  JOURNAL_WELCOME_OPEN_TODAY,
} from "@/lib/journalGazebo/hospitality";

type Props = {
  sceneComposed?: boolean;
  onCreateJournal: () => void;
  onOpenToday: () => void;
  hasSavedJournals?: boolean;
};

function WelcomeDeskQuillIcon() {
  return (
    <svg
      className="jg-welcome-desk__quill"
      viewBox="0 0 24 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M20.2 2.4c-.8 1.6-2.1 3.4-3.8 5.1-1.4 1.4-3 2.6-4.6 3.5l-.4.2.2.4c1.8 3.4 2.4 6.8 1.8 10.1-.3 1.6-1 3.1-2 4.4l-.3.4-.5-.3c-1.2-.7-2.1-1.7-2.7-2.9-.5-1-.7-2.1-.6-3.2.1-1.4.7-2.8 1.6-3.9.8-1 1.9-1.8 3.1-2.3 2.6-1.1 5.5-1.3 8.4-.7l.5.1.3-.5c.9-1.5 1.4-3 1.5-4.5.1-1.2-.1-2.2-.6-3.1L21 1.2l-.8 1.2zM8.4 16.8c-.5.8-.8 1.7-.9 2.6-.1.8 0 1.5.3 2.1.4.8 1.1 1.5 2 1.9l.2.1c.4-1 .6-2 .7-3 .4-2.4 0-4.9-1.2-7.3l-.1-.2c-1 .5-1.9 1.2-2.6 2-.7.8-1.2 1.7-1.4 2.7z"
      />
      <path
        fill="currentColor"
        opacity="0.55"
        d="M3.5 28.8c2.2-1.2 4.5-2.8 6.6-4.8 1.2-1.1 2.2-2.4 3-3.8l.2-.4-1.1-.6c-1.5 2.2-3.4 4.1-5.6 5.6-1.4.9-2.9 1.6-4.4 2.1l1.3 1.9z"
      />
    </svg>
  );
}

/**
 * Photo-scene welcome — letter plate with estate green plaque buttons on the desk.
 */
export function JournalGazeboWelcomeDesk({
  sceneComposed = false,
  onCreateJournal,
  onOpenToday,
  hasSavedJournals = false,
}: Props) {
  const deskRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sceneComposed) return;

    const syncPlateBounds = () => {
      const background = document.querySelector<HTMLImageElement>(
        ".journal-gazebo--welcome-letter .journal-gazebo__background",
      );
      const desk = deskRef.current;
      if (!background || !desk) return;

      const rect = background.getBoundingClientRect();
      desk.style.top = `${rect.top}px`;
      desk.style.left = `${rect.left}px`;
      desk.style.width = `${rect.width}px`;
      desk.style.height = `${rect.height}px`;
      desk.style.transform = "none";
      desk.style.maxHeight = "none";
      desk.style.maxWidth = "none";
    };

    syncPlateBounds();
    window.addEventListener("resize", syncPlateBounds);

    const background = document.querySelector<HTMLImageElement>(
      ".journal-gazebo--welcome-letter .journal-gazebo__background",
    );
    background?.addEventListener("load", syncPlateBounds);

    return () => {
      window.removeEventListener("resize", syncPlateBounds);
      background?.removeEventListener("load", syncPlateBounds);
    };
  }, [sceneComposed]);

  if (!sceneComposed) return null;

  return (
    <div ref={deskRef} className="jg-welcome-desk" aria-label="Welcome to the Journal Gazebo">
      <div
        className={[
          "jg-welcome-desk__actions",
          !hasSavedJournals ? "jg-welcome-desk__actions--single" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className="jg-welcome-desk__plaque jg-welcome-desk__plaque--create"
          onClick={onCreateJournal}
        >
          <span className="jg-welcome-desk__plaque-title">
            {JOURNAL_WELCOME_CREATE_FIRST.title}
          </span>
          <span className="jg-welcome-desk__plaque-sub">
            {JOURNAL_WELCOME_CREATE_FIRST.subtitle}
          </span>
        </button>

        {hasSavedJournals ? (
          <button
            type="button"
            className="jg-welcome-desk__plaque jg-welcome-desk__plaque--open"
            onClick={onOpenToday}
          >
            <span className="jg-welcome-desk__plaque-title">
              {JOURNAL_WELCOME_OPEN_TODAY.title}
            </span>
            <span className="jg-welcome-desk__plaque-sub">
              {JOURNAL_WELCOME_OPEN_TODAY.subtitle}
            </span>
            <WelcomeDeskQuillIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}
