"use client";

import { useState } from "react";

import {
  AnalyticsBarChart,
  AnalyticsLineChart,
  AnalyticsPieChart,
} from "@/components/founder/analytics/AnalyticsCharts";
import type {
  ExperimentMetricRow,
  ExperimentMetricsFilters,
  ExperimentMetricsReport,
} from "@/lib/founderWorkspace/experimentMetrics";
import {
  exportExperimentMetricsCsv,
  exportExperimentMetricsPdf,
} from "@/lib/founderWorkspace/experimentMetrics";
import { EXPERIMENT_STATUSES } from "@/lib/founderWorkspace/tracking";

import { ExperimentTimeline } from "./ExperimentTimeline";
import { ExperimentWidget } from "./ExperimentWidget";

type ExperimentMetricsDashboardProps = {
  report: ExperimentMetricsReport;
  filters: ExperimentMetricsFilters;
  projects: { id: string; title: string }[];
  onFiltersChange: (filters: ExperimentMetricsFilters) => void;
};

function KpiTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[#d4cdc3] bg-white p-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase text-[#6b635a]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#1f1c19]">{value}</p>
      {sub ? <p className="text-xs text-[#6b635a]">{sub}</p> : null}
    </div>
  );
}

function ExperimentDetailPanel({ row }: { row: ExperimentMetricRow }) {
  return (
    <section className="rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/5 p-4">
      <h3 className="text-sm font-semibold text-[#1f1c19]">{row.title}</h3>
      <p className="mt-1 text-xs text-[#6b635a]">
        {row.source} · {row.status}
        {row.relatedProjectTitle ? ` · ${row.relatedProjectTitle}` : ""}
      </p>
      {row.hypothesis ? (
        <p className="mt-2 text-sm text-[#2d2926]">
          <span className="font-medium">Hypothesis:</span> {row.hypothesis}
        </p>
      ) : null}
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-[#6b635a]">Completion</span>
          <p className="font-semibold">{row.completionRate}%</p>
        </div>
        <div>
          <span className="text-[#6b635a]">Tasks</span>
          <p className="font-semibold">
            {row.tasksCompleted}/{row.taskCount}
          </p>
        </div>
        <div>
          <span className="text-[#6b635a]">Insights flagged</span>
          <p className="font-semibold">{row.insightsFlagged}</p>
        </div>
        <div>
          <span className="text-[#6b635a]">API tokens</span>
          <p className="font-semibold">
            {row.apiTokens.toLocaleString()} (~${row.estimatedCostUsd.toFixed(3)})
          </p>
        </div>
        <div>
          <span className="text-[#6b635a]">Time invested</span>
          <p className="font-semibold">{row.timeInvestedMinutes} min</p>
        </div>
        {row.avgDaysPerMilestone !== null ? (
          <div>
            <span className="text-[#6b635a]">Avg days / milestone</span>
            <p className="font-semibold">{row.avgDaysPerMilestone}</p>
          </div>
        ) : null}
      </div>
      {row.tags.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {row.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#ebe4d9] px-2 py-0.5 text-[10px] font-medium text-[#2d2926]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {row.bottleneck ? (
        <p className="mt-2 text-sm text-[#a85c4a]">Bottleneck: {row.bottleneck}</p>
      ) : null}
      {row.result ? (
        <p className="mt-2 text-sm text-[#2d2926]">
          <span className="font-medium">Result:</span> {row.result}
        </p>
      ) : null}
      {row.googleDocLinks.length ? (
        <ul className="mt-2 text-sm text-[#1e4f4f]">
          {row.googleDocLinks.map((l) => (
            <li key={l.label}>
              {l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {l.label}
                </a>
              ) : (
                l.label
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {row.customKpis.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-[#6b635a]">Custom KPIs</p>
          <ul className="mt-1 text-sm">
            {row.customKpis.map((k) => (
              <li key={k.id}>
                {k.label}: {k.value}
                {k.unit ?? ""}
                {k.thresholdExceeded ? (
                  <span className="ml-1 text-[#a85c4a]">over threshold</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase text-[#6b635a]">Timeline</p>
        <div className="mt-2">
          <ExperimentTimeline events={row.timeline} />
        </div>
      </div>
    </section>
  );
}

export function ExperimentMetricsDashboard({
  report,
  filters,
  projects,
  onFiltersChange,
}: ExperimentMetricsDashboardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    report.experiments.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#6b635a]">
          Live metrics · updated {new Date(report.generatedAt).toLocaleTimeString()}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportExperimentMetricsCsv(report)}
            className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportExperimentMetricsPdf(report)}
            className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-xs font-medium"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-[#6b635a]">
          Timeframe
          <select
            value={filters.timeframe}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                timeframe: e.target.value as ExperimentMetricsFilters["timeframe"],
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
          Status
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as ExperimentMetricsFilters["status"],
              })
            }
            className="ml-2 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            {EXPERIMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6b635a]">
          Tag
          <select
            value={filters.tag ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                tag: e.target.value || null,
              })
            }
            className="ml-2 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {report.allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Experiments"
          value={String(report.aggregate.total)}
          sub={`${report.aggregate.successful} ok · ${report.aggregate.failed} failed`}
        />
        <KpiTile
          label="Success rate"
          value={`${report.aggregate.successRate}%`}
          sub={`Avg completion ${report.aggregate.avgCompletionRate}%`}
        />
        <KpiTile
          label="API tokens"
          value={report.aggregate.totalApiTokens.toLocaleString()}
          sub={`${report.aggregate.totalApiCalls} calls · ~$${report.aggregate.totalEstimatedCostUsd.toFixed(2)}`}
        />
        <KpiTile
          label="Time invested"
          value={`${report.aggregate.totalTimeInvestedMinutes}m`}
          sub={`${report.aggregate.inProgress} in progress`}
        />
      </div>

      {report.alerts.length > 0 ? (
        <section className="rounded-xl border border-[#a85c4a]/30 bg-[#a85c4a]/8 p-4">
          <h3 className="text-sm font-semibold text-[#a85c4a]">Alerts</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {report.alerts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.experimentId)}
                  className="text-left hover:underline"
                >
                  {a.message}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.anomalies.length > 0 ? (
        <section className="rounded-xl border border-[#e8c547]/40 bg-[#e8c547]/10 p-4">
          <h3 className="text-sm font-semibold text-[#7a5c00]">Trend anomalies</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[#2d2926]">
            {report.anomalies.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.experiments.length > 0 ? (
        <section>
          <h3 className="text-sm font-semibold text-[#1f1c19]">Experiment widgets</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.experiments.map((e) => (
              <ExperimentWidget
                key={e.id}
                row={e}
                selected={selectedId === e.id}
                onSelect={() => setSelectedId(e.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPieChart data={report.outcomesPie} title="Experiment outcomes" />
        <AnalyticsBarChart
          data={report.completionByExperiment}
          title="Completion rate by experiment"
        />
        <AnalyticsLineChart
          data={report.tokensOverTime}
          title="API tokens over time"
          color="#e0795a"
        />
        <AnalyticsLineChart
          data={report.successRateTrend}
          title="Success rate trend %"
        />
        <AnalyticsLineChart
          data={report.engagementTrend}
          title="Linked project engagement"
          color="#6b635a"
        />
        {report.typePerformance.length > 0 ? (
          <AnalyticsBarChart
            data={report.typePerformance}
            title="Success rate by experiment type (tag)"
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {report.pendingActions.length > 0 ? (
          <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
            <h3 className="text-sm font-semibold">Pending actions</h3>
            <ul className="mt-2 divide-y divide-[#ebe4d9] text-sm">
              {report.pendingActions.map((a) => (
                <li key={a.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(a.experimentId)}
                    className="font-medium text-[#1e4f4f] hover:underline"
                  >
                    {a.experimentTitle}
                  </button>
                  <p className="text-[#6b635a]">{a.action}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {report.recommendations.length > 0 ? (
          <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
            <h3 className="text-sm font-semibold">Suggested next experiments</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {report.recommendations.map((r) => (
                <li key={r.id} className="rounded-lg bg-[#faf8f5] p-2">
                  <span className="text-[10px] font-semibold uppercase text-[#6b635a]">
                    {r.priority}
                  </span>
                  <p className="font-medium text-[#1f1c19]">{r.title}</p>
                  <p className="text-[#6b635a]">{r.rationale}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {selected ? <ExperimentDetailPanel row={selected} /> : null}

      <section className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <h3 className="text-sm font-semibold">All experiments</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[#6b635a]">
              <tr>
                <th className="pb-2 pr-3">Experiment</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Complete</th>
                <th className="pb-2 pr-3">Tasks</th>
                <th className="pb-2 pr-3">Insights</th>
                <th className="pb-2 pr-3">Tokens</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {report.experiments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#6b635a]">
                    No experiments match these filters.
                  </td>
                </tr>
              ) : (
                report.experiments.map((e) => (
                  <tr
                    key={e.id}
                    className={`cursor-pointer border-t border-[#ebe4d9] hover:bg-[#faf8f5] ${
                      selectedId === e.id ? "bg-[#1e4f4f]/8" : ""
                    }`}
                    onClick={() => setSelectedId(e.id)}
                  >
                    <td className="py-2 pr-3 font-medium">
                      {e.title}
                      {e.success === false ? (
                        <span className="ml-1 text-xs text-[#a85c4a]">Failed</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3">{e.status}</td>
                    <td className="py-2 pr-3">{e.completionRate}%</td>
                    <td className="py-2 pr-3">
                      {e.tasksCompleted}/{e.taskCount}
                    </td>
                    <td className="py-2 pr-3">
                      {e.insightsFlagged > 0 ? (
                        <span className="text-[#a85c4a]">{e.insightsFlagged}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-3">{e.apiTokens}</td>
                    <td className="py-2">{e.timeInvestedMinutes}m</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
