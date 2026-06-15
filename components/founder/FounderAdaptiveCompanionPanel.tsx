"use client";

import { buildFounderAdaptiveReport } from "@/lib/adaptive-companion/founderAdaptiveReporting";

export function FounderAdaptiveCompanionPanel() {
  const report = buildFounderAdaptiveReport();

  const trendLabel =
    report.modeTrend === "rising"
      ? "Rising"
      : report.modeTrend === "easing"
        ? "Easing"
        : "Stable";

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Adaptive Companion
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        How Shari meets users — support before strategy.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Mode samples (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Mode trend
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {trendLabel}
          </p>
        </div>
      </div>

      {report.commonModes.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Most common modes</li>
          {report.commonModes.map((row) => (
            <li key={row.mode}>
              {row.label}: {row.count}×
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
        <li className="font-semibold text-[#2d2926]">State distribution (7d)</li>
        <li>Support / sorting / reflection: {report.stateDistribution.support}</li>
        <li>Activation / planning / focus: {report.stateDistribution.action}</li>
        <li>Celebration: {report.stateDistribution.celebrate}</li>
        <li>Reflection (explicit): {report.stateDistribution.reflect}</li>
      </ul>

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended improvement: {report.recommendedImprovement}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
