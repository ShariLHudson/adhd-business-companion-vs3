"use client";

import { useEffect, useState } from "react";
import {
  getReflectionQuestionForWeek,
  getWeeklyReflection,
  GROWTH_REFLECTION_UPDATED_EVENT,
  saveReflectionToJourney,
  saveWeeklyReflection,
} from "@/lib/growthReflection";
import { weekKeyForDate } from "@/lib/weeklyWins";

const INPUT_CLASS =
  "mt-2 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

export function GrowthReflectionCard({ refreshKey = 0 }: { refreshKey?: string | number }) {
  const [answer, setAnswer] = useState("");
  const [savedToJourney, setSavedToJourney] = useState(false);
  const weekKey = weekKeyForDate();
  const question = getReflectionQuestionForWeek(weekKey);

  useEffect(() => {
    const entry = getWeeklyReflection(weekKey);
    setAnswer(entry?.answer ?? "");
    setSavedToJourney(entry?.savedToJourney ?? false);
  }, [weekKey, refreshKey]);

  useEffect(() => {
    const onUpdate = () => {
      const entry = getWeeklyReflection(weekKey);
      setAnswer(entry?.answer ?? "");
      setSavedToJourney(entry?.savedToJourney ?? false);
    };
    window.addEventListener(GROWTH_REFLECTION_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(GROWTH_REFLECTION_UPDATED_EVENT, onUpdate);
  }, [weekKey]);

  return (
    <div className="rounded-2xl border border-[#e7d9c8] bg-white p-4">
      <h3 className="text-sm font-bold text-[#2f261f]">Reflection</h3>
      <p className="mt-1 text-xs text-[#6f6259]">One small question this week.</p>
      <p className="mt-2 text-sm font-medium text-[#2f261f]">{question}</p>
      <textarea
        rows={2}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="A sentence or two is enough…"
        className={INPUT_CLASS}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!answer.trim()}
          onClick={() => saveWeeklyReflection(answer, weekKey)}
          className="rounded-full bg-[#2f261f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          Save reflection
        </button>
        <button
          type="button"
          disabled={!answer.trim() || savedToJourney}
          onClick={() => {
            saveWeeklyReflection(answer, weekKey);
            saveReflectionToJourney(weekKey);
            setSavedToJourney(true);
          }}
          className="rounded-full border border-[#e7d9c8] px-3 py-1.5 text-xs font-semibold text-[#2f261f] disabled:opacity-40"
        >
          {savedToJourney ? "Saved to Journey" : "Add to My Journey"}
        </button>
      </div>
    </div>
  );
}
