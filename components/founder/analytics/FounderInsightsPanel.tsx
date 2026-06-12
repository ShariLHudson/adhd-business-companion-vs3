"use client";

import type { FounderAnalyticsReport } from "@/lib/founderWorkspace/analytics";

import { AnalyticsBarChart, AnalyticsLineChart } from "./AnalyticsCharts";

export function FounderInsightsPanel({
  report,
  onSelectProject,
  onSelectExperiment,
}: {
  report: FounderAnalyticsReport;
  onSelectProject?: (id: string) => void;
  onSelectExperiment?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {report.alerts.length > 0 ? (
        <section className="rounded-xl border border-[#a85c4a]/30 bg-[#a85c4a]/8 p-4">
          <h2 className="text-sm font-semibold text-[#a85c4a]">Alerts</h2>
          <ul className="mt-2 space-y-1 text-sm text-[#2d2926]">
            {report.alerts.map((a) => (
              <li key={a.id}>
                <span
                  className={
                    a.severity === "high"
                      ? "font-semibold text-[#a85c4a]"
                      : "font-medium"
                  }
                >
                  {a.message}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {report.kpis.slice(0, 4).map((k) => (
          <div
            key={k.id}
            className="rounded-xl border border-[#d4cdc3] bg-white p-3 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase text-[#6b635a]">
              {k.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-[#1f1c19]">{k.value}</p>
            {k.sublabel ? (
              <p className="text-xs text-[#6b635a]">{k.sublabel}</p>
            ) : null}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1f1c19]">Project progress</h2>
        {report.projectProgress.length === 0 ? (
          <p className="mt-2 text-sm text-[#6b635a]">No active projects.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#ebe4d9]">
            {report.projectProgress.slice(0, 6).map((p) => (
              <li key={p.projectId} className="flex flex-wrap items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => onSelectProject?.(p.projectId)}
                  className="font-medium text-[#1e4f4f] hover:underline"
                >
                  {p.title}
                </button>
                <span className="text-sm text-[#6b635a]">{p.percentComplete}%</span>
                <span className="text-xs text-[#6b635a]">
                  {p.velocityPerWeek} tasks/wk
                </span>
                {p.behindSchedule ? (
                  <span className="rounded-full bg-[#a85c4a]/15 px-2 py-0.5 text-[10px] font-semibold text-[#a85c4a]">
                    Behind
                  </span>
                ) : null}
                {p.upcomingDeadline ? (
                  <span className="text-xs text-[#6b635a]">
                    Due {p.upcomingDeadline}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          data={report.experimentOutcomes}
          title="Experiment status"
        />
        <AnalyticsLineChart
          data={report.experimentSuccessRate}
          title="Experiment success rate %"
          color="#1e4f4f"
        />
      </div>

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1f1c19]">Experiments</h2>
        <ul className="mt-2 divide-y divide-[#ebe4d9] text-sm">
          {report.experimentInsights.length === 0 ? (
            <li className="py-2 text-[#6b635a]">No experiments in this period.</li>
          ) : (
            report.experimentInsights.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-wrap gap-2 py-2">
                <button
                  type="button"
                  onClick={() => onSelectExperiment?.(e.id)}
                  className="font-medium text-[#1e4f4f] hover:underline"
                >
                  {e.title}
                </button>
                <span className="text-[#6b635a]">{e.status}</span>
                {e.success === false ? (
                  <span className="text-xs text-[#a85c4a]">Failed</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

    </div>
  );
}
