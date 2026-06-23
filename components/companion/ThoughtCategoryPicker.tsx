"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadCustomBrainDumpCategories,
  QUICK_PICK_CATEGORIES,
  saveCustomBrainDumpCategory,
} from "@/lib/brainDumpCustomCategories";
import { normalizeCategory, sortedBrainDumpCategoryGroups } from "@/lib/brainDumpCategories";

const SELECT_CLASS =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const NEW_CATEGORY_VALUE = "__new_category__";

export function ThoughtCategoryPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (category: string) => void;
}) {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setCustomCategories(loadCustomBrainDumpCategories());
  }, []);

  const current = normalizeCategory(value);
  const groups = useMemo(() => sortedBrainDumpCategoryGroups(), []);

  const selectValue = useMemo(() => {
    const all = new Set([
      ...QUICK_PICK_CATEGORIES,
      ...groups.flatMap((g) => g.categories),
      ...customCategories,
      "Other",
    ]);
    if (all.has(current)) return current;
    if (current && current !== "Other") return current;
    return current;
  }, [current, customCategories, groups]);

  function handleSelect(next: string) {
    if (next === NEW_CATEGORY_VALUE) {
      setShowNewInput(true);
      return;
    }
    setShowNewInput(false);
    onChange(next);
  }

  function submitNewCategory() {
    const saved = saveCustomBrainDumpCategory(newName);
    if (!saved) return;
    setCustomCategories(loadCustomBrainDumpCategories());
    setNewName("");
    setShowNewInput(false);
    onChange(saved);
  }

  return (
    <div data-testid="thought-category-picker">
      <label className="block text-base font-semibold text-[#1f1c19]">
        Category
        <select
          value={selectValue}
          onChange={(e) => handleSelect(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Thought category"
        >
          <optgroup label="Quick picks">
            {QUICK_PICK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          {groups.map((g) => (
            <optgroup key={g.group} label={`${g.emoji} ${g.group}`}>
              {g.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          ))}
          {customCategories.length > 0 ? (
            <optgroup label="Your categories">
              {customCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          ) : null}
          <option value="Other">Other</option>
          <option value={NEW_CATEGORY_VALUE}>+ New Category…</option>
        </select>
      </label>

      {showNewInput ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name your category…"
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            data-testid="new-category-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitNewCategory();
              }
            }}
          />
          <button
            type="button"
            onClick={submitNewCategory}
            disabled={!newName.trim()}
            className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          >
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}
