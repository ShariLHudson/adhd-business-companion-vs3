import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

import { SparkFlameIcon } from "@/components/companion/SparkFlameIcon";

type Props = {
  card: SparkNoteDailyCard;
  onExpand: () => void;
};

/** Collapsed Spark Note — bottom-right daily companion card. */
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
        aria-label={`Today's Spark: ${card.title}. ${card.teaser}`}
      >
        <span className="spark-note-anchor__thumb" aria-hidden>
          {card.thumbnailSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.thumbnailSrc}
              alt=""
              className="spark-note-anchor__thumb-img"
            />
          ) : (
            <span className="spark-note-anchor__thumb-fallback">
              <SparkFlameIcon className="spark-note-anchor__thumb-flame" />
            </span>
          )}
        </span>
        <span className="spark-note-anchor__copy">
          <span className="spark-note-anchor__label">Today&apos;s Spark</span>
          <span className="spark-note-anchor__title">{card.shortTitle}</span>
          <span className="spark-note-anchor__teaser">{card.teaser}</span>
        </span>
        <span className="spark-note-anchor__flame" aria-hidden>
          <SparkFlameIcon className="spark-note-anchor__flame-svg" />
        </span>
      </button>
    </div>
  );
}
