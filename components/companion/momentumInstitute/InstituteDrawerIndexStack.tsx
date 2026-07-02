"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { KnowledgeCardViewModel } from "@/lib/momentumInstitute/drawerWall/knowledgeCardViewModel";

export const DRAWER_INITIAL_VISIBLE_CARDS = 3;

type Props = {
  drawerTitle: string;
  cards: KnowledgeCardViewModel[];
  openKnowledgeCardId: string | null;
  onSelectCard: (knowledgeCardId: string) => void;
  onClose: () => void;
};

export function InstituteDrawerIndexStack({
  drawerTitle,
  cards,
  openKnowledgeCardId,
  onSelectCard,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setRevealKey((key) => key + 1);
  }, [drawerTitle]);

  const hiddenCount = Math.max(0, cards.length - DRAWER_INITIAL_VISIBLE_CARDS);
  const visibleCards = expanded
    ? cards
    : cards.slice(0, DRAWER_INITIAL_VISIBLE_CARDS);

  return (
    <div
      className="institute-drawer-slide"
      role="dialog"
      aria-label={`${drawerTitle} index cards`}
      data-testid="institute-drawer-slide"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <header className="institute-drawer-slide__header">
        <div>
          <p className="institute-drawer-slide__eyebrow">Curated collection</p>
          <h2 className="institute-drawer-slide__title">{drawerTitle}</h2>
        </div>
        <button
          type="button"
          className="institute-drawer-slide__close"
          onClick={onClose}
          aria-label="Close drawer"
        >
          ×
        </button>
      </header>

      <ul
        key={revealKey}
        className="institute-drawer-slide__cards institute-drawer-slide__cards--stack"
      >
        {visibleCards.map((card, index) => {
          const isSelected = openKnowledgeCardId === card.id;
          return (
            <li
              key={card.id}
              className="institute-drawer-slide__card-slot"
              style={{ "--card-rise-index": index } as CSSProperties}
            >
              <button
                type="button"
                className={[
                  "institute-index-card",
                  "institute-index-card--stacked",
                  isSelected ? "institute-index-card--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectCard(card.id)}
                aria-pressed={isSelected}
              >
                <span className="institute-index-card__tab" aria-hidden />
                <span className="institute-index-card__title">{card.title}</span>
                <span className="institute-index-card__summary">{card.summary}</span>
                <span className="institute-index-card__meta">
                  <span>{card.estimatedMinutes} min</span>
                  <span>{card.difficultyLabel}</span>
                </span>
                <span className="institute-index-card__detail">
                  <span className="institute-index-card__detail-label">Competency</span>
                  <span>{card.competencyLabel}</span>
                </span>
                <span className="institute-index-card__detail">
                  <span className="institute-index-card__detail-label">Status</span>
                  <span
                    className={`institute-index-card__status institute-index-card__status--${card.status}`}
                  >
                    {card.statusLabel}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!expanded && hiddenCount > 0 ? (
        <button
          type="button"
          className="institute-drawer-slide__more"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCount} more
        </button>
      ) : null}
    </div>
  );
}
