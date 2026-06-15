"use client";

import { buildFounderDayDesignerReport } from "@/lib/day-designer/founderDayDesignerReporting";

export function FounderDayDesignerPanel() {
  const report = buildFounderDayDesignerReport();

  const trendLabel =
    report.loadTrend === "rising"
      ? "Rising"
      : report.loadTrend === "easing"
        ? "Easing"
        : "Stable";

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Day Designer Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Optional planning patterns — never forced schedules.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Day plans created (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.plansCreated}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Planning trend
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {trendLabel} (placeholder)
          </p>
        </div>
      </div>

      {report.commonPlanningBlockers.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common planning blockers</li>
          {report.commonPlanningBlockers.map((row) => (
            <li key={row.id}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonReducedLoadTips.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Reduced-load plans</li>
          {report.commonReducedLoadTips.map((row) => (
            <li key={row.tip}>
              {row.tip}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonEnergyStates.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Energy at plan time</li>
          {report.commonEnergyStates.map((row) => (
            <li key={row.energy}>
              {row.energy}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended action: {report.recommendedFounderAction}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
