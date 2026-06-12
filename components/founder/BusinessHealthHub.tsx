"use client";

import type { ReactNode } from "react";

import type {
  BusinessHealthReport,
  HealthDimensionScore,
  HealthLevel,
} from "@/lib/founderWorkspace/businessHealth";
import { HEALTH_LABELS } from "@/lib/founderWorkspace/businessHealth";

function levelClass(level: HealthLevel): string {
  if (level === "healthy") return "border-[#1e4f4f]/30 bg-[#1e4f4f]/8";
  if (level === "at_risk") return "border-[#a85c4a]/35 bg-[#a85c4a]/10";
  return "border-[#e8c547]/40 bg-[#e8c547]/15";
}

function levelTextClass(level: HealthLevel): string {
  if (level === "healthy") return "text-[#1e4f4f]";
  if (level === "at_risk") return "text-[#a85c4a]";
  return "text-[#7a5c00]";
}

function HealthCard({
  title,
  score,
}: {
  title: string;
  score: HealthDimensionScore;
}) {
  return (
    <section
      className={`rounded-xl border p-4 shadow-sm ${levelClass(score.level)}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
        {title}
      </p>
      <p className={`mt-1 text-lg font-semibold ${levelTextClass(score.level)}`}>
        {score.headline}
      </p>
      <p className="mt-2 text-sm text-[#2d2926]">{score.detail}</p>
    </section>
  );
}

function ReportBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1f1c19]">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function BusinessHealthHub({ report }: { report: BusinessHealthReport }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-[#1e4f4f]/25 bg-gradient-to-br from-[#1e4f4f]/8 to-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
          Business health
        </p>
        <p className={`mt-1 text-xl font-semibold ${levelTextClass(report.overall)}`}>
          {HEALTH_LABELS[report.overall]}
        </p>
        <p className="mt-1 text-sm text-[#2d2926]">{report.overallHeadline}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HealthCard title="User health" score={report.user} />
        <HealthCard title="Product health" score={report.product} />
        <HealthCard title="Engagement health" score={report.engagement} />
        <HealthCard title="Revenue health" score={report.revenue} />
        <HealthCard title="System health" score={report.system} />
      </div>

      {report.warnings.length > 0 ? (
        <ReportBlock title="Early warnings">
          <ul className="space-y-2 text-sm">
            {report.warnings.map((w) => (
              <li key={w.id} className="text-[#2d2926]">
                <span
                  className={
                    w.severity === "high"
                      ? "font-semibold text-[#a85c4a]"
                      : "font-medium text-[#7a5c00]"
                  }
                >
                  {w.message}
                </span>
                <span className="text-[#6b635a]"> — {w.monitor}</span>
              </li>
            ))}
          </ul>
        </ReportBlock>
      ) : null}

      <ReportBlock title="Weekly founder health report">
        <p className="text-sm text-[#6b635a]">{report.weeklyReport.summary}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-[#1e4f4f]">Wins</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-[#2d2926]">
              {report.weeklyReport.wins.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#a85c4a]">Risks</p>
            <ul className="mt-1 list-disc pl-4 text-sm text-[#2d2926]">
              {report.weeklyReport.risks.length ? (
                report.weeklyReport.risks.map((r) => <li key={r}>{r}</li>)
              ) : (
                <li className="list-none pl-0 text-[#6b635a]">No major risks flagged.</li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#6b635a]">
              Opportunities
            </p>
            <ul className="mt-1 list-disc pl-4 text-sm text-[#2d2926]">
              {report.weeklyReport.opportunities.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#2d2926]">
              Recommendations
            </p>
            <ul className="mt-1 list-disc pl-4 text-sm text-[#2d2926]">
              {report.weeklyReport.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </ReportBlock>
    </div>
  );
}
