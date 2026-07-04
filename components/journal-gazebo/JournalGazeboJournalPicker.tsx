"use client";

import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import {
  JOURNAL_PICKER_SUBTITLE,
  JOURNAL_PICKER_TITLE,
} from "@/lib/journalGazebo/hospitality";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  journals: JournalGazeboConfig[];
  activeJournalId?: string | null;
  onSelect: (journal: JournalGazeboConfig) => void;
  onClose: () => void;
};

/** Choose which journal to open today — shown when the member has more than one. */
export function JournalGazeboJournalPicker({
  journals,
  activeJournalId,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="jg-journal-picker" role="dialog" aria-labelledby="jg-journal-picker-title">
      <button
        type="button"
        className="jg-journal-picker__backdrop"
        onClick={onClose}
        aria-label="Close journal list"
      />
      <div className="jg-journal-picker__panel">
        <h2 id="jg-journal-picker-title" className="jg-journal-picker__title">
          {JOURNAL_PICKER_TITLE}
        </h2>
        <p className="jg-journal-picker__subtitle">{JOURNAL_PICKER_SUBTITLE}</p>
        <ul className="jg-journal-picker__grid">
          {journals.map((journal) => {
            const title = journalCoverTitle(journal);
            const coverUrl = journalCoverImageUrl(journal);
            const isActive = journal.id === activeJournalId;

            return (
              <li key={journal.id}>
                <button
                  type="button"
                  className={[
                    "jg-journal-picker__item",
                    isActive ? "jg-journal-picker__item--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-leather={journal.leatherColor}
                  onClick={() => onSelect(journal)}
                >
                  <span
                    className={[
                      "jg-journal-picker__cover",
                      coverUrl ? "jg-journal-picker__cover--printed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      coverUrl
                        ? { backgroundImage: `url(${coverUrl})` }
                        : undefined
                    }
                    aria-hidden="true"
                  />
                  <span className="jg-journal-picker__meta">
                    <span className="jg-journal-picker__name">{title}</span>
                    {journal.name.trim() && journal.name.trim() !== title ? (
                      <span className="jg-journal-picker__owner">{journal.name}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="jg-journal-picker__close" onClick={onClose}>
          Stay here
        </button>
      </div>
    </div>
  );
}
