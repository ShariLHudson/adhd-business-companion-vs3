"use client";

import { evaluateBusinessOS } from "@/lib/business-os/businessEngine";
import {
  businessAreaLabel,
  businessHealthLabel,
  founderLoadLabel,
} from "@/lib/business-os/businessAreas";
import { buildFounderBusinessOSReport } from "@/lib/business-os/founderBusinessReporting";

export function FounderBusinessOSPanel() {
  const report = buildFounderBusinessOSReport();
  const live = evaluateBusinessOS();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Business OS Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Run the business with less in your head — no hustle, no shame.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Business health
          </p>
          <p className="mt-1 text-xl font-semibold capitalize text-[#1f1c19]">
            {businessHealthLabel(live.businessHealth)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Founder load
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {founderLoadLabel(live.founderLoad)}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Highest-risk area
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {live.highestRiskArea
              ? businessAreaLabel(live.highestRiskArea)
              : "None flagged"}
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

      {live.activeOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Top opportunities</li>
          {live.activeOpportunities.slice(0, 3).map((o) => (
            <li key={o.id}>
              {o.label} — {businessAreaLabel(o.area)}
            </li>
          ))}
        </ul>
      ) : null}

      {live.recommendedActions.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Recommended actions</li>
          {live.recommendedActions.map((a) => (
            <li key={a.id}>{a.label}</li>
          ))}
        </ul>
      ) : null}

      {live.businessAreas.filter((a) => a.signalCount > 0).length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Area summaries</li>
          {live.businessAreas
            .filter((a) => a.signalCount > 0)
            .slice(0, 4)
            .map((a) => (
              <li key={a.area}>
                <span className="font-medium text-[#2d2926]">{a.label}:</span>{" "}
                {a.summary}
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
