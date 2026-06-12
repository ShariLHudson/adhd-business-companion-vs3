"use client";

import type { ReactNode } from "react";

import type { ProductIntelligenceReport } from "@/lib/founderWorkspace/productIntelligence";
import {
  PRODUCT_CATEGORY_LABELS,
  type PrioritizedIssue,
} from "@/lib/founderWorkspace/productIntelligence";

function priorityClass(p: PrioritizedIssue["priority"]): string {
  if (p === "high") return "bg-[#a85c4a]/15 text-[#a85c4a]";
  if (p === "medium") return "bg-[#e8c547]/25 text-[#7a5c00]";
  return "bg-[#ebe4d9] text-[#6b635a]";
}

function HubCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1f1c19]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ProductIntelligenceHub({
  report,
}: {
  report: ProductIntelligenceReport;
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-[#1e4f4f]/20 bg-gradient-to-br from-[#1e4f4f]/6 to-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
          Weekly product review
        </p>
        <p className="mt-1 text-sm text-[#2d2926]">{report.weeklyReview.summary}</p>
        <ul className="mt-2 list-disc pl-4 text-sm text-[#6b635a]">
          {report.weeklyReview.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <HubCard title="Top frustrations">
          {report.topFrustrations.length === 0 ? (
            <p className="text-sm text-[#6b635a]">
              No friction signals yet. They appear from pain points and coaching
              chat during app use.
            </p>
          ) : (
            <ol className="space-y-2 text-sm">
              {report.topFrustrations.map((issue, i) => (
                <li key={issue.key} className="flex gap-2">
                  <span className="shrink-0 font-medium text-[#6b635a]">
                    {i + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1f1c19]">{issue.text}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityClass(issue.priority)}`}
                      >
                        {issue.priority}
                      </span>
                      <span className="rounded-full bg-[#ebe4d9] px-2 py-0.5 text-[10px] font-medium text-[#6b635a]">
                        ×{issue.count}
                      </span>
                      <span className="text-[10px] text-[#6b635a]">
                        {PRODUCT_CATEGORY_LABELS[issue.category]}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </HubCard>

        <HubCard title="Most requested features">
          {report.mostRequestedFeatures.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No feature requests detected yet.</p>
          ) : (
            <ol className="space-y-2 text-sm text-[#2d2926]">
              {report.mostRequestedFeatures.map((req, i) => (
                <li key={req.key}>
                  <span className="font-medium text-[#6b635a]">{i + 1}. </span>
                  {req.text}
                  <span className="ml-1 text-[#6b635a]">(×{req.count})</span>
                </li>
              ))}
            </ol>
          )}
        </HubCard>

        <HubCard title="Most loved features">
          {report.mostLovedFeatures.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No success signals yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {report.mostLovedFeatures.map((f) => (
                <li key={`${f.feature}-${f.evidence}`}>
                  <span className="font-medium text-[#1f1c19]">{f.feature}</span>
                  <span className="text-[#6b635a]"> — {f.evidence}</span>
                </li>
              ))}
            </ul>
          )}
        </HubCard>

        <HubCard title="Quick wins">
          {report.quickWins.length === 0 ? (
            <p className="text-sm text-[#6b635a]">
              Quick wins appear when friction mentions wording, labels, or helper
              text.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-[#2d2926]">
              {report.quickWins.map((win) => (
                <li key={win.id}>
                  <p className="font-medium text-[#1f1c19]">{win.title}</p>
                  <p className="text-[#6b635a]">{win.rationale}</p>
                </li>
              ))}
            </ul>
          )}
        </HubCard>
      </div>

      {report.opportunities.length > 0 ? (
        <HubCard title="Opportunities">
          <ul className="space-y-3 text-sm">
            {report.opportunities.map((opp) => (
              <li key={opp.id}>
                <p className="font-semibold text-[#1f1c19]">{opp.title}</p>
                <p className="text-[#6b635a]">{opp.hypothesis}</p>
              </li>
            ))}
          </ul>
        </HubCard>
      ) : null}
    </div>
  );
}
