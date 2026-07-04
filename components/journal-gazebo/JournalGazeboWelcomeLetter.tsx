"use client";

import { useEffect, useState } from "react";
import {
  JOURNAL_WELCOME_NOTE_CLOSING,
  JOURNAL_WELCOME_NOTE_PARAGRAPHS,
  JOURNAL_WELCOME_NOTE_SIGN,
  JOURNAL_WELCOME_NOTE_TITLE,
} from "@/lib/journalGazebo/hospitality";
import { JournalGazeboLeatherOvalCta } from "./JournalGazeboLeatherOvalCta";

type Props = {
  visible: boolean;
  folding?: boolean;
  onCreateJournal: () => void;
};

/**
 * Open 4×6 bifold — flame, Welcome, filigree, Shari's words, gold invitation.
 */
export function JournalGazeboWelcomeLetter({
  visible,
  folding = false,
  onCreateJournal,
}: Props) {
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowInvite(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => setShowInvite(true),
      reduced ? 120 : 1400,
    );
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <div
      className={[
        "jg-welcome-note",
        "jg-cinematic-letter",
        "jg-cinematic-letter--bifold-note",
        visible ? "jg-cinematic-letter--visible" : "",
        folding ? "jg-cinematic-letter--folding" : "",
        showInvite ? "jg-welcome-note--invite-ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label="Welcome note from Shari"
    >
      <article className="jg-cinematic-letter__sheet jg-welcome-note__sheet">
        <span className="jg-cinematic-letter__texture" aria-hidden="true" />
        <span className="jg-welcome-note__emboss-border" aria-hidden="true" />
        <span
          className="jg-welcome-note__fold-line jg-welcome-note__fold-line--center"
          aria-hidden="true"
        />

        <header className="jg-welcome-note__head">
          <span className="jg-welcome-note__foil-flame jg-estate-flame" aria-hidden="true" />
          <h1 className="jg-welcome-note__welcome-title">{JOURNAL_WELCOME_NOTE_TITLE}</h1>
          <span className="jg-welcome-note__filigree" aria-hidden="true" />
        </header>

        <div className="jg-cinematic-letter__body jg-welcome-note__body--handwritten">
          {JOURNAL_WELCOME_NOTE_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <p className="jg-welcome-note__closing">{JOURNAL_WELCOME_NOTE_CLOSING}</p>
          <p className="jg-cinematic-letter__sign jg-welcome-note__sign">
            {JOURNAL_WELCOME_NOTE_SIGN}
          </p>
        </div>

        {showInvite ? (
          <div className="jg-welcome-note__invite jg-welcome-note__invite--in-card">
            <JournalGazeboLeatherOvalCta onClick={onCreateJournal} />
          </div>
        ) : null}
      </article>
    </div>
  );
}
