"use client";

import {
  JOURNAL_TABLE_CREATE,
  JOURNAL_TABLE_WRITE,
} from "@/lib/journalGazebo/hospitality";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

export type JournalGazeboTableActionsMode = "first-visit" | "returning";

type Props = {
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
  /** When several journals exist — open the chooser (includes remove). */
  onBrowseJournals?: () => void;
  /** Photo-plate welcome scene uses absolute positioning on the desk image. */
  layout?: "welcome-plate" | "sanctuary";
  /**
   * First visit: Create only (no Write, no journal list).
   * Returning: Create + Write (+ selection when multiple journals).
   */
  mode?: JournalGazeboTableActionsMode;
};

function WelcomeDeskQuillIcon() {
  return (
    <svg
      className="jg-table-actions__quill"
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

/** Estate green plaque buttons — Create New Journal / Write. */
export function JournalGazeboTableActions({
  journals,
  onCreateJournal,
  onOpenJournal,
  onBrowseJournals,
  layout = "welcome-plate",
  mode = "returning",
}: Props) {
  const showWrite = mode === "returning";
  const hasChooser = journals.length >= 1;

  function handleWrite() {
    if (journals.length === 0) {
      onCreateJournal();
      return;
    }
    // Always open the chooser so the member sees their journals and can resume.
    if (onBrowseJournals) {
      onBrowseJournals();
      return;
    }
    if (journals.length === 1) {
      onOpenJournal(journals[0]!);
      return;
    }
    onOpenJournal(journals[0]!);
  }

  return (
    <div
      className={[
        "jg-table-actions",
        layout === "sanctuary" ? "jg-table-actions--sanctuary" : "",
        mode === "first-visit" ? "jg-table-actions--first-visit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="jg-table-actions"
      data-actions-mode={mode}
    >
      <button
        type="button"
        className="jg-table-actions__plaque jg-table-actions__plaque--create"
        onClick={onCreateJournal}
        data-testid="jg-create-new-journal"
      >
        <span className="jg-table-actions__plaque-title">
          {JOURNAL_TABLE_CREATE.title}
        </span>
        <span className="jg-table-actions__plaque-sub">
          {JOURNAL_TABLE_CREATE.subtitle}
        </span>
      </button>

      {showWrite ? (
        <div className="jg-table-actions__open-wrap">
          <button
            type="button"
            className="jg-table-actions__plaque jg-table-actions__plaque--open"
            onClick={handleWrite}
            aria-haspopup={hasChooser ? "dialog" : undefined}
            data-testid="jg-write-journal"
          >
            <span className="jg-table-actions__plaque-title">
              {JOURNAL_TABLE_WRITE.title}
              {hasChooser ? (
                <span className="jg-table-actions__caret" aria-hidden="true">
                  ▼
                </span>
              ) : null}
            </span>
            <span className="jg-table-actions__plaque-sub">
              {JOURNAL_TABLE_WRITE.subtitle}
            </span>
            <WelcomeDeskQuillIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
