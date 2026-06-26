"use client";

import { useState } from "react";
import {
  type QuickPlanItemInput,
} from "@/lib/planMyDay";
import { PlanDayLifeAreaSelector } from "@/components/companion/PlanDayLifeAreaSelector";

const FIELD =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

type Props = {
  onAdd: (input: QuickPlanItemInput) => void;
  compact?: boolean;
};

export function PlanDayAddForm({ onAdd, compact = false }: Props) {
  const [title, setTitle] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<string | null>(null);
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00");

  function reset() {
    setTitle("");
    setLifeAreaId(null);
    setHasTime(false);
    setStartTime("09:00");
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      lifeAreaId: lifeAreaId ?? "auto",
      startTime: hasTime ? startTime : undefined,
    });
    reset();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-4">
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (!e.target.value.trim()) setLifeAreaId(null);
        }}
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

      <PlanDayLifeAreaSelector
        taskText={title}
        value={lifeAreaId}
        onChange={setLifeAreaId}
        compact={compact}
      />

      <div
        className={`flex flex-wrap gap-2 ${compact ? "flex-col sm:flex-row sm:items-center" : "items-center"}`}
      >
        <label className="flex items-center gap-2 text-base font-semibold text-[#6b635a]">
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
        className="companion-btn-primary w-full rounded-xl px-5 py-3 text-base font-semibold disabled:opacity-40 sm:w-auto sm:self-end"
      >
        Add to today
      </button>
    </div>
  );
}
