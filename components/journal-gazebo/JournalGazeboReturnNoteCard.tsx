"use client";

import type { JournalGazeboReturnNote } from "@/lib/journalGazebo/returnGreetings";

type Props = {
  note: JournalGazeboReturnNote;
};

/** Return-visit desk note from Shari — sits where the welcome letter was on first visit. */
export function JournalGazeboReturnNoteCard({ note }: Props) {
  return (
    <article
      className="jg-return-note"
      aria-label={`Note from Shari: ${note.greeting} ${note.question}`}
    >
      <div className="jg-return-note__texture" aria-hidden="true" />
      <p className="jg-return-note__greeting">{note.greeting}</p>
      <p className="jg-return-note__question">{note.question}</p>
      <p className="jg-return-note__sign">{note.sign}</p>
    </article>
  );
}
