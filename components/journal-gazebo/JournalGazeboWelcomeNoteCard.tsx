"use client";

import { useEffect, useState } from "react";
import type { JournalNoteCardBeat } from "@/lib/journalGazebo/cinematicTypes";
import {
  JOURNAL_WELCOME_NOTE_CLOSING,
  JOURNAL_WELCOME_NOTE_PARAGRAPHS,
  JOURNAL_WELCOME_NOTE_SIGN,
  JOURNAL_WELCOME_NOTE_TITLE,
} from "@/lib/journalGazebo/hospitality";
import { formatNoteCardAddress } from "@/lib/journalGazebo/memberDisplayName";
import { JournalGazeboLeatherOvalCta } from "./JournalGazeboLeatherOvalCta";

import { JOURNAL_GAZEBO_BACKGROUND_URL } from "@/lib/journalGazebo/journalGazeboMedia";

const GAZEBO_NOTE_ART = JOURNAL_GAZEBO_BACKGROUND_URL;

type Props = {
  beat: JournalNoteCardBeat;
  memberName?: string;
  clickable: boolean;
  onOpen: () => void;
  onCreateJournal?: () => void;
};

/**
 * 4×6 portrait top-fold — closed: half height (flap face only).
 * Open: ~⅔ viewport height; lift top flap to reveal full interior.
 */
export function JournalGazeboWelcomeNoteCard({
  beat,
  memberName = "",
  clickable,
  onOpen,
  onCreateJournal,
}: Props) {
  const animating = beat !== "waiting";
  const { line: addressLine } = formatNoteCardAddress(memberName);
  const flapOpen =
    beat === "flap-lift" ||
    beat === "flap-open" ||
    beat === "flap-bottom" ||
    beat === "revealed" ||
    beat === "complete";
  const showInterior = beat === "revealed" || beat === "complete";
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!showInterior) {
      setShowInvite(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setShowInvite(true), reduced ? 100 : 700);
    return () => window.clearTimeout(timer);
  }, [showInterior]);

  useEffect(() => {
    if (beat === "complete") setShowInvite(true);
  }, [beat]);

  return (
    <div
      className={[
        "jg-topfold-card",
        animating ? `jg-topfold-card--${beat}` : "",
        flapOpen ? "jg-topfold-card--flap-open" : "",
        showInterior ? "jg-topfold-card--show-interior" : "",
        clickable ? "jg-topfold-card--clickable" : "",
        showInvite ? "jg-topfold-card--invite" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onOpen : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? "Open the welcome note" : "Welcome note from Shari"}
    >
      <div className="jg-topfold-card__shadow" aria-hidden="true" />

      <div className="jg-topfold-card__stage">
        <div className="jg-topfold-card__inside">
          <div className="jg-topfold-card__paper-texture" aria-hidden="true" />
          <div className="jg-topfold-card__emboss" aria-hidden="true" />
          <div className="jg-topfold-card__crease" aria-hidden="true" />

          {showInterior ? (
            <div className="jg-topfold-card__content">
              <header className="jg-topfold-card__head">
                <h1 className="jg-topfold-card__title">{JOURNAL_WELCOME_NOTE_TITLE}</h1>
                <div className="jg-topfold-card__filigree" aria-hidden="true" />
              </header>
              <div className="jg-topfold-card__body">
                {JOURNAL_WELCOME_NOTE_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
                <p className="jg-topfold-card__closing">{JOURNAL_WELCOME_NOTE_CLOSING}</p>
                <p className="jg-topfold-card__sign">{JOURNAL_WELCOME_NOTE_SIGN}</p>
              </div>
              <div
                className="jg-topfold-card__gazebo-art"
                style={{ backgroundImage: `url(${GAZEBO_NOTE_ART})` }}
                aria-hidden="true"
              />
              {showInvite && onCreateJournal ? (
                <div
                  className="jg-topfold-card__cta"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <JournalGazeboLeatherOvalCta onClick={onCreateJournal} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="jg-topfold-card__flap">
          <div className="jg-topfold-card__paper-texture" aria-hidden="true" />
          <div className="jg-topfold-card__flap-face">
            <p className="jg-topfold-card__address">{addressLine}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
