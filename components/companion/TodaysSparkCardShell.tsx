"use client";

import { useEffect, useMemo, useState } from "react";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import {
  resolveSparkCardSimplifiedPresentation,
  splitSparkCardStoryParagraphs,
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
import {
  loadSavedSparkNote,
  saveSparkDurable,
} from "@/lib/sparkNote/savedSparksDurable";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  card: SparkNoteDailyCard;
  /** Dismiss the card. In the daily-arrival flow this returns to the gift room. */
  onClose: () => void;
};

/** Template invitation shared by every Spark's "Explore It" (not per-card copy). */
const EXPLORE_CLOSING =
  "You don't need to turn this into a task. You can simply save the thought, connect it to something you're building, or return to it later.";

type SaveState = "idle" | "savingSpark" | "savingNote" | "error";

/**
 * Today's Spark — the full card in the approved prototype card-shell design.
 * Every Spark uses this exact card; only the image and content differ per Spark.
 *
 * Pieces (matching the prototype): Back to My Personal Library · Close ·
 * eyebrow · title · subtitle · image + caption · The Story (+ fact tiles) ·
 * The Spark · Explore It · My notes and ideas · Save This Spark · Save My Note ·
 * Close for Now. Content and image come from the shared Spark resolvers; Save
 * This Spark / Save My Note write through the durable saved-Spark record.
 */
export function TodaysSparkCardShell({ card, onClose }: Props) {
  const presentation = useMemo(
    () => resolveSparkCardSimplifiedPresentation(card),
    [card],
  );
  const image = useMemo(() => resolveSparkCardImage(card), [card]);

  const storyParagraphs = useMemo(() => {
    const full = splitSparkCardStoryParagraphs(card.whatHappened);
    return full.length > 0 ? full : presentation.storyParagraphs;
  }, [card.whatHappened, presentation.storyParagraphs]);

  const facts = useMemo(
    () => presentation.tellMeMore.facts.slice(0, 3),
    [presentation.tellMeMore.facts],
  );

  const explorePoints = useMemo(() => {
    const points = [presentation.sparkInAction];
    if (presentation.tellMeMore.reflectionPrompt) {
      points.push(presentation.tellMeMore.reflectionPrompt);
    }
    points.push(EXPLORE_CLOSING);
    return points.filter((p) => Boolean(p?.trim()));
  }, [presentation.sparkInAction, presentation.tellMeMore.reflectionPrompt]);

  const [photoFailed, setPhotoFailed] = useState(false);
  const [note, setNote] = useState("");
  const [kept, setKept] = useState(() =>
    getFavoriteSparkIds().includes(card.id),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  const hasPhoto = Boolean(image.src) && !photoFailed;
  const saving = saveState === "savingSpark" || saveState === "savingNote";

  // Prefill "My notes and ideas" if this Spark already has a saved note.
  useEffect(() => {
    let active = true;
    void loadSavedSparkNote(card.id).then((saved) => {
      if (active && saved) setNote(saved);
    });
    return () => {
      active = false;
    };
  }, [card.id]);

  async function persist(kind: "savingSpark" | "savingNote", success: string) {
    setSaveState(kind);
    setSaveError(null);
    setStatusMessage(null);
    // Affinity signal + optimistic local cache; not yet a "saved" claim.
    recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    const claim = await saveSparkDurable(card, note.trim() || undefined);
    if (claim.confirmed) {
      setKept(true);
      setSaveState("idle");
      setStatusMessage(success);
      return;
    }
    // Durable write failed: tell the truth, offer retry.
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
            ← Back to My Personal Library
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
            {storyParagraphs.map((paragraph, index) => (
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
              {explorePoints.map((point, index) => (
                <p key={`explore-${index}`}>{point}</p>
              ))}
            </div>

            <div className="tsc-notes">
              <label className="tsc-notes-label" htmlFor={`tsc-note-${card.id}`}>
                My notes and ideas
              </label>
              <textarea
                id={`tsc-note-${card.id}`}
                className="tsc-notes-input"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What do you want to remember, try, or revisit?"
              />
            </div>
          </section>

          <div className="tsc-actions">
            <button
              type="button"
              className="tsc-save"
              onClick={() =>
                void persist("savingSpark", "Saved to My Spark Collection")
              }
              aria-pressed={kept}
              disabled={saving}
            >
              {saveState === "savingSpark"
                ? "Saving…"
                : kept
                  ? "Saved to My Spark Collection"
                  : "Save This Spark"}
            </button>
            <button
              type="button"
              className="tsc-secondary"
              onClick={() =>
                void persist("savingNote", "Note saved to My Spark Collection")
              }
              disabled={saving || note.trim().length === 0}
            >
              {saveState === "savingNote" ? "Saving…" : "Save My Note"}
            </button>
            <button
              type="button"
              className="tsc-secondary"
              onClick={() => requestClose()}
            >
              Close for Now
            </button>
          </div>

          {statusMessage ? (
            <p className="tsc-status" role="status" aria-live="polite">
              {statusMessage}
            </p>
          ) : null}
          {saveState === "error" && saveError ? (
            <div className="tsc-status tsc-status--error" role="alert">
              <span>{saveError}</span>
              <button
                type="button"
                className="tsc-secondary"
                onClick={() =>
                  void persist("savingSpark", "Saved to My Spark Collection")
                }
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
