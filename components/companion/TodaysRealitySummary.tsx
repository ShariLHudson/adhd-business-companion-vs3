"use client";

import { useCallback, useEffect, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import { isDayStateFromToday } from "@/lib/dayReality";
import { todaysRealityCardLines } from "@/lib/planMyDay/todaysRealityDisplay";

export function TodaysRealitySummary({
  onAdaptMyDay,
}: {
  onAdaptMyDay?: () => void;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const sync = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, [sync]);

  const snapshot = getDayState();
  const hasToday = snapshot && isDayStateFromToday(snapshot);

  if (!hasToday) {
    return (
      <div
        className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-3"
        data-testid="todays-reality-summary"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Today&apos;s Reality
        </p>
        <p className="mt-1 text-sm text-[#4b463f]">You haven&apos;t checked in yet.</p>
        {onAdaptMyDay ? (
          <button
            type="button"
            onClick={onAdaptMyDay}
            className="mt-3 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c3c]"
            data-testid="todays-reality-adapt"
          >
            Adapt My Day
          </button>
        ) : null}
      </div>
    );
  }

  const lines = todaysRealityCardLines(snapshot);

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-white/90 px-4 py-3"
      data-testid="todays-reality-summary"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Today&apos;s Reality
      </p>
      <ul className="mt-2 space-y-0.5 text-sm text-[#1f1c19]">
        <li>
          <span className="font-semibold">Energy:</span> {lines.energy}
        </li>
        <li>
          <span className="font-semibold">Focus:</span> {lines.focus}
        </li>
        <li>
          <span className="font-semibold">Capacity:</span> {lines.capacity}
        </li>
      </ul>
      {onAdaptMyDay ? (
        <button
          type="button"
          onClick={onAdaptMyDay}
          className="mt-3 rounded-lg border border-[#1e4f4f]/30 bg-[#f0f8f8] px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e0f0f0]"
          data-testid="todays-reality-update"
        >
          Update Reality
        </button>
      ) : null}
    </div>
  );
}
