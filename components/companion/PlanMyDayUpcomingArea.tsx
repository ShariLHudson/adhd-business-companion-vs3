"use client";

import { useEffect, useState } from "react";
import {
  bringParkingLotItemToToday,
  formatPlanDueDate,
  type PlanDayItem,
} from "@/lib/planMyDay";
import { gatherUpcomingPlanning, type UpcomingBucket } from "@/lib/planMyDay/upcomingPlanning";
import { PLANNING_CENTER_AREA_META } from "@/lib/planMyDay/planningCenter";
import { RHYTHM_CADENCE_OPTIONS } from "@/lib/rhythms";

type Props = {
  onBroughtToToday?: (items: PlanDayItem[]) => void;
  onGoToToday?: () => void;
};

/**
 * Forward-looking planning — not another Today board.
 */
export function PlanMyDayUpcomingArea({
  onBroughtToToday,
  onGoToToday,
}: Props) {
  const [buckets, setBuckets] = useState<UpcomingBucket[]>([]);

  function refresh() {
    setBuckets(gatherUpcomingPlanning());
  }

  useEffect(() => {
    refresh();
  }, []);

  function cadenceLabel(id: string): string {
    return (
      RHYTHM_CADENCE_OPTIONS.find((o) => o.id === id)?.label ?? id
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-5" data-testid="plan-area-upcoming-panel">
      <div>
        <h2 className="text-xl font-semibold text-[#1f1c19]">
          {PLANNING_CENTER_AREA_META.upcoming.label}
        </h2>
        <p className="mt-1 text-base text-[#6b635a]">
          {PLANNING_CENTER_AREA_META.upcoming.purpose}
        </p>
      </div>

      {buckets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-6 text-base text-[#6b635a]">
          Nothing waiting ahead yet. Items you send to a later day, upcoming
          appointments, and rhythm reminders will gather here.
        </p>
      ) : (
        buckets.map((bucket) => (
          <section key={bucket.id} className="flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
              {bucket.label}
            </h3>

            {bucket.planItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
              >
                <div>
                  <p className="text-base font-semibold text-[#1f1c19]">
                    {item.title}
                  </p>
                  {item.dueDate ? (
                    <p className="text-sm text-[#6b635a]">
                      {formatPlanDueDate(item.dueDate)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#1e4f4f]"
                  onClick={() => {
                    const next = bringParkingLotItemToToday(item.id);
                    onBroughtToToday?.(next);
                    refresh();
                    onGoToToday?.();
                  }}
                >
                  Bring to Today
                </button>
              </div>
            ))}

            {bucket.events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
              >
                <p className="text-base font-semibold text-[#1f1c19]">
                  {ev.title}
                </p>
                <p className="text-sm text-[#6b635a]">
                  {[ev.date, ev.startTime].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}

            {bucket.rhythms.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3"
              >
                <p className="text-base font-semibold text-[#1f1c19]">
                  {r.title}
                </p>
                <p className="text-sm text-[#6b635a]">
                  {cadenceLabel(r.cadence)} rhythm
                </p>
              </div>
            ))}

            {bucket.planItems.length === 0 &&
            bucket.events.length === 0 &&
            bucket.rhythms.length === 0 ? (
              <p className="text-sm text-[#6b635a]">Nothing in this window yet.</p>
            ) : null}
          </section>
        ))
      )}
    </div>
  );
}
