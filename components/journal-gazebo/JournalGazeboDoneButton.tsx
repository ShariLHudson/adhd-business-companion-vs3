"use client";

import { JOURNAL_DONE_HINT, JOURNAL_DONE_LABEL } from "@/lib/journalGazebo/hospitality";

type Props = {
  onDone: () => void;
};

/** Primary exit from journaling — returns to gazebo and reveals the personal shelf. */
export function JournalGazeboDoneButton({ onDone }: Props) {
  return (
    <div className="jg-journal-done">
      <button
        type="button"
        className="jg-journal-done__plaque"
        onClick={onDone}
        title={JOURNAL_DONE_HINT}
      >
        <span className="jg-journal-done__title">{JOURNAL_DONE_LABEL}</span>
      </button>
    </div>
  );
}
