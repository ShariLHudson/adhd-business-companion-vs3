"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import {
  resolveSparkCardSimplifiedPresentation,
  splitSparkCardStoryParagraphs,
  SPARK_CARD_SECTION_SPARK_IN_ACTION,
  SPARK_CARD_SECTION_STORY,
  SPARK_CARD_SECTION_TODAYS_SPARK,
} from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import { logSparkCardImageLoadError } from "@/lib/sparkNote/resolveSparkCardImage";
import { sparkEditionForCategory } from "@/lib/sparkNote/sparkEditions";
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
  // Hero image is the card's numbered Spark Edition cover (001 Discovery …
  // 012 Wonder), resolved from the card's category via the edition registry.
  // Only the hero changes by category; Story / Spark / Action / note stay put.
  const hero = useMemo(() => {
    const edition = sparkEditionForCategory(card.category);
    if (!edition) return null;
    return {
      src: edition.imageSrc,
      alt: `${card.categoryLabel} edition artwork for ${card.title}`,
    };
  }, [card.category, card.categoryLabel, card.title]);

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

  // Track the card whose hero image failed to load — comparing against the
  // current card.id resets automatically when a different card opens (no effect).
  const [failedCardId, setFailedCardId] = useState<string | null>(null);
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

  // The scroll container for the whole card. Every time a different card opens,
  // start reading from the very top (and clear any prior image-failure state).
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = 0;
      // Focus the scroll region so Page Up/Down and arrow keys work immediately.
      el.focus({ preventScroll: true });
    }
  }, [card.id]);

  const hasPhoto = Boolean(hero?.src) && failedCardId !== card.id;
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
      ref={scrollRef}
      className="tsc-shell tsc-shell--open"
      role="dialog"
      aria-modal="true"
      aria-label={`Today's Spark: ${presentation.title}. Click outside the card to close.`}
      data-testid="todays-spark-card"
      tabIndex={-1}
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

        {hero?.src ? (
          <div className="tsc-media-section">
            <figure className="tsc-figure">
              <div className="tsc-media-frame">
                {hasPhoto ? (
                  <img
                    className="tsc-hero-img"
                    src={hero.src}
                    alt={hero.alt}
                    decoding="async"
                    data-testid="todays-spark-hero"
                    onError={() => {
                      setFailedCardId(card.id);
                      logSparkCardImageLoadError({
                        cardId: card.id,
                        src: hero.src,
                        sourceField: "edition_cover",
                        error: "img_onerror",
                      });
                    }}
                  />
                ) : null}
              </div>
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
