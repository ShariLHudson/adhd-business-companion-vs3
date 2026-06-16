"use client";

import { useEffect, useState } from "react";
import {
  getTomorrowFocusForToday,
  markTomorrowFocusDone,
  type TomorrowFocusItem,
} from "@/lib/tomorrowFocus";

/** Surfaces yesterday's "work on tomorrow" items on the Today home view. */
export function FromYesterdayFocusCard({
  onOpenMomentum,
}: {
  onOpenMomentum?: () => void;
}) {
  const [items, setItems] = useState<TomorrowFocusItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getTomorrowFocusForToday());
    refresh();
    window.addEventListener("tomorrow-focus-updated", refresh);
    return () => window.removeEventListener("tomorrow-focus-updated", refresh);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-[#c9bfb0] bg-white/95 p-4 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        From yesterday
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        You wanted to revisit these today
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#e4ddd2] bg-[#faf6f0]/80 px-3 py-2"
          >
            <span className="text-base text-[#1f1c19]">{item.text}</span>
            <button
              type="button"
              onClick={() => {
                markTomorrowFocusDone(item.id);
                setItems(getTomorrowFocusForToday());
              }}
              className="shrink-0 text-sm font-semibold text-[#1e4f4f] hover:underline"
            >
              Done
            </button>
          </li>
        ))}
      </ul>
      {onOpenMomentum ? (
        <button
          type="button"
          onClick={onOpenMomentum}
          className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          See all on Momentum →
        </button>
      ) : null}
    </div>
  );
}
