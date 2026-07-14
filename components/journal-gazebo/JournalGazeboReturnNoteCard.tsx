"use client";

import type { JournalGazeboReturnNote } from "@/lib/journalGazebo/returnGreetings";

type Props = {
  note: JournalGazeboReturnNote;
};

/** Return-visit desk note — small physical card on the table (not a center overlay). */
export function JournalGazeboReturnNoteCard({ note }: Props) {
  const body = note.body || [note.greeting, note.question].filter(Boolean).join(" ");

  return (
    <article
      className="jg-return-note"
      data-testid="jg-return-desk-note"
      data-desk-note="true"
      aria-label={`Note from Shari: ${body}`}
    >
      <div className="jg-return-note__texture" aria-hidden="true" />
      <p className="jg-return-note__greeting">{body}</p>
      <p className="jg-return-note__sign">{note.sign}</p>
    </article>
  );
}
