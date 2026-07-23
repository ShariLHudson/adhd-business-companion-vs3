"use client";

import {
  JOURNAL_DONE_HINT,
  JOURNAL_DONE_LABEL,
} from "@/lib/journalGazebo/hospitality";
import { JournalGazeboSaveButton } from "./JournalGazeboSaveButton";

type Props = {
  onDone: () => void;
  onSave?: () => void;
};

/** Save + Done — save keeps pages; Done returns to the gazebo shelf. */
export function JournalGazeboDoneButton({ onDone, onSave }: Props) {
  return (
    <div className="jg-journal-done" data-testid="journal-gazebo-actions">
      {onSave ? <JournalGazeboSaveButton onSave={onSave} /> : null}
      <button
        type="button"
        className="jg-journal-done__plaque"
        onClick={onDone}
        title={JOURNAL_DONE_HINT}
        data-testid="journal-gazebo-done"
      >
        <span className="jg-journal-done__title">{JOURNAL_DONE_LABEL}</span>
      </button>
    </div>
  );
}
