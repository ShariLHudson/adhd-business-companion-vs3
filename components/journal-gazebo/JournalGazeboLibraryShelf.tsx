"use client";

import { journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import { JOURNAL_LIBRARY_SHELF_LABEL } from "@/lib/journalGazebo/hospitality";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  journals: JournalGazeboConfig[];
  activeJournalId?: string | null;
  onSelectJournal?: (journal: JournalGazeboConfig) => void;
  compact?: boolean;
};

/** Personal library shelf — finished journals rest here between visits. */
export function JournalGazeboLibraryShelf({
  journals,
  activeJournalId,
  onSelectJournal,
  compact = false,
}: Props) {
  if (journals.length === 0) return null;

  return (
    <div
      className={[
        "jg-library-shelf",
        compact ? "jg-library-shelf--compact" : "",
        onSelectJournal ? "jg-library-shelf--interactive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={JOURNAL_LIBRARY_SHELF_LABEL}
    >
      <div className="jg-library-shelf__scene">
        <p className="jg-library-shelf__label">{JOURNAL_LIBRARY_SHELF_LABEL}</p>
        <ul className="jg-library-shelf__volumes">
          {journals.map((journal) => {
            const title = journalCoverTitle(journal);
            const isActive = journal.id === activeJournalId;
            const Tag = onSelectJournal ? "button" : "li";

            return (
              <Tag
                key={journal.id}
                type={onSelectJournal ? "button" : undefined}
                className={[
                  "jg-library-shelf__volume",
                  isActive ? "jg-library-shelf__volume--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-leather={journal.leatherColor}
                onClick={onSelectJournal ? () => onSelectJournal(journal) : undefined}
                title={title}
              >
                <span className="jg-library-shelf__spine" aria-hidden="true">
                  <span
                    className="jg-library-shelf__spine-title"
                    style={{ fontSize: spineTitleFontSize(title) }}
                  >
                    {title}
                  </span>
                </span>
                <span className="jg-library-shelf__cover" aria-hidden="true" />
                {onSelectJournal ? (
                  <span className="jg-library-shelf__sr-only">Open {title}</span>
                ) : null}
              </Tag>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function spineTitleFontSize(title: string): string {
  const length = title.trim().length;
  if (length <= 10) return "clamp(0.62rem, 1.45vw, 0.78rem)";
  if (length <= 16) return "clamp(0.54rem, 1.25vw, 0.68rem)";
  if (length <= 22) return "clamp(0.48rem, 1.1vw, 0.6rem)";
  return "clamp(0.42rem, 0.95vw, 0.52rem)";
}
