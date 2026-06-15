"use client";

import { buildFounderRecognitionReport } from "@/lib/recognition/founderReporting";

/** Founder preview of recognition intelligence — aggregate, non-manipulative metrics. */
export function FounderRecognitionPanel() {
  const report = buildFounderRecognitionReport();

  const sentTotal = Object.values(report.eventsSentLast30Days).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Recognition Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Warm celebrations only — no guilt, streaks, or re-engagement pressure.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Upcoming birthdays
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.upcomingBirthdays}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Saved anniversaries
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.upcomingAnniversaries}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Events sent (30d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">{sentTotal}</p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Top milestone
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {report.topMilestones[0]?.milestoneKey ?? "—"}
          </p>
        </div>
      </div>

      {report.mostCommonMilestoneTypes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Most common types</li>
          {report.mostCommonMilestoneTypes.slice(0, 4).map((row) => (
            <li key={row.type}>
              {row.type}: {row.count}
            </li>
          ))}
        </ul>
      ) : null}

      {report.topMilestones.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          {report.topMilestones.slice(0, 5).map((row) => (
            <li key={row.milestoneKey}>
              {row.milestoneKey}: {row.count} celebrated
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
