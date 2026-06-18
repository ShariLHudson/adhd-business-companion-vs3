"use client";

import { useMemo, useState } from "react";
import {
  categoriesForGroup,
  getCategory,
  strategiesFor,
  type Strategy,
} from "@/lib/strategySystem";
import { compareDropdownLabels } from "@/lib/dropdownSort";
import {
  COACHING_LIBRARY_CATEGORY_THRESHOLD,
  coachingLibraryCategoryCount,
  shouldUseCoachingLibraryDropdowns,
} from "@/lib/coachingLibraryUi";

export { shouldUseCoachingLibraryDropdowns, coachingLibraryCategoryCount };

type Props = {
  onOpenStrategy: (strategyId: string) => void;
  onApplyWithShari?: (strategyId: string) => void;
  /** Compact layout for hub section vs full browse page. */
  variant?: "hub" | "page";
};

export function CoachingLibraryPicker({
  onOpenStrategy,
  onApplyWithShari,
  variant = "hub",
}: Props) {
  const categories = useMemo(
    () =>
      categoriesForGroup("business").filter(
        (c) => strategiesFor(c.id).length > 0,
      ),
    [],
  );
  const [categoryId, setCategoryId] = useState("");
  const [strategyId, setStrategyId] = useState("");

  const strategies = useMemo(() => {
    if (!categoryId) return [];
    return strategiesFor(categoryId).sort((a, b) =>
      compareDropdownLabels(a.title, b.title),
    );
  }, [categoryId]);

  const selected: Strategy | undefined = strategyId
    ? strategies.find((s) => s.id === strategyId)
    : undefined;

  function onCategoryChange(next: string) {
    setCategoryId(next);
    setStrategyId("");
  }

  const useDropdowns = shouldUseCoachingLibraryDropdowns();

  if (!useDropdowns) {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const n = strategiesFor(cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoryId(cat.id);
                const first = strategiesFor(cat.id)[0];
                if (first) {
                  setStrategyId(first.id);
                  onOpenStrategy(first.id);
                }
              }}
              className="rounded-full border border-[#1e4f4f]/20 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              {cat.emoji} {cat.label} ({n})
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label
          htmlFor={`coaching-cat-${variant}`}
          className="text-sm font-semibold text-[#1f1c19]"
        >
          Category
        </label>
        <select
          id={`coaching-cat-${variant}`}
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select a category…</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.label} ({strategiesFor(cat.id).length})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`coaching-strat-${variant}`}
          className="text-sm font-semibold text-[#1f1c19]"
        >
          Strategy
        </label>
        <select
          id={`coaching-strat-${variant}`}
          value={strategyId}
          disabled={!categoryId}
          onChange={(e) => setStrategyId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f] disabled:opacity-50"
        >
          <option value="">
            {categoryId ? "Select a strategy…" : "Choose a category first…"}
          </option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="mt-1 text-sm text-[#6b635a]">{selected.whenToUse}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!strategyId}
          onClick={() => strategyId && onOpenStrategy(strategyId)}
          className="flex-1 rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-3 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
        >
          Open strategy
        </button>
        {onApplyWithShari ? (
          <button
            type="button"
            disabled={!strategyId}
            onClick={() => strategyId && onApplyWithShari(strategyId)}
            className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          >
            Apply with Shari
          </button>
        ) : null}
      </div>

      {categoryId && getCategory(categoryId) ? (
        <p className="text-xs text-[#9a8f82]">
          {categories.length} categories — dropdown mode keeps choices calm (max{" "}
          {COACHING_LIBRARY_CATEGORY_THRESHOLD} chips).
        </p>
      ) : null}
    </div>
  );
}
