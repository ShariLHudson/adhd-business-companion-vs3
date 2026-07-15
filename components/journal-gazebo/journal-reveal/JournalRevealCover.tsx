"use client";

import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboSparkFlame } from "../JournalGazeboSparkFlame";

type Props = {
  journal: JournalGazeboConfig;
  /** Smaller preview inside the gift box. */
  compact?: boolean;
  className?: string;
};

/**
 * Selected journal cover face — leather/printed art, title, Spark flame.
 * Shared by unwrap peek, revealed, and opening stages.
 */
export function JournalRevealCover({ journal, compact = false, className = "" }: Props) {
  const title = journalCoverTitle(journal);
  const coverImage = journalCoverImageUrl(journal);

  return (
    <div
      className={[
        "journal-reveal__journal-cover",
        compact ? "journal-reveal__journal-cover--compact" : "",
        coverImage ? "journal-reveal__journal-cover--printed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-leather={journal.leatherColor}
      data-testid="journal-reveal-cover"
      data-journal-id={journal.id}
      style={
        coverImage
          ? {
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {journal.showSparkFlame !== false ? (
        <span className="journal-reveal__journal-flame" aria-hidden="true">
          <JournalGazeboSparkFlame size={compact ? "sm" : "md"} />
        </span>
      ) : null}
      <span className="journal-reveal__journal-title">{title}</span>
    </div>
  );
}
