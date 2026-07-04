"use client";

import { useEffect, useRef, useState } from "react";
import { JOURNAL_TOOLS } from "@/lib/journalGazebo/hospitality";

type Props = {
  onReadAloud?: () => void;
  readAloudSupported?: boolean;
  isListening?: boolean;
  onReturnToGazebo: () => void;
  onChooseAnotherJournal: () => void;
  onWritingPreferences?: () => void;
  onPrint: () => void;
  printDisabled?: boolean;
  onToggleTime: () => void;
  showTime: boolean;
  onCloseJournal?: () => void;
};

/** Upper-right journal utilities — beneath sound control, never overlaps Estate Guide. */
export function JournalGazeboOptionsMenu({
  onReadAloud,
  readAloudSupported = false,
  isListening = false,
  onReturnToGazebo,
  onChooseAnotherJournal,
  onWritingPreferences,
  onPrint,
  printDisabled = false,
  onToggleTime,
  showTime,
  onCloseJournal,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {open ? (
        <button
          type="button"
          className="jg-journal-options__backdrop"
          aria-label="Close journal options"
          onClick={close}
        />
      ) : null}

      <div className="jg-journal-options" ref={panelRef}>
        <button
          type="button"
          className="jg-journal-options__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="jg-journal-options-panel"
        >
          {open ? "Close" : "Journal Options"}
        </button>

        {open ? (
          <div
            id="jg-journal-options-panel"
            className="jg-journal-options__panel"
            role="menu"
          >
            {readAloudSupported && onReadAloud ? (
              <button
                type="button"
                className="jg-journal-options__item"
                role="menuitem"
                onClick={() => {
                  onReadAloud();
                  close();
                }}
                aria-pressed={isListening}
              >
                {isListening ? JOURNAL_TOOLS.listening : JOURNAL_TOOLS.speak}
              </button>
            ) : null}
            {onWritingPreferences ? (
              <button
                type="button"
                className="jg-journal-options__item"
                role="menuitem"
                onClick={() => {
                  onWritingPreferences();
                  close();
                }}
              >
                {JOURNAL_TOOLS.writingStyle}
              </button>
            ) : null}
            <button
              type="button"
              className="jg-journal-options__item"
              role="menuitem"
              onClick={() => {
                onToggleTime();
              }}
            >
              {showTime ? JOURNAL_TOOLS.hideClock : JOURNAL_TOOLS.showClock}
            </button>
            <button
              type="button"
              className="jg-journal-options__item"
              role="menuitem"
              onClick={() => {
                onChooseAnotherJournal();
                close();
              }}
            >
              {JOURNAL_TOOLS.chooseAnother}
            </button>
            <button
              type="button"
              className="jg-journal-options__item"
              role="menuitem"
              onClick={() => {
                onReturnToGazebo();
                close();
              }}
            >
              {JOURNAL_TOOLS.returnGazebo}
            </button>
            {onCloseJournal ? (
              <button
                type="button"
                className="jg-journal-options__item jg-journal-options__item--close"
                role="menuitem"
                onClick={() => {
                  onCloseJournal();
                  close();
                }}
              >
                {JOURNAL_TOOLS.closeJournal}
              </button>
            ) : null}
            <button
              type="button"
              className="jg-journal-options__item"
              role="menuitem"
              disabled={printDisabled}
              onClick={() => {
                onPrint();
                close();
              }}
            >
              Print This Page
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
