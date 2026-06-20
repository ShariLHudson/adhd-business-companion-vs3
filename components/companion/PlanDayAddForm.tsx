"use client";

import { useState } from "react";
import {
  PLAN_CATEGORY_OPTIONS,
  type PlanLifeDomain,
  type QuickPlanItemInput,
} from "@/lib/planMyDay";

const FIELD =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

type Props = {
  onAdd: (input: QuickPlanItemInput) => void;
  compact?: boolean;
};

export function PlanDayAddForm({ onAdd, compact = false }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PlanLifeDomain | "auto">("auto");
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00");

  function reset() {
    setTitle("");
    setCategory("auto");
    setHasTime(false);
    setStartTime("09:00");
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      category,
      startTime: hasTime ? startTime : undefined,
    });
    reset();
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Task or reminder…"
        aria-label="New plan item"
        className={`${FIELD} w-full text-base py-2.5`}
      />

      <div
        className={`flex flex-wrap gap-2 ${compact ? "flex-col sm:flex-row sm:items-center" : "items-center"}`}
      >
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-[#6b635a]">
          <span className="shrink-0">Category</span>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as PlanLifeDomain | "auto")
            }
            className={`${FIELD} min-w-0 flex-1`}
            aria-label="Category"
          >
            {PLAN_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-[#6b635a]">
          <input
            type="checkbox"
            checked={hasTime}
            onChange={(e) => setHasTime(e.target.checked)}
            className="h-4 w-4 accent-[#1e4f4f]"
          />
          Specific time
        </label>

        {hasTime ? (
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={FIELD}
            aria-label="Time"
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className="companion-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 sm:w-auto sm:self-end"
      >
        Add to today
      </button>
    </div>
  );
}
