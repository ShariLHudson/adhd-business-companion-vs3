"use client";

import { useState } from "react";
import {
  PRIORITY_MATRIX_QUADRANTS,
  formatPriorityCardLabel,
  priorityMatrixColumnId,
  quadrantForScores,
  type PriorityMatrixFocusLock,
} from "@/lib/visualFocus/priorityMatrix";
import type { VisualKanbanCard, VisualKanbanColumn } from "@/lib/visualFocus/types";

function newCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PriorityMatrixGuidedView({
  mapId,
  columns,
  cards,
  onChange,
}: {
  mapId: string;
  columns: VisualKanbanColumn[];
  cards: Record<string, VisualKanbanCard>;
  onChange: (columns: VisualKanbanColumn[], cards: Record<string, VisualKanbanCard>) => void;
}) {
  const [itemName, setItemName] = useState("");
  const [impact, setImpact] = useState(3);
  const [effort, setEffort] = useState(3);
  const [focusLock, setFocusLock] = useState<PriorityMatrixFocusLock>(null);

  const quadrant = quadrantForScores(impact, effort);
  const quadrantLabel =
    PRIORITY_MATRIX_QUADRANTS.find((q) => q.id === quadrant)?.label ?? "";

  function addItem() {
    const name = itemName.trim();
    if (!name) return;
    const cardId = newCardId();
    const label = formatPriorityCardLabel(name, impact, effort);
    const targetColId = priorityMatrixColumnId(mapId, quadrant);
    const nextCards = {
      ...cards,
      [cardId]: { id: cardId, label },
    };
    const nextCols = columns.map((col) =>
      col.id === targetColId
        ? { ...col, cardIds: [...col.cardIds, cardId] }
        : col,
    );
    onChange(nextCols, nextCards);
    setItemName("");
    setImpact(3);
    setEffort(3);
  }

  const lockedQuadrants = focusLock
    ? new Set([focusLock])
    : null;

  return (
    <div className="space-y-6" data-testid="priority-matrix-guided">
      <section className="rounded-2xl border border-[#e7dfd4] bg-white p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Add one item at a time
        </h3>
        <label className="mt-3 block text-sm font-semibold text-[#1f1c19]">
          What is this item?
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Update sales page"
            className="mt-1 w-full rounded-xl border border-[#e7dfd4] px-3 py-2 text-base focus:border-[#1e4f4f] focus:outline-none"
          />
        </label>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#1f1c19]">
            <span>Impact</span>
            <span className="text-[#6b635a]">{impact}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-[#9a8f82]">
            <span>Low</span>
            <span>High</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
            className="mt-1 w-full accent-[#1e4f4f]"
            aria-label="Impact"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#1f1c19]">
            <span>Effort</span>
            <span className="text-[#6b635a]">{effort}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-[#9a8f82]">
            <span>Low</span>
            <span>High</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={effort}
            onChange={(e) => setEffort(Number(e.target.value))}
            className="mt-1 w-full accent-[#1e4f4f]"
            aria-label="Effort"
          />
        </div>

        <p className="mt-3 text-sm text-[#6b635a]">
          Goes in: <span className="font-semibold text-[#1e4f4f]">{quadrantLabel}</span>
        </p>

        <button
          type="button"
          onClick={addItem}
          disabled={!itemName.trim()}
          className="mt-4 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] disabled:opacity-50"
        >
          Place item
        </button>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Your matrix
          </h3>
          <div className="flex flex-wrap gap-2" data-testid="priority-matrix-focus-lock">
            <span className="text-xs font-semibold text-[#6b635a] self-center">Focus Lock™</span>
            <button
              type="button"
              onClick={() => setFocusLock(focusLock === "quick-wins" ? null : "quick-wins")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                focusLock === "quick-wins"
                  ? "bg-[#1e4f4f] text-white"
                  : "border border-[#e7dfd4] text-[#1f1c19] hover:bg-[#faf7f2]"
              }`}
            >
              Quick Wins
            </button>
            <button
              type="button"
              onClick={() =>
                setFocusLock(focusLock === "major-projects" ? null : "major-projects")
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                focusLock === "major-projects"
                  ? "bg-[#1e4f4f] text-white"
                  : "border border-[#e7dfd4] text-[#1f1c19] hover:bg-[#faf7f2]"
              }`}
            >
              Major Projects
            </button>
            {focusLock ? (
              <button
                type="button"
                onClick={() => setFocusLock(null)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
              >
                Show all
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRIORITY_MATRIX_QUADRANTS.map((q) => {
            const colId = priorityMatrixColumnId(mapId, q.id);
            const col = columns.find((c) => c.id === colId);
            const isLocked = lockedQuadrants && !lockedQuadrants.has(q.id);
            return (
              <div
                key={q.id}
                className={`rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-3 transition ${
                  isLocked ? "opacity-40 blur-[1px]" : ""
                }`}
                data-testid={`priority-quadrant-${q.id}`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                  {q.label}
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {(col?.cardIds ?? []).map((cardId) => {
                    const card = cards[cardId];
                    if (!card) return null;
                    return (
                      <li
                        key={cardId}
                        className="rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm font-semibold text-[#1f1c19]"
                      >
                        {card.label}
                      </li>
                    );
                  })}
                  {(col?.cardIds.length ?? 0) === 0 ? (
                    <li className="text-xs text-[#9a8f82]">No items yet</li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
