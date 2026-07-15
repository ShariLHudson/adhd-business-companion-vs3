"use client";

import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
};

/**
 * One large input + Add — no categories, times, or extras.
 */
export function PlanDaySimpleAdd({ onAdd }: Props) {
  const [title, setTitle] = useState("");

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  }

  return (
    <div className="flex flex-col gap-3" data-testid="plan-day-simple-add">
      <label className="sr-only" htmlFor="plan-day-simple-input">
        What would you like to do today?
      </label>
      <input
        id="plan-day-simple-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="What would you like to do today?"
        className="w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-4 text-lg text-[#1f1c19] outline-none placeholder:text-[#9a8f82] focus:border-[#1e4f4f]"
        data-testid="plan-day-simple-input"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className="companion-btn-primary self-start rounded-xl px-6 py-3 text-base font-semibold disabled:opacity-40"
        data-testid="plan-day-simple-add-button"
      >
        Add
      </button>
    </div>
  );
}
