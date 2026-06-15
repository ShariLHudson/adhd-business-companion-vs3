"use client";

import { buildFounderRecoveryReport } from "@/lib/recovery-intelligence/founderRecoveryReporting";

export function FounderRecoveryPanel() {
  const report = buildFounderRecoveryReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Recovery Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Recovery is productive — protect energy before burnout.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Burnout risk (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.burnoutRiskCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Declining energy
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.decliningEnergyCount}
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

      {report.distribution.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Recovery distribution</li>
          {report.distribution.map((row) => (
            <li key={row.level}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonRecoveryNeeds.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Common recovery needs</li>
          {report.commonRecoveryNeeds.map((row) => (
            <li key={row.need}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.recoveryImprovements.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Recovery improvements</li>
          {report.recoveryImprovements.map((line) => (
            <li key={line}>{line}</li>
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
