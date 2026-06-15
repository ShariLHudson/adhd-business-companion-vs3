"use client";

import { buildFounderRelationshipReport } from "@/lib/relationship-intelligence/founderRelationshipReporting";

export function FounderRelationshipPanel() {
  const report = buildFounderRelationshipReport();

  const trendLabel =
    report.relationshipTrend === "rising"
      ? "Rising"
      : report.relationshipTrend === "easing"
        ? "Easing"
        : "Stable";

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Relationship Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        People matter — not another CRM.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Remembered (7d)
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.relationshipsAdded}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Total saved
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Relationship trend
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {trendLabel} (placeholder)
          </p>
        </div>
      </div>

      {report.followUpOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Follow-up opportunities</li>
          {report.followUpOpportunities.map((row) => (
            <li key={row.name}>
              {row.name}: {row.suggestion}
            </li>
          ))}
        </ul>
      ) : null}

      {report.referralOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Referral opportunities</li>
          {report.referralOpportunities.map((row) => (
            <li key={row.name}>
              {row.name} ({row.type})
            </li>
          ))}
        </ul>
      ) : null}

      {report.partnershipOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Partnership opportunities</li>
          {report.partnershipOpportunities.map((row) => (
            <li key={row.name}>
              {row.name} ({row.type})
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
