"use client";

import { useState } from "react";
import type { SparkNoteDailyCard, SparkNoteReaction } from "@/lib/sparkNote/types";
import {
  getSparkReactions,
  recordSparkNoteReaction,
  toggleSparkNoteFavorite,
} from "@/lib/sparkNote/persistence";

type Props = {
  card: SparkNoteDailyCard;
  onClose: () => void;
  onOpenCollection: () => void;
};

const REACTIONS: {
  id: SparkNoteReaction;
  label: string;
  emoji: string;
}[] = [
  { id: "loved", label: "Loved it", emoji: "🔥" },
  { id: "smile", label: "Made me smile", emoji: "😊" },
  { id: "idea", label: "Gave me an idea", emoji: "💡" },
  { id: "save", label: "Save for later", emoji: "⭐" },
];

function sparkTypeLabel(type: SparkNoteDailyCard["sparkType"]): string {
  switch (type) {
    case "quick":
      return "Quick Spark";
    case "deep":
      return "Deep Spark";
    default:
      return "Story Spark";
  }
}

async function copySparkPrompt(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Expanded Spark Note card — story, reactions, gentle connections. */
export function SparkNoteExpanded({ card, onClose, onOpenCollection }: Props) {
  const [reactions, setReactions] = useState(() => getSparkReactions(card.id));
  const [hint, setHint] = useState<string | null>(null);

  function showHint(message: string) {
    setHint(message);
    window.setTimeout(() => setHint(null), 2400);
  }

  function handleReaction(reaction: SparkNoteReaction) {
    recordSparkNoteReaction(card.id, reaction, card.category, card.tags);
    setReactions(getSparkReactions(card.id));
    if (reaction === "save") {
      showHint("Saved to My Sparks.");
    }
  }

  async function handleCaptureIdea() {
    const text = `${card.title}\n\n${card.sparkApplication}`;
    const ok = await copySparkPrompt(text);
    showHint(
      ok
        ? "Spark copied — paste anywhere you capture ideas."
        : "Spark application is right above if you want to jot it down.",
    );
    recordSparkNoteReaction(card.id, "idea", card.category, card.tags);
    setReactions(getSparkReactions(card.id));
  }

  async function handleJournalSeed() {
    const text = `Today's Spark: ${card.title}\n${card.teaser}\n\n${card.sparkApplication}`;
    const ok = await copySparkPrompt(text);
    showHint(
      ok
        ? "Copied for your journal — paste when you're ready."
        : "No pressure — the Spark will be here when you return.",
    );
  }

  function handleSave() {
    const saved = toggleSparkNoteFavorite(card.id);
    recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    setReactions(getSparkReactions(card.id));
    showHint(saved ? "Saved to My Sparks." : "Removed from My Sparks.");
  }

  return (
    <div
      className="spark-note-expanded"
      role="dialog"
      aria-label={`Today's Spark: ${card.title}`}
      data-testid="spark-note-expanded"
    >
      <div className="spark-note-expanded__card">
        <header className="spark-note-expanded__header">
          <span className="spark-note-expanded__category">{card.categoryLabel}</span>
          <span className="spark-note-expanded__type">{sparkTypeLabel(card.sparkType)}</span>
          <button
            type="button"
            className="spark-note-expanded__close"
            onClick={onClose}
            aria-label="Close Spark Note"
          >
            ×
          </button>
        </header>

        <div className="spark-note-expanded__hero">
          <p className="spark-note-expanded__label">Today&apos;s Spark</p>
          {card.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageSrc}
              alt=""
              className="spark-note-expanded__image"
            />
          ) : null}
          <h2 className="spark-note-expanded__title">{card.title}</h2>
          <p className="spark-note-expanded__teaser">{card.teaser}</p>
        </div>

        <div className="spark-note-expanded__body">
          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">What Happened?</h3>
            <p>{card.whatHappened}</p>
          </section>

          {card.whyInteresting ? (
            <section className="spark-note-expanded__section">
              <h3 className="spark-note-expanded__section-title">
                Why Is It Interesting?
              </h3>
              <p>{card.whyInteresting}</p>
            </section>
          ) : null}

          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">Why It Matters</h3>
            <p>{card.whyItMatters}</p>
          </section>

          <section className="spark-note-expanded__section spark-note-expanded__section--spark">
            <h3 className="spark-note-expanded__section-title">Spark It Into Your Life</h3>
            <p>{card.sparkApplication}</p>
          </section>
        </div>

        <div className="spark-note-expanded__reactions" aria-label="Spark reactions">
          <p className="spark-note-expanded__reactions-label">How did this land?</p>
          <div className="spark-note-expanded__reactions-row">
            {REACTIONS.map((reaction) => {
              const active = reactions.includes(reaction.id);
              return (
                <button
                  key={reaction.id}
                  type="button"
                  className={[
                    "spark-note-expanded__reaction",
                    active ? "spark-note-expanded__reaction--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={reaction.label}
                  aria-pressed={active}
                  onClick={() => handleReaction(reaction.id)}
                >
                  <span aria-hidden>{reaction.emoji}</span>
                  <span className="spark-note-expanded__reaction-text">
                    {reaction.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="spark-note-expanded__connections" aria-label="Gentle next steps">
          <p className="spark-note-expanded__connections-label">Optional — no pressure</p>
          <div className="spark-note-expanded__connections-row">
            <button type="button" className="spark-note-expanded__connection" onClick={handleCaptureIdea}>
              💡 Capture an idea
            </button>
            <button type="button" className="spark-note-expanded__connection" onClick={handleJournalSeed}>
              📓 Add to journal
            </button>
            <button type="button" className="spark-note-expanded__connection" onClick={handleSave}>
              ⭐ Save Spark
            </button>
            <button
              type="button"
              className="spark-note-expanded__connection"
              onClick={onOpenCollection}
            >
              📌 My Sparks
            </button>
          </div>
        </div>

        {hint ? (
          <p className="spark-note-expanded__hint" role="status">
            {hint}
          </p>
        ) : null}

        <footer className="spark-note-expanded__footer">
          <span className="spark-note-expanded__footer-icon" aria-hidden>
            🔥
          </span>
          <span>A little spark of curiosity. A lot of good for your day.</span>
        </footer>
      </div>
    </div>
  );
}
