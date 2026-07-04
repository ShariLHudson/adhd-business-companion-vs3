"use client";

import type { JournalCeremonyStep, JournalGazeboConfig } from "@/lib/journalGazebo/types";
import {
  JOURNAL_CEREMONY_DEDICATION_TITLE,
  JOURNAL_CEREMONY_TODAY_INTRO,
  JOURNAL_CEREMONY_WELCOME_BODY,
  JOURNAL_CEREMONY_WELCOME_TITLE,
  JOURNAL_TOOLS,
} from "@/lib/journalGazebo/hospitality";

type Props = {
  step: JournalCeremonyStep;
  config: JournalGazeboConfig;
  memberFirstName?: string;
  dateLabel?: string;
  timeLabel?: string;
  onTurnPage: () => void;
};

/** First opening — dedication, welcome, then today's page preview. */
export function JournalGazeboCeremonyPage({
  step,
  config,
  memberFirstName = "",
  dateLabel = "",
  timeLabel = "",
  onTurnPage,
}: Props) {
  const ownerName = memberFirstName.trim() || config.name.trim();

  return (
    <div className="journal-gazebo__ceremony" data-ceremony-step={step}>
      {step === 0 ? (
        <div className="journal-gazebo__ceremony-sheet journal-gazebo__ceremony-sheet--belongs">
          <div className="journal-gazebo__ceremony-gold-box">
            <p className="journal-gazebo__ceremony-kicker">
              {JOURNAL_CEREMONY_DEDICATION_TITLE}
            </p>
            <p className="journal-gazebo__ceremony-name">{ownerName}</p>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="journal-gazebo__ceremony-sheet journal-gazebo__ceremony-sheet--letter">
          <h2 className="journal-gazebo__ceremony-welcome-title">
            {JOURNAL_CEREMONY_WELCOME_TITLE}
          </h2>
          <p>{JOURNAL_CEREMONY_WELCOME_BODY}</p>
        </div>
      ) : null}

      {step === 2 ? (
        <div
          className="journal-gazebo__ceremony-sheet journal-gazebo__ceremony-sheet--today"
          data-paper={config.paperStyle}
        >
          <p className="journal-gazebo__ceremony-meta">{dateLabel}</p>
          <p className="journal-gazebo__ceremony-meta">{timeLabel}</p>
          <h2 className="journal-gazebo__ceremony-page-title">{config.name}</h2>
          <p
            className="journal-gazebo__ceremony-preview-line"
            data-font={config.fontId}
            data-ink={config.inkColor}
            data-pen={config.penStyle}
          >
            {JOURNAL_CEREMONY_TODAY_INTRO}
          </p>
        </div>
      ) : null}

      <span className="journal-gazebo__page-flame" aria-hidden="true" />

      {step < 2 ? (
        <button
          type="button"
          className="journal-gazebo__turn-page"
          onClick={onTurnPage}
        >
          {JOURNAL_TOOLS.turnPage}
        </button>
      ) : (
        <button
          type="button"
          className="journal-gazebo__turn-page"
          onClick={onTurnPage}
        >
          Begin writing
        </button>
      )}
    </div>
  );
}
