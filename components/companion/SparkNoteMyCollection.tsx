"use client";

import { topAffinityTopics } from "@/lib/sparkNote/preferenceLearning";
import { resolveMySparksCollection } from "@/lib/sparkNote/mySparksCollection";

type Props = {
  onClose: () => void;
  onBack: () => void;
};

/** Simple saved-Sparks shelf — not a complicated library. */
export function SparkNoteMyCollection({ onClose, onBack }: Props) {
  const saved = resolveMySparksCollection();
  const topics = topAffinityTopics(3);

  return (
    <div
      className="spark-note-collection"
      role="dialog"
      aria-label="My Sparks collection"
      data-testid="spark-note-my-collection"
    >
      <div className="spark-note-collection__card">
        <header className="spark-note-collection__header">
          <button type="button" className="spark-note-collection__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="spark-note-collection__title">My Sparks</h2>
          <button
            type="button"
            className="spark-note-collection__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="spark-note-collection__subtitle">
          Your collection of things that inspired you.
        </p>

        {topics.length > 0 ? (
          <div className="spark-note-collection__topics">
            <span className="spark-note-collection__topics-label">Favorite topics</span>
            <div className="spark-note-collection__topics-row">
              {topics.map((topic) => (
                <span key={topic} className="spark-note-collection__topic">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {saved.length === 0 ? (
          <p className="spark-note-collection__empty">
            Sparks you save will appear here — one tap on ⭐ when something resonates.
          </p>
        ) : (
          <ul className="spark-note-collection__list">
            {saved.map((item) => (
              <li key={item.id} className="spark-note-collection__item">
                <span className="spark-note-collection__item-category">
                  {item.categoryLabel}
                </span>
                <span className="spark-note-collection__item-title">{item.title}</span>
                <span className="spark-note-collection__item-teaser">{item.teaser}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
