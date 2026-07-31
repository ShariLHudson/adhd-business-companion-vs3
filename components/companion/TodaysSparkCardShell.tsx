"use client";

import { useMemo, useState } from "react";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import {
  resolveSparkCardSimplifiedPresentation,
  SPARK_CARD_SECTION_SPARK_IN_ACTION,
  SPARK_CARD_SECTION_STORY,
  SPARK_CARD_SECTION_TODAYS_SPARK,
} from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import {
  logSparkCardImageLoadError,
  resolveSparkCardImage,
} from "@/lib/sparkNote/resolveSparkCardImage";
import {
  getFavoriteSparkIds,
  recordSparkNoteReaction,
} from "@/lib/sparkNote/persistence";
import { saveSparkDurable } from "@/lib/sparkNote/savedSparksDurable";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  card: SparkNoteDailyCard;
  /** Dismiss the card. In the daily-arrival flow this returns to the gift room. */
  onClose: () => void;
};

/**
 * Today's Spark — full card in the approved prototype card-shell style
 * (clean paper card: eyebrow · title · subtitle · media · The Story · The Spark ·
 * Explore It). Content and image come from the SAME resolvers the rest of the
 * Estate uses, and Save This Spark is the durable write-through flow. This is the
 * card the gift unwraps; closing returns to the gift room.
 */
export function TodaysSparkCardShell({ card, onClose }: Props) {
  const presentation = useMemo(
    () => resolveSparkCardSimplifiedPresentation(card),
    [card],
  );
  const image = useMemo(() => resolveSparkCardImage(card), [card]);
  const facts = useMemo(
    () => presentation.tellMeMore.facts.slice(0, 3),
    [presentation.tellMeMore.facts],
  );

  const [photoFailed, setPhotoFailed] = useState(false);
  const [kept, setKept] = useState(() =>
    getFavoriteSparkIds().includes(card.id),
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  const hasPhoto = Boolean(image.src) && !photoFailed;

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    // Affinity signal + optimistic local cache; not yet a "saved" claim.
    recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    const claim = await saveSparkDurable(card);
    if (claim.confirmed) {
      setKept(true);
      setSaveState("idle");
      return;
    }
    // Durable save failed: tell the truth, offer retry.
    setKept(getFavoriteSparkIds().includes(card.id));
    setSaveError(claim.message);
    setSaveState("error");
  }

  return (
    <div
      className="tsc-shell tsc-shell--open"
      role="dialog"
      aria-modal="true"
      aria-label={`Today's Spark: ${presentation.title}. Click outside the card to close.`}
      data-testid="todays-spark-card"
      onClick={() => onBackdropClick()}
    >
      <article
        className="tsc-card"
        onClick={(event) => event.stopPropagation()}
        data-diversity-category={presentation.diversityCategory}
      >
        <header className="tsc-header">
          <button
            type="button"
            className="tsc-back"
            onClick={() => requestClose()}
          >
            ← Back
          </button>
          <button
            type="button"
            className="tsc-close"
            onClick={() => requestClose()}
            aria-label="Close Today's Spark"
          >
            ×
          </button>
          <div className="tsc-eyebrow">
            {`${presentation.categoryRibbon} · Today's Spark`}
          </div>
          <h1 className="tsc-title">{presentation.title}</h1>
          <p className="tsc-subtitle">{presentation.subtitle}</p>
        </header>

        {image.src ? (
          <div className="tsc-media-section">
            <figure className="tsc-figure">
              <div className="tsc-media-frame">
                {hasPhoto ? (
                  <img
                    src={image.src}
                    alt={image.alt}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    onError={() => {
                      setPhotoFailed(true);
                      logSparkCardImageLoadError({
                        cardId: card.id,
                        src: image.src ?? "",
                        sourceField: image.sourceField,
                        error: "img_onerror",
                      });
                    }}
                  />
                ) : null}
              </div>
              {hasPhoto && image.caption ? (
                <figcaption className="tsc-caption">{image.caption}</figcaption>
              ) : null}
            </figure>
          </div>
        ) : null}

        <div className="tsc-body">
          <section className="tsc-section">
            <h2 className="tsc-section-title">{SPARK_CARD_SECTION_STORY}</h2>
            {presentation.storyParagraphs.map((paragraph, index) => (
              <p key={`story-${index}`} className="tsc-copy">
                {paragraph}
              </p>
            ))}
            {facts.length > 0 ? (
              <div className="tsc-facts">
                {facts.map((fact, index) => (
                  <div key={`fact-${index}`} className="tsc-fact">
                    {fact}
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="tsc-section">
            <h2 className="tsc-section-title">
              {SPARK_CARD_SECTION_TODAYS_SPARK}
            </h2>
            <div className="tsc-spark-box">{presentation.todaysSpark}</div>
          </section>

          <section className="tsc-section">
            <h2 className="tsc-section-title">
              {SPARK_CARD_SECTION_SPARK_IN_ACTION}
            </h2>
            <div className="tsc-explore-box">
              <p>{presentation.sparkInAction}</p>
            </div>
          </section>

          <div className="tsc-actions">
            <button
              type="button"
              className="tsc-save"
              onClick={() => void handleSave()}
              aria-pressed={kept}
              disabled={saveState === "saving" || kept}
            >
              {saveState === "saving"
                ? "Saving…"
                : kept
                  ? "Saved to My Spark Collection"
                  : "Save This Spark"}
            </button>
            <button
              type="button"
              className="tsc-secondary"
              onClick={() => requestClose()}
            >
              Close for Now
            </button>
          </div>
          {saveState === "error" && saveError ? (
            <div className="tsc-status" role="alert">
              <span>{saveError}</span>
              <button
                type="button"
                className="tsc-secondary"
                onClick={() => void handleSave()}
                data-testid="todays-spark-card-save-retry"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
