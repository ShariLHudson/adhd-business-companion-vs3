"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildSuggestedGrowthMoments,
  ignoreSuggestedMoment,
  markSuggestedMomentProcessed,
  type SuggestedGrowthMoment,
} from "@/lib/suggestedGrowthMoments";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";

const HUB_INBOX_LIMIT = 3;

type Props = {
  onOpenWins: () => void;
};

export function GrowthHubInboxStrip({ onOpenWins }: Props) {
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener("companion-suggested-growth-updated", onUpdate);
    return () =>
      window.removeEventListener("companion-suggested-growth-updated", onUpdate);
  }, [reload]);

  const items = useMemo(() => buildSuggestedGrowthMoments(), [tick]);
  const visible = items.slice(0, HUB_INBOX_LIMIT);
  const overflow = items.length - visible.length;

  if (items.length === 0) return null;

  function saveAsWin(item: SuggestedGrowthMoment) {
    createSavedGrowthWin({
      whatHappened: item.whatHappened,
      ts: item.ts,
      icon: item.icon,
      sourceId: item.sourceId,
      classification: item.classification,
      attachments: [],
    });
    markSuggestedMomentProcessed(item.sourceId);
    reload();
  }

  function dismiss(item: SuggestedGrowthMoment) {
    ignoreSuggestedMoment(item.sourceId);
    reload();
  }

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 p-4"
      data-testid="growth-hub-inbox"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1f1c19]">Growth Inbox</p>
          <p className="mt-0.5 text-xs text-[#6b635a]">
            Moments to review — save where they belong or dismiss.
          </p>
        </div>
        {items.length > HUB_INBOX_LIMIT ? (
          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#6b635a]">
            {items.length}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 space-y-2">
        {visible.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-[#e7dfd4] bg-white px-3 py-2.5"
          >
            <p className="text-sm text-[#1f1c19]">
              <span aria-hidden="true">{item.icon} </span>
              {item.whatHappened}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveAsWin(item)}
                className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163c3c]"
              >
                Save to My Wins
              </button>
              <button
                type="button"
                onClick={() => dismiss(item)}
                className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
      {overflow > 0 ? (
        <button
          type="button"
          onClick={onOpenWins}
          className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          Open My Wins for {overflow} more + Evidence / Journey routing →
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenWins}
          className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          Open My Wins for full inbox →
        </button>
      )}
    </div>
  );
}
