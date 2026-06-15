"use client";

import { evaluatePredictiveSupport } from "@/lib/predictive-support/predictiveEngine";
import { riskLevelLabel, riskTypeLabel } from "@/lib/predictive-support/predictiveInsights";
import { buildFounderPredictiveReport } from "@/lib/predictive-support/founderPredictiveReporting";

export function FounderPredictiveSupportPanel() {
  const report = buildFounderPredictiveReport();
  const live = evaluatePredictiveSupport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Predictive Support Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Early, gentle prevention — never doom predictions.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Current pattern
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {live ? riskTypeLabel(live.riskType) : "None flagged"}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Risk level
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {live ? riskLevelLabel(live.riskLevel) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Elevated+ (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.elevatedOrHighCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Risk trend
          </p>
          <p className="mt-1 text-xl font-semibold capitalize text-[#1f1c19]">
            {report.riskTrend}
          </p>
        </div>
      </div>

      {report.emergingRisks.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Emerging risks</li>
          {report.emergingRisks.map((row) => (
            <li key={row.riskType}>
              {row.label}: {row.count}× ({row.trend})
            </li>
          ))}
        </ul>
      ) : null}

      {report.commonSupportOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">
            Common support opportunities
          </li>
          {report.commonSupportOpportunities.map((row) => (
            <li key={row.support}>
              {row.support} ({row.count}×)
            </li>
          ))}
        </ul>
      ) : null}

      {report.founderOverloadCount > 0 ? (
        <p className="mt-3 text-xs text-[#6b635a]">
          <span className="font-semibold text-[#2d2926]">
            Founder overload indicators:
          </span>{" "}
          {report.founderOverloadCount} signal(s) this week
        </p>
      ) : null}

      {live ? (
        <p className="mt-3 text-xs text-[#6b635a]">
          <span className="font-semibold text-[#2d2926]">Recommended support:</span>{" "}
          {live.recommendedSupport}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-medium text-[#1e4f4f]">
        Recommended founder action: {report.recommendedFounderAction}
      </p>
      <p className="mt-1 text-xs text-[#9a8f82]">{report.notes}</p>
    </section>
  );
}
