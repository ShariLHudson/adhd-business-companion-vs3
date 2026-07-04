"use client";

import {
  JOURNAL_WORKSHOP_BOOKMARK_NEXT,
  JOURNAL_WORKSHOP_BOOKMARK_SPARK,
} from "@/lib/journalGazebo/hospitality";
import { JOURNAL_WORKSHOP_BOOKMARK_OPTIONS } from "@/lib/journalGazebo/workshopCatalog";
import type { JournalBookmarkStyle } from "@/lib/journalGazebo/types";

type Props = {
  bookmarkIndex: number;
  onIndexChange: (index: number) => void;
  onChoose: (style: JournalBookmarkStyle) => void;
};

/** One bookmark detail at a time on the desk. */
export function JournalGazeboBookmarkPicker({
  bookmarkIndex,
  onIndexChange,
  onChoose,
}: Props) {
  const option = JOURNAL_WORKSHOP_BOOKMARK_OPTIONS[bookmarkIndex]!;
  const isLast = bookmarkIndex >= JOURNAL_WORKSHOP_BOOKMARK_OPTIONS.length - 1;

  return (
    <div className="jg-bookmark-picker">
      <p className="jg-bookmark-picker__spark">{JOURNAL_WORKSHOP_BOOKMARK_SPARK}</p>
      <button
        type="button"
        className={[
          "jg-bookmark-object",
          `jg-bookmark-object--${option.id}`,
        ].join(" ")}
        onClick={() => onChoose(option.id)}
        aria-label={`Choose ${option.label}`}
      >
        <span className="jg-bookmark-object__craft" aria-hidden="true" />
        <span className="jg-bookmark-object__label">{option.label}</span>
      </button>
      {!isLast ? (
        <button
          type="button"
          className="jg-workshop__choice jg-workshop__choice--quiet"
          onClick={() => onIndexChange(bookmarkIndex + 1)}
        >
          {JOURNAL_WORKSHOP_BOOKMARK_NEXT}
        </button>
      ) : null}
    </div>
  );
}
