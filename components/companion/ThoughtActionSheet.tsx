"use client";

import { useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { normalizeCategory } from "@/lib/brainDumpCategories";
import {
  THOUGHT_ACTION_LABEL,
  THOUGHT_ACTION_ORDER,
  type ThoughtAction,
} from "@/lib/thoughtActions";
import { ThoughtCategoryPicker } from "@/components/companion/ThoughtCategoryPicker";

const SELECT_CLASS =
  "mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const markDoneClass =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const MORE_ACTIONS: ThoughtAction[] = THOUGHT_ACTION_ORDER.filter(
  (a) => a !== "mark-done",
);

export function ThoughtActionSheet({
  entry,
  onAction,
  onCategoryChange,
}: {
  entry: BrainDumpEntry;
  onAction: (action: ThoughtAction) => void;
  onCategoryChange?: (category: string) => void;
}) {
  const [moreAction, setMoreAction] = useState("");

  function handleMoreAction(value: string) {
    if (!value) return;
    const action = value as ThoughtAction;
    onAction(action);
    setMoreAction("");
  }

  return (
    <div
      className="companion-fade-in mt-3 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 p-4"
      data-testid="thought-action-sheet"
      role="region"
      aria-label={`Actions for ${entry.text}`}
    >
      <p className="text-base font-medium leading-relaxed text-[#1f1c19]">
        {entry.text}
      </p>

      {onCategoryChange ? (
        <div className="mt-3">
          <ThoughtCategoryPicker
            value={entry.category ?? normalizeCategory(entry.category)}
            onChange={onCategoryChange}
          />
        </div>
      ) : null}

      <p className="mt-4 text-base font-medium text-[#6b635a]">
        What would you like to do next?
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={() => onAction("mark-done")}
          className={markDoneClass}
          data-testid="thought-action-mark-done"
        >
          ✓ {THOUGHT_ACTION_LABEL["mark-done"]}
        </button>

        <label className="min-w-[12rem] flex-1 text-base font-semibold text-[#1f1c19] sm:max-w-xs">
          More actions
          <select
            value={moreAction}
            onChange={(e) => handleMoreAction(e.target.value)}
            className={SELECT_CLASS}
            data-testid="thought-action-more-select"
            aria-label="More actions"
          >
            <option value="">Select action…</option>
            {MORE_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {THOUGHT_ACTION_LABEL[action]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
