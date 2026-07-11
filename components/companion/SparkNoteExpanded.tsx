"use client";

import { useMemo, useState } from "react";
import type { SparkNoteDailyCard, SparkNoteReaction } from "@/lib/sparkNote/types";
import {
  resolveSparkCardHeroVisual,
  resolveSparkCardMoreToDiscover,
  SPARK_CARD_SECTION_DISCOVER,
  SPARK_CARD_SECTION_SPARK,
  SPARK_CARD_SECTION_STORY,
  SPARK_CARD_SECTION_WHY,
  SPARK_CARD_CATEGORY_EMBLEM,
} from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import {
  getFavoriteSparkIds,
  recordSparkNoteReaction,
  toggleSparkNoteFavorite,
} from "@/lib/sparkNote/persistence";

type Props = {
  card: SparkNoteDailyCard;
  onClose: () => void;
  onOpenCollection: () => void;
};

type ViewPhase = "keepsake" | "saved";

const REACTIONS: readonly {
  id: SparkNoteReaction;
  label: string;
  emoji: string;
}[] = [
  { id: "loved", label: "Loved it", emoji: "❤️" },
  { id: "smile", label: "Made me smile", emoji: "😊" },
  { id: "idea", label: "Gave me an idea", emoji: "💡" },
];

function SparkCardArt({ card }: { card: SparkNoteDailyCard }) {
  const hero = useMemo(() => resolveSparkCardHeroVisual(card), [card]);
  const themed = useMemo(() => {
    if (hero.kind === "themed") return hero;
    return {
      kind: "themed" as const,
      category: card.category,
      emblem: SPARK_CARD_CATEGORY_EMBLEM[card.category] ?? "✨",
      alt: hero.alt,
    };
  }, [card, hero]);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = hero.kind === "photo" && !photoFailed;

  return (
    <div
      className={[
        "spark-note-expanded__art",
        showPhoto ? "" : "spark-note-expanded__art--themed",
        showPhoto ? "" : `spark-note-expanded__art--${themed.category}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showPhoto ? (
        <img
          src={hero.src}
          alt={hero.alt}
          className="spark-note-expanded__art-image"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <>
          <span className="spark-note-expanded__art-emblem" aria-hidden>
            {themed.emblem}
          </span>
          <span className="spark-note-expanded__art-caption">
            {card.categoryLabel}
          </span>
        </>
      )}
    </div>
  );
}

/** Daily Spark — compact collectible keepsake, not an article panel. */
export function SparkNoteExpanded({ card, onClose, onOpenCollection }: Props) {
  const moreToDiscover = useMemo(
    () => resolveSparkCardMoreToDiscover(card),
    [card],
  );
  const [phase, setPhase] = useState<ViewPhase>("keepsake");
  const [activeReaction, setActiveReaction] = useState<SparkNoteReaction | null>(
    null,
  );
  const kept = getFavoriteSparkIds().includes(card.id);

  function handleReaction(reaction: SparkNoteReaction) {
    setActiveReaction(reaction);
    recordSparkNoteReaction(card.id, reaction, card.category, card.tags);
  }

  function handleSaveSpark() {
    if (!kept) {
      toggleSparkNoteFavorite(card.id);
      recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    }
    setPhase("saved");
  }

  if (phase === "saved") {
    return (
      <div
        className="spark-note-expanded"
        role="dialog"
        aria-label="Spark saved. Click outside the card to close."
        data-testid="spark-note-expanded"
      >
        <div className="spark-note-expanded__backdrop" aria-hidden onClick={onClose} />
        <div className="spark-note-expanded__card spark-note-expanded__card--saved">
          <p className="spark-note-expanded__saved-title" role="status">
            Saved to your collection
          </p>
          <p className="spark-note-expanded__saved-copy">
            A keepsake discovery — yours whenever you want it.
          </p>
          <div className="spark-note-expanded__actions spark-note-expanded__actions--save">
            <button
              type="button"
              className="spark-note-expanded__btn spark-note-expanded__btn--primary spark-note-expanded__btn--save"
              onClick={onOpenCollection}
            >
              View collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="spark-note-expanded"
      role="dialog"
      aria-label={`Today's Daily Spark: ${card.title}. Click outside the card to close.`}
      data-testid="spark-note-expanded"
    >
      <div className="spark-note-expanded__backdrop" aria-hidden onClick={onClose} />
      <article
        className="spark-note-expanded__card spark-note-expanded__card--keepsake"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="spark-note-expanded__header">
          <span className="spark-note-expanded__flame" aria-hidden>
            🔥
          </span>
          <div className="spark-note-expanded__header-copy">
            <p className="spark-note-expanded__kicker">Today&apos;s Spark</p>
            <p className="spark-note-expanded__category">{card.categoryLabel}</p>
          </div>
        </header>

        <h2 className="spark-note-expanded__title">{card.title}</h2>

        <SparkCardArt card={card} />

        <div className="spark-note-expanded__sections">
          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_STORY}
            </h3>
            <p className="spark-note-expanded__section-copy">{card.whatHappened}</p>
          </section>

          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_WHY}
            </h3>
            <p className="spark-note-expanded__section-copy">{card.whyItMatters}</p>
          </section>

          {moreToDiscover ? (
            <section className="spark-note-expanded__section spark-note-expanded__section--discover">
              <h3 className="spark-note-expanded__section-title">
                {SPARK_CARD_SECTION_DISCOVER}
              </h3>
              <p className="spark-note-expanded__section-copy">{moreToDiscover}</p>
            </section>
          ) : null}

          <section className="spark-note-expanded__section spark-note-expanded__section--spark">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_SPARK}
            </h3>
            <p className="spark-note-expanded__section-copy spark-note-expanded__spark-prompt">
              {card.sparkApplication}
            </p>
          </section>
        </div>

        <div className="spark-note-expanded__reactions" aria-label="Spark reactions">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.id}
              type="button"
              className={[
                "spark-note-expanded__reaction",
                activeReaction === reaction.id
                  ? "spark-note-expanded__reaction--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={activeReaction === reaction.id}
              onClick={() => handleReaction(reaction.id)}
            >
              <span aria-hidden>{reaction.emoji}</span>
              <span>{reaction.label}</span>
            </button>
          ))}
        </div>

        <div
          className="spark-note-expanded__actions spark-note-expanded__actions--save"
          aria-label="Daily Spark actions"
        >
          <button
            type="button"
            className="spark-note-expanded__btn spark-note-expanded__btn--primary spark-note-expanded__btn--save"
            onClick={handleSaveSpark}
            aria-pressed={kept}
          >
            {kept ? "⭐ Saved" : "⭐ Save Spark"}
          </button>
        </div>
      </article>
    </div>
  );
}
