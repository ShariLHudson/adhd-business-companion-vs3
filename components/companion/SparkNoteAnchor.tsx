"use client";

import { useMemo } from "react";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import { diversityCategoryForEntry } from "@/lib/sparkNote/sparkCardDiversity";

import { SparkFlameIcon } from "@/components/companion/SparkFlameIcon";

type Props = {
  card: SparkNoteDailyCard;
  onExpand: () => void;
};

/**
 * Collapsed Spark Card — compact companion object (bottom-right, opposite Guide Book).
 * Decorative keepsake styling only; no thumbnail image or teaser text on this
 * face (kept calm/small — full illustration and story live in the expanded card).
 */
export function SparkNoteAnchor({ card, onExpand }: Props) {
  const diversityCategory = useMemo(() => diversityCategoryForEntry(card), [card]);

  return (
    <div
      className="spark-note-anchor"
      data-estate-chrome-position="bottom-right"
      data-diversity-category={diversityCategory}
      data-testid="spark-note-anchor"
    >
      <button
        type="button"
        className="spark-note-anchor__card"
        onClick={onExpand}
        aria-label={`Daily Spark. Today's discovery: ${card.shortTitle}. Open to read.`}
      >
        <span className="spark-note-anchor__seal" aria-hidden />
        <span className="spark-note-anchor__flame-wrap" aria-hidden>
          <SparkFlameIcon className="spark-note-anchor__flame" />
        </span>
        <span className="spark-note-anchor__identity">Daily Spark</span>
        <span className="spark-note-anchor__hint">{card.shortTitle}</span>
      </button>
    </div>
  );
}
