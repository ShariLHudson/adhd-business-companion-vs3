"use client";

import { buildFounderLoopReport } from "@/lib/loop-intelligence/founderLoopReporting";

export function FounderLoopPanel() {
  const report = buildFounderLoopReport();

  const trendLabel =
    report.loadTrend === "rising"
      ? "Rising"
      : report.loadTrend === "easing"
        ? "Easing"
        : "Stable";

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Loop Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Recurring patterns — awareness, not diagnosis.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Snapshots (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Loop trend
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {trendLabel} (placeholder)
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Top loop type
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {report.commonLoopTypes[0]?.label ?? "—"}
          </p>
        </div>
      </div>

      {report.commonLoopTypes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Most common loops</li>
          {report.commonLoopTypes.map((row) => (
            <li key={row.type}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.emergingLoops.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Emerging loops</li>
          {report.emergingLoops.map((row) => (
            <li key={row.type}>
              {row.label} ({row.trend})
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonPurposes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common purposes</li>
          {report.commonPurposes.map((row) => (
            <li key={row.purpose}>
              {row.purpose} ({row.count}×)
            </li>
          ))}
        </ul>
      ) : null}

      {report.contentOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Content opportunities</li>
          {report.contentOpportunities.map((idea) => (
            <li key={idea}>{idea}</li>
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
