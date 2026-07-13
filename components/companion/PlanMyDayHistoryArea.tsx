"use client";

import { useMemo, useState } from "react";
import { PlanDayPreviousDayReview } from "@/components/companion/PlanDayPreviousDayReview";
import {
  beginPreviousDayReview,
  clearPreviousDayReviewSession,
  formatPlanDueDate,
  getReviewablePreviousDayItems,
  readPastPlanSnapshots,
  type PlanDayItem,
} from "@/lib/planMyDay";

type Props = {
  onTodayItemsChange: (items: PlanDayItem[]) => void;
  onGoToToday?: () => void;
};

/**
 * Planning History — past plans for retrieval, not daily workflow.
 */
export function PlanMyDayHistoryArea({
  onTodayItemsChange,
  onGoToToday,
}: Props) {
  const [revision, setRevision] = useState(0);
  const [reviewDate, setReviewDate] = useState<string | null>(null);

  const snapshots = useMemo(() => {
    void revision;
    return readPastPlanSnapshots();
  }, [revision]);

  const reviewItems = useMemo(() => {
    void revision;
    if (!reviewDate) return [];
    return getReviewablePreviousDayItems(reviewDate);
  }, [reviewDate, revision]);

  if (reviewDate) {
    return (
      <PlanDayPreviousDayReview
        sourceDate={reviewDate}
        items={reviewItems}
        onItemsChange={() => setRevision((n) => n + 1)}
        onTodayItemsChange={onTodayItemsChange}
        onClose={() => {
          clearPreviousDayReviewSession();
          setReviewDate(null);
          setRevision((n) => n + 1);
        }}
      />
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="plan-my-day-history-area"
    >
      <div>
        <p className="text-lg font-semibold text-[#1f1c19]">Planning History</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Past plans stay here quietly — open one when you want to look back.
        </p>
      </div>

      {snapshots.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#e7dfd4] bg-[#faf7f2]/60 px-4 py-5 text-base text-[#6b635a]">
          No previous days stored yet. Today&apos;s plan will appear here when a
          new day begins.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {snapshots.map((snap) => (
            <li key={snap.date}>
              <button
                type="button"
                onClick={() => {
                  beginPreviousDayReview(snap.date);
                  setReviewDate(snap.date);
                }}
                className="flex w-full flex-col rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:border-[#1e4f4f]/35"
                data-testid={`plan-history-day-${snap.date}`}
              >
                <span className="text-base font-semibold text-[#1f1c19]">
                  {formatPlanDueDate(snap.date)}
                </span>
                <span className="mt-0.5 text-sm text-[#6b635a]">
                  {snap.items.length} saved
                  {snap.unfinished.length > 0
                    ? ` · ${snap.unfinished.length} still worth revisiting`
                    : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {onGoToToday ? (
        <button
          type="button"
          onClick={onGoToToday}
          className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          Back to today
        </button>
      ) : null}
    </div>
  );
}
