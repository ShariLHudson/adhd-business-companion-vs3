"use client";

import type {
  AnalyticsDrillDown,
  AnalyticsFilters,
  FounderAnalyticsReport,
} from "@/lib/founderWorkspace/analytics";
import { exportAnalyticsCsv, exportAnalyticsPdf } from "@/lib/founderWorkspace/analytics";

import {
  AnalyticsBarChart,
  AnalyticsLineChart,
  AnalyticsPieChart,
} from "./AnalyticsCharts";

const WORKSPACES = [
  "create",
  "projects",
  "time-block",
  "templates",
  "focus-audio",
  "snippets",
  "strategies",
];

type FounderAnalyticsDashboardProps = {
  report: FounderAnalyticsReport;
  filters: AnalyticsFilters;
  projects: { id: string; title: string }[];
  drillDown: AnalyticsDrillDown;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onDrillDown: (d: AnalyticsDrillDown) => void;
};

function KpiCard({
  label,
  value,
  sublabel,
  onClick,
  active,
}: {
  label: string;
  value: string;
  sublabel?: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left shadow-sm transition-colors ${
        active
          ? "border-[#1e4f4f] bg-[#1e4f4f]/8"
          : "border-[#d4cdc3] bg-white hover:bg-[#faf8f5]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase text-[#6b635a]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1f1c19]">{value}</p>
      {sublabel ? (
        <p className="mt-0.5 text-xs text-[#6b635a]">{sublabel}</p>
      ) : null}
    </button>
  );
}

function DrillDownPanel({
  drillDown,
  report,
  onClose,
}: {
  drillDown: AnalyticsDrillDown;
  report: FounderAnalyticsReport;
  onClose: () => void;
}) {
  if (!drillDown) return null;

  let title = "";
  let items: { id: string; title: string; detail?: string; ts?: string }[] = [];

  if (drillDown === "projects") {
    title = "Projects";
    items = report.drillDownLists.projects;
  } else if (drillDown === "experiments") {
    title = "Experiments";
    items = report.drillDownLists.experiments;
  } else if (drillDown === "retests") {
    title = "Retests";
    items = report.drillDownLists.retests;
  } else if (drillDown === "google") {
    title = "Google exports";
    items = report.drillDownLists.google;
  } else if (drillDown === "api_usage") {
    title = "API usage";
    return (
      <section className="rounded-xl border border-[#1e4f4f]/30 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1f1c19]">{title}</h3>
          <button type="button" onClick={onClose} className="text-xs text-[#6b635a]">
            Close
          </button>
        </div>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
          {report.drillDownLists.apiUsage.length === 0 ? (
            <li className="text-[#6b635a]">No API calls logged yet.</li>
          ) : (
            report.drillDownLists.apiUsage.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 border-b border-[#ebe4d9] pb-2">
                <span>{r.endpoint}</span>
                <span className="text-[#6b635a]">
                  {r.totalTokens} tokens · {new Date(r.ts).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    );
  } else if (drillDown === "workspace") {
    title = "Workspace usage";
    items = report.workspaceUsage.map((w, i) => ({
      id: `ws-${i}`,
      title: w.label,
      detail: `${w.value} opens`,
    }));
  } else if (drillDown === "templates") {
    title = "Templates & snippets";
    items = [
      {
        id: "t1",
        title: "Templates saved",
        detail: String(report.summary.templateCount),
      },
      {
        id: "s1",
        title: "Snippets saved",
        detail: String(report.summary.snippetCount),
      },
    ];
  }

  return (
    <section className="rounded-xl border border-[#1e4f4f]/30 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#1f1c19]">{title}</h3>
        <button type="button" onClick={onClose} className="text-xs text-[#6b635a]">
          Close
        </button>
      </div>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
        {items.length === 0 ? (
          <li className="text-[#6b635a]">No items in this view.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="border-b border-[#ebe4d9] pb-2">
              <span className="font-medium">{item.title}</span>
              {item.detail ? (
                <span className="text-[#6b635a]"> — {item.detail}</span>
              ) : null}
              {item.ts ? (
                <span className="block text-[11px] text-[#6b635a]">
                  {new Date(item.ts).toLocaleString()}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function FounderAnalyticsDashboard({
  report,
  filters,
  projects,
  drillDown,
  onFiltersChange,
  onDrillDown,
}: FounderAnalyticsDashboardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-[#6b635a]">
            Timeframe
            <select
              value={filters.timeframe}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  timeframe: e.target.value as AnalyticsFilters["timeframe"],
                })
              }
              className="ml-2 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>
          <label className="text-xs text-[#6b635a]">
            Project
            <select
              value={filters.projectId ?? ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  projectId: e.target.value || null,
                })
              }
              className="ml-2 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[#6b635a]">
            Workspace
            <select
              value={filters.workspace ?? ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  workspace: e.target.value || null,
                })
              }
              className="ml-2 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {WORKSPACES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportAnalyticsCsv(report)}
            className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportAnalyticsPdf(report)}
            className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium"
          >
            Export PDF
          </button>
        </div>
      </div>

      {report.alerts.length > 0 ? (
        <section className="rounded-xl border border-[#a85c4a]/30 bg-[#a85c4a]/8 p-4">
          <h3 className="text-sm font-semibold text-[#a85c4a]">Alerts</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {report.alerts.map((a) => (
              <li key={a.id}>{a.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {report.kpis.map((kpi) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            sublabel={kpi.sublabel}
            active={drillDown === kpi.drillDown}
            onClick={() => onDrillDown(kpi.drillDown)}
          />
        ))}
      </div>

      {drillDown ? (
        <DrillDownPanel
          drillDown={drillDown}
          report={report}
          onClose={() => onDrillDown(null)}
        />
      ) : null}

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#1f1c19]">Project progress</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[#6b635a]">
              <tr>
                <th className="pb-2 pr-4">Project</th>
                <th className="pb-2 pr-4">Complete</th>
                <th className="pb-2 pr-4">Velocity</th>
                <th className="pb-2">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {report.projectProgress.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-[#6b635a]">
                    No active projects.
                  </td>
                </tr>
              ) : (
                report.projectProgress.map((p) => (
                  <tr
                    key={p.projectId}
                    className="border-t border-[#ebe4d9] cursor-pointer hover:bg-[#faf8f5]"
                    onClick={() => onDrillDown("projects")}
                  >
                    <td className="py-2 pr-4 font-medium">
                      {p.title}
                      {p.behindSchedule ? (
                        <span className="ml-2 text-xs text-[#a85c4a]">Behind</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4">{p.percentComplete}%</td>
                    <td className="py-2 pr-4">{p.velocityPerWeek}/wk</td>
                    <td className="py-2">{p.upcomingDeadline ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsLineChart
          data={report.projectsOverTime}
          title="Projects over time"
        />
        <AnalyticsLineChart
          data={report.apiUsageOverTime}
          title="API tokens over time"
          color="#e0795a"
        />
        <AnalyticsBarChart
          data={report.experimentOutcomes}
          title="Experiment outcomes"
        />
        <AnalyticsLineChart
          data={report.experimentSuccessRate}
          title="Experiment success rate %"
        />
        <AnalyticsBarChart
          data={report.templateUsage}
          title="Template & snippet usage"
        />
        <AnalyticsPieChart
          data={report.workspaceUsage}
          title="Workspace / tool usage"
        />
      </div>

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#1f1c19]">Experiment details</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[#6b635a]">
              <tr>
                <th className="pb-2 pr-4">Experiment</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Start</th>
                <th className="pb-2 pr-4">End</th>
                <th className="pb-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {report.experimentInsights.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-[#6b635a]">
                    No experiments in this period.
                  </td>
                </tr>
              ) : (
                report.experimentInsights.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-[#ebe4d9] cursor-pointer hover:bg-[#faf8f5]"
                    onClick={() => onDrillDown("experiments")}
                  >
                    <td className="py-2 pr-4 font-medium">
                      {e.title}
                      {e.success === false ? (
                        <span className="ml-2 text-xs text-[#a85c4a]">Failed</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4">{e.status}</td>
                    <td className="py-2 pr-4">{e.startDate.slice(0, 10)}</td>
                    <td className="py-2 pr-4">{e.endDate?.slice(0, 10) ?? "—"}</td>
                    <td className="py-2 max-w-xs truncate">{e.result || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1f1c19]">Recent activity</h3>
          <button
            type="button"
            onClick={() => onDrillDown("activity")}
            className="text-xs text-[#1e4f4f] hover:underline"
          >
            View all
          </button>
        </div>
        <ul className="mt-3 divide-y divide-[#ebe4d9]">
          {report.recentActivity.length === 0 ? (
            <li className="py-4 text-sm text-[#6b635a]">No recent activity.</li>
          ) : (
            report.recentActivity.slice(0, 10).map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-[#1f1c19]">{a.title}</span>
                  <span className="ml-2 text-[11px] uppercase text-[#6b635a]">
                    {a.kind}
                  </span>
                  {a.detail ? (
                    <span className="ml-1 text-[#6b635a]">· {a.detail}</span>
                  ) : null}
                </div>
                <time className="text-[11px] text-[#6b635a]">
                  {new Date(a.ts).toLocaleString()}
                </time>
              </li>
            ))
          )}
        </ul>
      </section>

      {drillDown === "activity" ? (
        <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">All recent activity</h3>
            <button
              type="button"
              onClick={() => onDrillDown(null)}
              className="text-xs text-[#6b635a]"
            >
              Close
            </button>
          </div>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {report.recentActivity.map((a) => (
              <li key={`${a.id}-full`} className="border-b border-[#ebe4d9] pb-2">
                {a.title} ({a.kind}) — {new Date(a.ts).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
