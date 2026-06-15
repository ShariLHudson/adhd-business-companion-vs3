"use client";

import { buildFounderUserHealthReport } from "@/lib/user-health/founderUserHealthReporting";

export function FounderUserHealthPanel() {
  const report = buildFounderUserHealthReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        User Health
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Well-being before engagement — patterns only, not surveillance.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Needs support
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.needsSupportCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Overloaded
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.overloadedCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Disengaging
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.disengagingCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Recovering
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.recoveringCount}
          </p>
        </div>
      </div>

      {report.distribution.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">
            Health distribution (7d, n={report.sampleSize})
          </li>
          {report.distribution.map((row) => (
            <li key={row.status}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonSupportNeeds.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common support needs</li>
          {report.commonSupportNeeds.map((row) => (
            <li key={row.need}>
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
