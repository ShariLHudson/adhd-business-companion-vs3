"use client";

import { buildFounderFutureReport } from "@/lib/future-shari/founderFutureReporting";

export function FounderFutureShariPanel() {
  const report = buildFounderFutureReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Future Shari Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Connect today with tomorrow — gentle foresight, never guilt.
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
            Accepted
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.acceptedCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Ignored
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.ignoredCount}
          </p>
        </div>
      </div>

      {report.commonOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common opportunities</li>
          {report.commonOpportunities.map((row) => (
            <li key={row.type}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonFrictionPoints.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Friction points</li>
          {report.commonFrictionPoints.map((point) => (
            <li key={point}>{point}</li>
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
