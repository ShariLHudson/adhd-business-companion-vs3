"use client";

import { useMemo, useState } from "react";
import {
  filterGoalPickerGroups,
  groupGoalsForPicker,
  listLinkableOutcomeGoals,
} from "@/lib/goals/goalPickerGroups";

const SELECT_CLASS =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

const SEARCH_CLASS =
  "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function OutcomeGoalLinkPicker({
  value,
  onChange,
  label = "Link to goal",
  allowEmpty = true,
  excludeIds = [],
  helperText,
}: {
  value?: string | null;
  onChange: (goalId: string | undefined) => void;
  label?: string;
  allowEmpty?: boolean;
  /** Hide goals already selected elsewhere (multi-link add flow). */
  excludeIds?: string[];
  helperText?: string;
}) {
  const [search, setSearch] = useState("");
  const groups = useMemo(() => {
    const available = listLinkableOutcomeGoals().filter(
      (g) => !excludeIds.includes(g.id),
    );
    return filterGoalPickerGroups(groupGoalsForPicker(available), search);
  }, [search, excludeIds]);

  return (
    <div data-testid="outcome-goal-link-picker">
      <label className="block text-sm font-semibold text-[#1f1c19]">
        {label}
        {helperText ? (
          <span className="mt-0.5 block text-xs font-normal text-[#9a8f82]">
            {helperText}
          </span>
        ) : null}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search goals…"
          className={`${SEARCH_CLASS} mt-2`}
          aria-label="Search goals"
        />
        <select
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? e.target.value : undefined)
          }
          className={SELECT_CLASS}
        >
          {allowEmpty ? <option value="">None</option> : null}
          {groups.length === 0 ? (
            <option value="" disabled>
              {search.trim() ? "No matching goals" : "No active goals yet"}
            </option>
          ) : (
            groups.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.statement}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>
      </label>
    </div>
  );
}
