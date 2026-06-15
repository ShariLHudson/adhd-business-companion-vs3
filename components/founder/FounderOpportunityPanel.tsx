"use client";

import { buildFounderOpportunityReport } from "@/lib/opportunity-intelligence/founderOpportunityReporting";

export function FounderOpportunityPanel() {
  const report = buildFounderOpportunityReport();

  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Opportunity Intelligence
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Possible wins — surfaced gently, never pushed.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Tracked
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.sampleSize}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Content
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.contentOpportunities}
          </p>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
            Product
          </p>
          <p className="mt-1 text-xl font-semibold text-[#1f1c19]">
            {report.productOpportunities}
          </p>
        </div>
      </div>

      {report.topOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Top opportunities</li>
          {report.topOpportunities.map((row) => (
            <li key={row.title}>
              {row.title} (score {row.score})
            </li>
          ))}
        </ul>
      ) : null}

      {report.highImpactLowEffort.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">
            High impact / low effort
          </li>
          {report.highImpactLowEffort.map((row) => (
            <li key={row.title}>{row.title}</li>
          ))}
        </ul>
      ) : null}

      {report.newestOpportunities.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Newest</li>
          {report.newestOpportunities.map((row) => (
            <li key={`${row.title}-${row.createdAt}`}>{row.title}</li>
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
