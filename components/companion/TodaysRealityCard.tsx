"use client";

import { useEffect, useState } from "react";
import { getDayState, type DayState } from "@/lib/companionStore";
import {
  formatTodaysRealityLines,
  isDayStateFromToday,
} from "@/lib/dayReality";

export function TodaysRealityCard({
  onUpdate,
  refreshKey = 0,
}: {
  onUpdate?: () => void;
  refreshKey?: number;
}) {
  const [snapshot, setSnapshot] = useState<DayState | null>(null);

  useEffect(() => {
    setSnapshot(getDayState());
  }, [refreshKey]);

  if (!snapshot || !isDayStateFromToday(snapshot)) {
    return (
      <div
        className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/90 p-5"
        data-testid="todays-reality-prompt"
      >
        <p className="text-xl font-semibold text-[#1f1c19]">
          What kind of day are you having?
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          Share energy, motivation, and how you feel — it helps shape a plan
          that fits your real day.
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#9a8f82]">
          Your day can change. Update this anytime.
        </p>
        {onUpdate ? (
          <button
            type="button"
            onClick={onUpdate}
            className="mt-4 rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
            data-testid="adapt-my-day-entry"
          >
            Adapt My Day
          </button>
        ) : null}
      </div>
    );
  }

  const lines = formatTodaysRealityLines(snapshot);

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-white/90 p-5"
      data-testid="todays-reality-card"
    >
      <p className="text-xl font-semibold text-[#1f1c19]">
        What kind of day are you having?
      </p>
      <dl className="mt-4 space-y-2.5 text-base text-[#3d3630]">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-[#1f1c19]">Energy:</dt>
          <dd>{lines.energy}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-[#1f1c19]">Motivation:</dt>
          <dd>{lines.motivation}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-[#1f1c19]">Emotion:</dt>
          <dd>{lines.emotion}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-[#1f1c19]">Physical:</dt>
          <dd>{lines.physical}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 text-[#6b635a]">
          <dt className="font-medium">Last updated:</dt>
          <dd>{lines.updatedAt}</dd>
        </div>
      </dl>
      <p className="mt-3 text-base leading-relaxed text-[#9a8f82]">
        Your day can change. Update this anytime.
      </p>
      {onUpdate ? (
        <button
          type="button"
          onClick={onUpdate}
          className="mt-4 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/5 px-5 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
          data-testid="adapt-my-day-entry"
        >
          Update My Day
        </button>
      ) : null}
    </div>
  );
}
