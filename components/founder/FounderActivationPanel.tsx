"use client";

import { buildFounderActivationReport } from "@/lib/activation/founderActivationReporting";

export function FounderActivationPanel() {
  const report = buildFounderActivationReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Activation Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Where users get stuck — not laziness, just blockers.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Stuck / frozen (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.stuckOrFrozenCount}
          </p>
        </div>
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
            Trend
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-[#1f1c19]">
            {report.loadTrend} (placeholder)
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Top blocker
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {report.commonBlockers[0]?.label ?? "—"}
          </p>
        </div>
      </div>

      {report.commonBlockers.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common blockers</li>
          {report.commonBlockers.map((row) => (
            <li key={row.type}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonRecommendations.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common support steps</li>
          {report.commonRecommendations.map((row) => (
            <li key={row.id}>
              {row.label}: {row.count}×
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
