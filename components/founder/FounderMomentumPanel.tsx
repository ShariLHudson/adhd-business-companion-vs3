"use client";

import { buildFounderMomentumReport } from "@/lib/momentum-intelligence/founderMomentumReporting";

export function FounderMomentumPanel() {
  const report = buildFounderMomentumReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Momentum Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Notice progress — no hype, streaks, or hustle framing.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Samples (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Stalled
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.stalledCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Rising trend
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.risingCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Strong
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.strongCount}
          </p>
        </div>
      </div>

      {report.distribution.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Momentum distribution</li>
          {report.distribution.map((row) => (
            <li key={row.level}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonBuilders.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common builders</li>
          {report.commonBuilders.map((row) => (
            <li key={row.builder}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

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

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended founder action: {report.recommendedFounderAction}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
