"use client";

import {
  JOURNAL_SAVE_HINT,
  JOURNAL_SAVE_LABEL,
} from "@/lib/journalGazebo/hospitality";

type Props = {
  onSave: () => void;
  disabled?: boolean;
};

/** Explicit save — keeps all pages and resumes on this page next time. */
export function JournalGazeboSaveButton({ onSave, disabled }: Props) {
  return (
    <button
      type="button"
      className="jg-journal-done__plaque jg-journal-done__plaque--save"
      onClick={onSave}
      disabled={disabled}
      title={JOURNAL_SAVE_HINT}
      data-testid="journal-gazebo-save"
    >
      <span className="jg-journal-done__title">{JOURNAL_SAVE_LABEL}</span>
    </button>
  );
}
