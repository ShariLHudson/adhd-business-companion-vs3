"use client";

import { useMemo, useState } from "react";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import {
  buildSparkCardShareText,
  resolveSparkCardHeroVisual,
  resolveSparkCardSimplifiedPresentation,
  SPARK_CARD_SECTION_SPARK_IN_ACTION,
  SPARK_CARD_SECTION_STORY,
  SPARK_CARD_SECTION_TELL_ME_MORE,
  SPARK_CARD_SECTION_TODAYS_SPARK,
  SPARK_CARD_CATEGORY_EMBLEM,
} from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import {
  getFavoriteSparkIds,
  recordSparkNoteReaction,
  toggleSparkNoteFavorite,
} from "@/lib/sparkNote/persistence";
import { copySparkNoteText } from "@/lib/sparkNote/sparkNoteDestinations";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  card: SparkNoteDailyCard;
  onClose: () => void;
  onOpenCollection: () => void;
};

type ViewPhase = "keepsake" | "saved";

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

/** Daily Spark — compact collectible treasure, not an article panel. */
export function SparkNoteExpanded({ card, onClose, onOpenCollection }: Props) {
  const presentation = useMemo(
    () => resolveSparkCardSimplifiedPresentation(card),
    [card],
  );
  const [phase, setPhase] = useState<ViewPhase>("keepsake");
  const [tellMeMoreOpen, setTellMeMoreOpen] = useState(false);
  const [kept, setKept] = useState(() =>
    getFavoriteSparkIds().includes(card.id),
  );
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const { onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  function ensureSaved() {
    if (!getFavoriteSparkIds().includes(card.id)) {
      toggleSparkNoteFavorite(card.id);
      recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    }
    setKept(true);
  }

  function handleSaveSpark() {
    ensureSaved();
    setPhase("saved");
  }

  function handleFavorite() {
    const next = toggleSparkNoteFavorite(card.id);
    setKept(next);
    if (next) {
      recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    }
  }

  async function handleShare() {
    const text = buildSparkCardShareText(card);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: presentation.title,
          text,
        });
        setShareStatus("Shared");
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    const ok = await copySparkNoteText(text);
    setShareStatus(ok ? "Copied" : "Couldn’t copy just now");
  }

  function handlePrint() {
    if (typeof window === "undefined") return;
    window.print();
  }

  if (phase === "saved") {
    return (
      <div
        className="spark-note-expanded"
        role="dialog"
        aria-label="Spark saved. Click outside the card to close."
        data-testid="spark-note-expanded"
      >
        <div
          className="spark-note-expanded__backdrop"
          aria-hidden
          onClick={() => onBackdropClick()}
        />
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

  const tellMeMore = presentation.tellMeMore;
  const hasTellMeMore =
    tellMeMore.facts.length > 0 ||
    Boolean(tellMeMore.reflectionPrompt) ||
    tellMeMore.related.length > 0;

  return (
    <div
      className="spark-note-expanded"
      role="dialog"
      aria-label={`Today's Daily Spark: ${card.title}. Click outside the card to close.`}
      data-testid="spark-note-expanded"
    >
      <div
        className="spark-note-expanded__backdrop"
        aria-hidden
        onClick={() => onBackdropClick()}
      />
      <article
        className="spark-note-expanded__card spark-note-expanded__card--keepsake"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spark-note-expanded__ribbon" aria-label="Category">
          {presentation.categoryRibbon}
        </div>

        <header className="spark-note-expanded__header">
          <span className="spark-note-expanded__flame" aria-hidden>
            🔥
          </span>
          <div className="spark-note-expanded__header-copy">
            <p className="spark-note-expanded__kicker">Today&apos;s Spark</p>
          </div>
        </header>

        <h2 className="spark-note-expanded__title">{presentation.title}</h2>
        <p className="spark-note-expanded__subtitle">{presentation.subtitle}</p>

        <SparkCardArt card={card} />

        <div className="spark-note-expanded__sections">
          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_STORY}
            </h3>
            {presentation.storyParagraphs.map((paragraph, index) => (
              <p
                key={`story-${index}`}
                className="spark-note-expanded__section-copy"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <section className="spark-note-expanded__section spark-note-expanded__section--takeaway">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_TODAYS_SPARK}
            </h3>
            <p className="spark-note-expanded__section-copy">
              {presentation.todaysSpark}
            </p>
          </section>

          <section className="spark-note-expanded__section spark-note-expanded__section--spark">
            <h3 className="spark-note-expanded__section-title">
              {SPARK_CARD_SECTION_SPARK_IN_ACTION}
            </h3>
            <p className="spark-note-expanded__section-copy spark-note-expanded__spark-prompt">
              {presentation.sparkInAction}
            </p>
          </section>
        </div>

        {hasTellMeMore ? (
          <div className="spark-note-expanded__more">
            <button
              type="button"
              className="spark-note-expanded__more-toggle"
              aria-expanded={tellMeMoreOpen}
              onClick={() => setTellMeMoreOpen((open) => !open)}
            >
              {SPARK_CARD_SECTION_TELL_ME_MORE}
            </button>
            {tellMeMoreOpen ? (
              <div
                className="spark-note-expanded__more-panel"
                data-testid="spark-note-tell-me-more"
              >
                {tellMeMore.facts.map((fact, index) => (
                  <p key={`fact-${index}`} className="spark-note-expanded__section-copy">
                    {fact}
                  </p>
                ))}
                {tellMeMore.reflectionPrompt ? (
                  <p className="spark-note-expanded__section-copy spark-note-expanded__section-copy--quiet">
                    A question to sit with: {tellMeMore.reflectionPrompt}
                  </p>
                ) : null}
                {tellMeMore.related.length > 0 ? (
                  <div className="spark-note-expanded__related">
                    <p className="spark-note-expanded__related-label">
                      Related sparks
                    </p>
                    <ul>
                      {tellMeMore.related.map((related) => (
                        <li key={related.id}>
                          <span className="spark-note-expanded__related-ribbon">
                            {related.categoryRibbon}
                          </span>
                          {related.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className="spark-note-expanded__actions spark-note-expanded__actions--collection"
          aria-label="Spark Card actions"
        >
          <button
            type="button"
            className="spark-note-expanded__btn spark-note-expanded__btn--primary spark-note-expanded__btn--save"
            onClick={handleSaveSpark}
            aria-pressed={kept}
          >
            {kept ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            className={[
              "spark-note-expanded__btn spark-note-expanded__btn--ghost spark-note-expanded__btn--save",
              kept ? "spark-note-expanded__btn--favorite-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleFavorite}
            aria-pressed={kept}
          >
            {kept ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button
            type="button"
            className="spark-note-expanded__btn spark-note-expanded__btn--ghost spark-note-expanded__btn--save"
            onClick={() => void handleShare()}
          >
            Share
          </button>
          <button
            type="button"
            className="spark-note-expanded__btn spark-note-expanded__btn--ghost spark-note-expanded__btn--save spark-note-expanded__btn--print"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
        {shareStatus ? (
          <p className="spark-note-expanded__share-status" role="status">
            {shareStatus}
          </p>
        ) : null}
      </article>
    </div>
  );
}
