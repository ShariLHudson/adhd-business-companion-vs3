"use client";

import { buildFounderEnvironmentReport } from "@/lib/environment-intelligence/founderEnvironmentReporting";

export function FounderEnvironmentPanel() {
  const report = buildFounderEnvironmentReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Environment Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Reduce friction — tiny adjustments, never shame about clutter.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
            Sensory overload
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sensoryOverloadCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Focus fit trend
          </p>
          <p className="mt-1 text-xl font-semibold capitalize text-[#1f1c19]">
            {report.focusFitTrend}
          </p>
        </div>
      </div>

      {report.frictionPoints.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Friction points</li>
          {report.frictionPoints.map((row) => (
            <li key={row.id}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      {report.helpfulAdjustments.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Helpful adjustments</li>
          {report.helpfulAdjustments.map((row) => (
            <li key={row.adjustment}>
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
