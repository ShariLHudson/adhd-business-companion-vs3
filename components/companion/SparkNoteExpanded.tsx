"use client";

import { useState } from "react";
import type { SparkNoteDailyCard, SparkNoteReaction } from "@/lib/sparkNote/types";
import { SparkFlameIcon } from "@/components/companion/SparkFlameIcon";
import {
  buildSparkIdeaClipboard,
  buildSparkJournalSeed,
  copySparkNoteText,
  navigateToSparkDestination,
  type SparkNoteDestination,
} from "@/lib/sparkNote/sparkNoteDestinations";
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

type PickerMode = null | "capture-idea" | "idea-flow";

const CORE_REACTIONS: {
  id: SparkNoteReaction;
  label: string;
  emoji: string;
}[] = [
  { id: "loved", label: "Loved it", emoji: "❤️" },
  { id: "smile", label: "Made me smile", emoji: "😊" },
  { id: "idea", label: "Gave me an idea", emoji: "💡" },
];

const CAPTURE_DESTINATIONS: {
  id: SparkNoteDestination;
  label: string;
  hint: string;
}[] = [
  { id: "idea-vault", label: "Idea Vault", hint: "I want to remember this." },
  {
    id: "momentum",
    label: "Chamber of Momentum™",
    hint: "I want to make this happen.",
  },
];

const IDEA_FLOW_OPTIONS = [
  { id: "capture", label: "Capture" },
  { id: "explore", label: "Explore" },
  { id: "project", label: "Connect to Project" },
] as const;

