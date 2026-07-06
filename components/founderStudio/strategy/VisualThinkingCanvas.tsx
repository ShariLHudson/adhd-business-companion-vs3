"use client";

import { useCallback, useRef, useState } from "react";

import type { StrategyCardColor, StrategyIdeaCard } from "@/lib/founder/strategyCenter/types";

type VisualThinkingCanvasProps = {
  cards: StrategyIdeaCard[];
  onCardsChange: (cards: StrategyIdeaCard[]) => void;
};

const CARD_COLORS: StrategyCardColor[] = ["teal", "aqua", "gold", "bronze", "purple", "neutral"];

function nextColor(current: StrategyCardColor): StrategyCardColor {
  const index = CARD_COLORS.indexOf(current);
  return CARD_COLORS[(index + 1) % CARD_COLORS.length] ?? "teal";
}

export function VisualThinkingCanvas({ cards, onCardsChange }: VisualThinkingCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    cardId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const updateCard = useCallback(
    (cardId: string, patch: Partial<StrategyIdeaCard>) => {
      onCardsChange(
        cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
      );
    },
    [cards, onCardsChange],
  );

  const handlePointerDown = (cardId: string, event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const cardEl = event.currentTarget as HTMLElement;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    dragRef.current = {
      cardId,
      offsetX: event.clientX - cardRect.left,
      offsetY: event.clientY - cardRect.top,
    };
    setDraggingId(cardId);
    cardEl.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(8, event.clientX - rect.left - drag.offsetX);
    const y = Math.max(8, event.clientY - rect.top - drag.offsetY);
    updateCard(drag.cardId, { x, y });
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    dragRef.current = null;
    setDraggingId(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const addCard = () => {
    const id = `idea-${Date.now()}`;
    onCardsChange([
      ...cards,
      {
        id,
        title: "New idea",
        body: "Capture a thought…",
        category: "Ideas",
        color: "gold",
        x: 60 + cards.length * 12,
        y: 60 + cards.length * 12,
      },
    ]);
  };

  return (
    <section className="strategy-canvas" aria-labelledby="strategy-canvas-heading">
      <div className="strategy-canvas__header">
        <div>
          <p className="strategy-zone__eyebrow" id="strategy-canvas-heading">
            Visual Thinking Canvas
          </p>
          <p className="strategy-canvas__hint">
            Drag cards. Color-code clusters. Connect ideas visually.
          </p>
        </div>
        <button type="button" className="strategy-canvas__add" onClick={addCard}>
          Add Idea Card
        </button>
      </div>

      <div
        ref={canvasRef}
        className="strategy-canvas__surface"
        onPointerMove={handlePointerMove}
      >
        <div className="strategy-canvas__grid" aria-hidden="true" />
        {cards.map((card) => (
          <article
            key={card.id}
            className={`strategy-card strategy-card--${card.color}${
              draggingId === card.id ? " strategy-card--dragging" : ""
            }`}
            style={{ left: card.x, top: card.y }}
            onPointerDown={(event) => handlePointerDown(card.id, event)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="strategy-card__top">
              {card.category ? (
                <span className="strategy-card__category">{card.category}</span>
              ) : null}
              <button
                type="button"
                className="strategy-card__color"
                onClick={(event) => {
                  event.stopPropagation();
                  updateCard(card.id, { color: nextColor(card.color) });
                }}
                aria-label="Change card color"
              />
            </div>
            <input
              className="strategy-card__title"
              value={card.title}
              onChange={(event) => updateCard(card.id, { title: event.target.value })}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Idea title"
            />
            <textarea
              className="strategy-card__body"
              value={card.body}
              onChange={(event) => updateCard(card.id, { body: event.target.value })}
              onPointerDown={(event) => event.stopPropagation()}
              rows={3}
              aria-label="Idea details"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
