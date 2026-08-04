"use client";

import { useMemo } from "react";
import { OutcomeGoalLinkPicker } from "@/components/companion/OutcomeGoalLinkPicker";
import { listLinkableOutcomeGoals } from "@/lib/goals/goalPickerGroups";

export function OutcomeGoalMultiLinkPicker({
  value,
  onChange,
  label = "Link to goal (optional)",
  helperText,
}: {
  value: string[];
  onChange: (goalIds: string[]) => void;
  label?: string;
  helperText?: string;
}) {
  const goalsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of listLinkableOutcomeGoals()) {
      map.set(g.id, g.statement);
    }
    return map;
  }, []);

  function remove(goalId: string) {
    onChange(value.filter((id) => id !== goalId));
  }

  function add(goalId: string | undefined) {
    if (!goalId || value.includes(goalId)) return;
    onChange([...value, goalId]);
  }

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/50 p-3"
      data-testid="outcome-goal-multi-link-picker"
    >
      <p className="text-sm font-semibold text-[#1f1c19]">{label}</p>
      {helperText ? (
        <p className="mt-1 text-xs leading-relaxed text-[#9a8f82]">{helperText}</p>
      ) : null}

      {value.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((id) => (
            <li key={id}>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e7dfd4] bg-white px-3 py-1 text-xs font-semibold text-[#1f1c19]">
                {goalsById.get(id) ?? "Goal"}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="text-[#9a8f82] hover:text-[#1f1c19]"
                  aria-label="Remove goal link"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3">
        <OutcomeGoalLinkPicker
          key={value.join(",")}
          label="Select goal"
          allowEmpty
          excludeIds={value}
          onChange={add}
          helperText="Pick one goal at a time — archived goals are hidden."
        />
      </div>
    </div>
  );
}
