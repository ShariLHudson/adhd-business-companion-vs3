"use client";

import { useState } from "react";
import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import {
  JOURNAL_PICKER_SUBTITLE,
  JOURNAL_PICKER_TITLE,
  JOURNAL_REMOVE_CONFIRM,
  JOURNAL_REMOVE_CONFIRM_NO,
  JOURNAL_REMOVE_CONFIRM_YES,
  JOURNAL_REMOVE_LABEL,
  journalResumeActionLabel,
} from "@/lib/journalGazebo/hospitality";
import { resolveResumePageIndex } from "@/lib/journalGazebo/journalPageStorage";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  journals: JournalGazeboConfig[];
  activeJournalId?: string | null;
  onSelect: (journal: JournalGazeboConfig) => void;
  onRemove: (journal: JournalGazeboConfig) => void;
  onClose: () => void;
};

/** Choose which journal to open today — or remove one from the shelf. */
export function JournalGazeboJournalPicker({
  journals,
  activeJournalId,
  onSelect,
  onRemove,
  onClose,
}: Props) {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

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
            const confirming = confirmRemoveId === journal.id;

            return (
              <li key={journal.id} className="jg-journal-picker__row">
                {confirming ? (
                  <div
                    className="jg-journal-picker__confirm"
                    role="group"
                    aria-label={JOURNAL_REMOVE_CONFIRM}
                  >
                    <p className="jg-journal-picker__confirm-text">
                      {JOURNAL_REMOVE_CONFIRM}
                    </p>
                    <p className="jg-journal-picker__confirm-name">{title}</p>
                    <div className="jg-journal-picker__confirm-actions">
                      <button
                        type="button"
                        className="jg-journal-picker__confirm-keep"
                        onClick={() => setConfirmRemoveId(null)}
                      >
                        {JOURNAL_REMOVE_CONFIRM_NO}
                      </button>
                      <button
                        type="button"
                        className="jg-journal-picker__confirm-remove"
                        onClick={() => {
                          setConfirmRemoveId(null);
                          onRemove(journal);
                        }}
                        data-testid={`jg-remove-journal-confirm-${journal.id}`}
                      >
                        {JOURNAL_REMOVE_CONFIRM_YES}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                        aria-hidden="true"
                      >
                        {coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- preloaded estate plate
                          <img
                            src={coverUrl}
                            alt=""
                            className="jg-journal-picker__cover-img"
                            loading="eager"
                            decoding="async"
                          />
                        ) : null}
                        {coverUrl ? (
                          <span className="jg-journal-picker__cover-title">{title}</span>
                        ) : null}
                      </span>
                      <span className="jg-journal-picker__meta">
                        <span className="jg-journal-picker__name">{title}</span>
                        <span className="jg-journal-picker__resume">
                          {journalResumeActionLabel(resolveResumePageIndex(journal.id))}
                        </span>
                        {journal.name.trim() && journal.name.trim() !== title ? (
                          <span className="jg-journal-picker__owner">{journal.name}</span>
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="jg-journal-picker__remove"
                      onClick={() => setConfirmRemoveId(journal.id)}
                      data-testid={`jg-remove-journal-${journal.id}`}
                    >
                      {JOURNAL_REMOVE_LABEL}
                    </button>
                  </>
                )}
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