/** Expanded Spark Card™ — lightweight note, not an article panel. */
export function SparkNoteExpanded({ card, onClose, onOpenCollection }: Props) {
  const [reactions, setReactions] = useState(() => getSparkReactions(card.id));
  const [hint, setHint] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerMode>(null);
  const saved = reactions.includes("save");

  function showHint(message: string) {
    setHint(message);
    window.setTimeout(() => setHint(null), 2800);
  }

  function handleReaction(reaction: SparkNoteReaction) {
    if (reaction === "idea") {
      setPicker("idea-flow");
      return;
    }
    recordSparkNoteReaction(card.id, reaction, card.category, card.tags);
    setReactions(getSparkReactions(card.id));
  }

  function handleSave() {
    const nowSaved = toggleSparkNoteFavorite(card.id);
    recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    setReactions(getSparkReactions(card.id));
    if (nowSaved) {
      showHint("Saved to My Sparks.");
    } else {
      showHint("Removed from My Sparks.");
    }
  }

  async function routeToDestination(destination: SparkNoteDestination) {
    const text = buildSparkIdeaClipboard(card);
    const copied = await copySparkNoteText(text);
    setPicker(null);
    recordSparkNoteReaction(card.id, "idea", card.category, card.tags);
    setReactions(getSparkReactions(card.id));
    navigateToSparkDestination(destination, text);
    if (!copied) {
      showHint("Taking you there — your Spark is staged to paste when you arrive.");
    }
  }

  async function handleJournal() {
    const text = buildSparkJournalSeed(card);
    const copied = await copySparkNoteText(text);
    recordSparkNoteReaction(card.id, "idea", card.category, card.tags);
    navigateToSparkDestination("journal", text);
    if (!copied) {
      showHint("Opening your journal — paste when you're ready.");
    }
  }

  async function handleIdeaFlow(option: (typeof IDEA_FLOW_OPTIONS)[number]["id"]) {
    if (option === "capture") {
      setPicker("capture-idea");
      return;
    }
    if (option === "explore") {
      const text = buildSparkIdeaClipboard(card);
      const ok = await copySparkNoteText(text);
      setPicker(null);
      recordSparkNoteReaction(card.id, "idea", card.category, card.tags);
      setReactions(getSparkReactions(card.id));
      showHint(
        ok
          ? "Spark copied — explore it anywhere you like."
          : "The Spark prompt is right above whenever you want it.",
      );
      return;
    }
    setPicker(null);
    await routeToDestination("momentum");
  }

  async function handleConnectProject() {
    await routeToDestination("momentum");
  }

  const storyText = [card.whatHappened, card.whyInteresting]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="spark-note-expanded"
      role="dialog"
      aria-label={`Today's Spark: ${card.title}`}
      data-testid="spark-note-expanded"
    >
      <div className="spark-note-expanded__card">
        <header className="spark-note-expanded__header">
          <div className="spark-note-expanded__header-top">
            <div className="spark-note-expanded__brand">
              <span className="spark-note-expanded__brand-flame" aria-hidden>
                <SparkFlameIcon className="spark-note-expanded__brand-flame-svg" />
              </span>
              <span className="spark-note-expanded__brand-label">Today&apos;s Spark</span>
            </div>
            <button
              type="button"
              className="spark-note-expanded__close"
              onClick={onClose}
              aria-label="Close Spark Card"
            >
              ×
            </button>
          </div>
          <span className="spark-note-expanded__category">{card.categoryLabel}</span>
          <h2 className="spark-note-expanded__title">{card.title}</h2>
        </header>

        <div className="spark-note-expanded__body">
          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">What Happened?</h3>
            <p>{storyText}</p>
          </section>

          <section className="spark-note-expanded__section">
            <h3 className="spark-note-expanded__section-title">Why It Matters</h3>
            <p>{card.whyItMatters}</p>
          </section>

          <section className="spark-note-expanded__section spark-note-expanded__section--spark">
            <h3 className="spark-note-expanded__section-title">Spark It</h3>
            <p>{card.sparkApplication}</p>
          </section>
        </div>

        <div className="spark-note-expanded__actions" aria-label="Spark reactions">
          <div className="spark-note-expanded__reactions-row">
            {CORE_REACTIONS.map((reaction) => {
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
                  <span className="spark-note-expanded__reaction-emoji" aria-hidden>
                    {reaction.emoji}
                  </span>
                  <span className="spark-note-expanded__reaction-text">
                    {reaction.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={[
              "spark-note-expanded__save",
              saved ? "spark-note-expanded__save--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleSave}
            aria-pressed={saved}
          >
            <span aria-hidden>⭐</span> Save Spark
          </button>
        </div>

        {picker === "capture-idea" ? (
          <div className="spark-note-expanded__picker" role="group" aria-label="Where should this idea go?">
            <p className="spark-note-expanded__picker-label">
              Where would you like this idea to go?
            </p>
            <div className="spark-note-expanded__picker-row">
              {CAPTURE_DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  className="spark-note-expanded__picker-option"
                  onClick={() => void routeToDestination(dest.id)}
                >
                  <span className="spark-note-expanded__picker-option-title">
                    {dest.label}
                  </span>
                  <span className="spark-note-expanded__picker-option-hint">
                    {dest.hint}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="spark-note-expanded__picker-cancel"
              onClick={() => setPicker(null)}
            >
              Stay with this Spark
            </button>
          </div>
        ) : null}

        {picker === "idea-flow" ? (
          <div
            className="spark-note-expanded__picker"
            role="group"
            aria-label="What would you like to do with this idea?"
          >
            <p className="spark-note-expanded__picker-label">
              What would you like to do with this idea?
            </p>
            <div className="spark-note-expanded__picker-row spark-note-expanded__picker-row--compact">
              {IDEA_FLOW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="spark-note-expanded__picker-chip"
                  onClick={() => void handleIdeaFlow(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="spark-note-expanded__picker-cancel"
              onClick={() => setPicker(null)}
            >
              Stay with this Spark
            </button>
          </div>
        ) : null}

        {!picker ? (
          <div className="spark-note-expanded__optional" aria-label="Optional actions">
            <button
              type="button"
              className="spark-note-expanded__optional-btn"
              onClick={() => void handleJournal()}
            >
              📓 Add to Journal
            </button>
            <button
              type="button"
              className="spark-note-expanded__optional-btn"
              onClick={() => void handleConnectProject()}
            >
              🔗 Connect to Project
            </button>
            {saved ? (
              <button
                type="button"
                className="spark-note-expanded__optional-btn spark-note-expanded__optional-btn--link"
                onClick={onOpenCollection}
              >
                🔥 My Sparks
              </button>
            ) : null}
          </div>
        ) : null}

        {hint ? (
          <p className="spark-note-expanded__hint" role="status">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
