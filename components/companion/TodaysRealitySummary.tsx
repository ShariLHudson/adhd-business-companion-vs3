"use client";

import { useCallback, useEffect, useState } from "react";
import { getDayState } from "@/lib/companionStore";
import {
  formatTodaysRealityLines,
  isDayStateFromToday,
} from "@/lib/dayReality";

/** Compact read-only snapshot — Today's Reality™ lives in the top bar. */
export function TodaysRealitySummary() {
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
      <p
        className="rounded-lg border border-dashed border-[#d4cdc3] bg-[#faf7f2]/80 px-3 py-2 text-sm text-[#6b635a]"
        data-testid="todays-reality-summary"
      >
        <span className="font-semibold text-[#4b463f]">Today&apos;s Reality:</span>{" "}
        No check-in yet — use{" "}
        <span className="font-semibold text-[#1e4f4f]">Today&apos;s Reality</span> in the
        top bar when you&apos;re ready.
      </p>
    );
  }

  const lines = formatTodaysRealityLines(snapshot);

  return (
    <p
      className="rounded-lg border border-[#e7dfd4] bg-white/80 px-3 py-2 text-sm text-[#4b463f]"
      data-testid="todays-reality-summary"
    >
      <span className="font-semibold text-[#1f1c19]">Today&apos;s Reality:</span>{" "}
      Energy {lines.energy} · Motivation {lines.motivation} · {lines.emotion}
      {lines.physical !== "—" ? ` · ${lines.physical}` : ""}
      <span className="text-[#9a8f82]"> · Updated {lines.updatedAt}</span>
    </p>
  );
}
