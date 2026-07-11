"use client";

import { useEffect, useId, useRef, useState } from "react";
import { journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import {
  JOURNAL_TABLE_CREATE,
  JOURNAL_TABLE_OPEN,
} from "@/lib/journalGazebo/hospitality";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
  /** Photo-plate welcome scene uses absolute positioning on the desk image. */
  layout?: "welcome-plate" | "sanctuary";
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

/** Estate green plaque buttons — Create New Journal / Open My Journal. */
export function JournalGazeboTableActions({
  journals,
  onCreateJournal,
  onOpenJournal,
  layout = "welcome-plate",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const hasMultiple = journals.length > 1;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function handleOpenMyJournal() {
    if (journals.length === 0) {
      onCreateJournal();
      return;
    }
    if (journals.length === 1) {
      onOpenJournal(journals[0]!);
      return;
    }
    setMenuOpen((open) => !open);
  }

  return (
    <div
      className={[
        "jg-table-actions",
        layout === "sanctuary" ? "jg-table-actions--sanctuary" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="jg-table-actions__plaque jg-table-actions__plaque--create"
        onClick={onCreateJournal}
      >
        <span className="jg-table-actions__plaque-title">
          {JOURNAL_TABLE_CREATE.title}
        </span>
        <span className="jg-table-actions__plaque-sub">
          {JOURNAL_TABLE_CREATE.subtitle}
        </span>
      </button>

      <div
        ref={menuRef}
        className={[
          "jg-table-actions__open-wrap",
          menuOpen ? "jg-table-actions__open-wrap--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className="jg-table-actions__plaque jg-table-actions__plaque--open"
          onClick={handleOpenMyJournal}
          aria-haspopup={hasMultiple ? "listbox" : undefined}
          aria-expanded={hasMultiple ? menuOpen : undefined}
          aria-controls={hasMultiple ? menuId : undefined}
        >
          <span className="jg-table-actions__plaque-title">
            {JOURNAL_TABLE_OPEN.title}
            {hasMultiple ? (
              <span className="jg-table-actions__caret" aria-hidden="true">
                ▼
              </span>
            ) : null}
          </span>
          <span className="jg-table-actions__plaque-sub">
            {JOURNAL_TABLE_OPEN.subtitle}
          </span>
          <WelcomeDeskQuillIcon />
        </button>

        {hasMultiple && menuOpen ? (
          <ul
            id={menuId}
            className="jg-table-actions__menu"
            role="listbox"
            aria-label="Choose a journal"
          >
            {journals.map((journal) => (
              <li key={journal.id} role="none">
                <button
                  type="button"
                  className="jg-table-actions__menu-item"
                  role="option"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenJournal(journal);
                  }}
                >
                  {journalCoverTitle(journal)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
