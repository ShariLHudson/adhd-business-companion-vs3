import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

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
              {categoryThumb(card.category)}
            </span>
          )}
        </span>
        <span className="spark-note-anchor__copy">
          <span className="spark-note-anchor__label">Today&apos;s Spark</span>
          <span className="spark-note-anchor__title">{card.shortTitle}</span>
          <span className="spark-note-anchor__teaser">{card.teaser}</span>
        </span>
        <span className="spark-note-anchor__flame" aria-hidden>
          <SparkFlameIcon />
        </span>
      </button>
    </div>
  );
}

function categoryThumb(category: SparkNoteDailyCard["category"]): string {
  switch (category) {
    case "invention":
      return "📝";
    case "entrepreneur":
      return "🏰";
    case "business":
      return "💼";
    case "holiday":
      return "🎉";
    case "fun_fact":
      return "✨";
    case "quote":
      return "💬";
    case "creativity":
      return "🎨";
    case "personal_growth":
      return "🌱";
    case "adhd_friendly":
      return "✦";
    case "personal":
      return "🎂";
    case "history":
      return "📜";
    default:
      return "✦";
  }
}

function SparkFlameIcon() {
  return (
    <svg
      className="spark-note-anchor__flame-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2C12 2 8 8 8 13C8 16.31 9.79 19 12 19C14.21 19 16 16.31 16 13C16 8 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 19C10.5 19 9 17.5 9 15.5C9 13 11 10 12 8C13 10 15 13 15 15.5C15 17.5 13.5 19 12 19Z"
        fill="rgba(255,236,180,0.85)"
      />
    </svg>
  );
}
