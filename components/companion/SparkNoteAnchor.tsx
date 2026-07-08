"use client";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

import { SparkFlameIcon } from "@/components/companion/SparkFlameIcon";

type Props = {
  card: SparkNoteDailyCard;
  onExpand: () => void;
};

/** Collapsed Spark Card™ — compact companion object (bottom-right, opposite Guide Book). */
export function SparkNoteAnchor({ card, onExpand }: Props) {
  return (
    <div
      className="spark-note-anchor"
      data-estate-chrome-position="bottom-right"
      data-testid="spark-note-anchor"
    >
      <button
        type="button"
        className="spark-note-anchor__card"
        onClick={onExpand}
        aria-label={`Spark Card. Today's Spark: ${card.shortTitle}. Open to read.`}
      >
        <span className="spark-note-anchor__flame-wrap" aria-hidden>
          <SparkFlameIcon className="spark-note-anchor__flame" />
        </span>
        <span className="spark-note-anchor__identity">Spark Card™</span>
        <span className="spark-note-anchor__hint">{card.shortTitle}</span>
      </button>
    </div>
  );
}
