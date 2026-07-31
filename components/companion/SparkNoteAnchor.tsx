"use client";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

const TEASER_SRC = "/images/todays-spark-card.png";

type Props = {
  card: SparkNoteDailyCard;
  onExpand: () => void;
};

/**
 * Welcome Home Today's Spark teaser — the approved bottom-right image. The whole
 * image is a single clickable control that opens My Personal Library in Today's
 * Spark arrival mode. Shown once per local calendar day (gated by SparkNoteChrome).
 */
export function SparkNoteAnchor({ card, onExpand }: Props) {
  return (
    <div
      className="spark-note-teaser"
      data-estate-chrome-position="bottom-right"
      data-testid="spark-note-anchor"
    >
      <button
        type="button"
        className="spark-note-teaser__button"
        onClick={onExpand}
        aria-label={`Today's Spark: ${card.shortTitle}. Open your Personal Library.`}
      >
        <img
          className="spark-note-teaser__image"
          src={TEASER_SRC}
          alt="Today's Spark"
          decoding="async"
        />
      </button>
    </div>
  );
}
