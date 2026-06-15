"use client";

import { buildFounderDecisionReport } from "@/lib/decision-intelligence/founderDecisionReporting";

export function FounderDecisionPanel() {
  const report = buildFounderDecisionReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Decision Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Where users get stuck deciding — support, not pressure.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Stuck in loops
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.stuckInLoopCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Parked
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.parkedCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Resolved
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.resolvedCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Samples (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
      </div>

      {report.commonBlockers.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common blockers</li>
          {report.commonBlockers.map((row) => (
            <li key={row.blocker}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonTypes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Decision types</li>
          {report.commonTypes.map((row) => (
            <li key={row.type}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended founder action: {report.recommendedFounderAction}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
