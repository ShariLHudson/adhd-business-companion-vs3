"use client";

import { buildFounderCognitiveLoadReport } from "@/lib/cognitive-load/founderCognitiveLoadReporting";

/** Founder preview — aggregate load awareness, not productivity scoring. */
export function FounderCognitiveLoadPanel() {
  const report = buildFounderCognitiveLoadReport();

  const trendLabel =
    report.loadTrend === "rising"
      ? "Rising"
      : report.loadTrend === "easing"
        ? "Easing"
        : "Stable";

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Cognitive Load Snapshot
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        How much users are carrying — not how productive they are.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Average user load (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize > 0 ? report.averageLoad : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Overloaded users
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.overloadedUsers}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Load trend
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">{trendLabel}</p>
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

      {report.commonContributors.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Most common contributors</li>
          {report.commonContributors.map((row) => (
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
