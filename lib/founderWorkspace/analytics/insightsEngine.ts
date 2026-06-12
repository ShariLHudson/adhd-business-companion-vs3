import type { FounderEvent } from "@/lib/ecosystem/events";

import type { FounderWorkspaceData } from "../types";
import type { ProjectIntelligence } from "../intelligence/types";
import type { FounderTrackingData } from "../tracking/types";

import type {
  AnalyticsAlert,
  AnalyticsFilters,
  ExperimentInsightRow,
  ProjectProgressRow,
  TimeSeriesPoint,
} from "./types";

const MS_DAY = 86_400_000;

function withinDays(ts: string, days: number, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= days * MS_DAY;
}

const DEADLINE_RE = /deadline\s*:\s*(.+)/i;
const DUE_RE = /due\s*:\s*(\d{4}-\d{2}-\d{2})/i;

function parseDeadline(description: string): string | null {
  const due = description.match(DUE_RE)?.[1];
  if (due) return due;
  const line = description.match(DEADLINE_RE)?.[1]?.trim();
  if (!line) return null;
  const parsed = Date.parse(line);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString().slice(0, 10);
}

function taskStatsForProject(
  events: FounderEvent[],
  projectId: string,
  now: Date,
): { total: number; done: number; weeklyDone: number } {
  const created = new Set<string>();
  const done = new Set<string>();
  let weeklyDone = 0;

  for (const e of events) {
    if (e.refs?.projectId !== projectId || !e.refs?.taskId) continue;
    if (e.type === "task.created") created.add(e.refs.taskId);
    if (e.type === "task.completed") {
      done.add(e.refs.taskId);
      if (withinDays(e.ts, 7, now)) weeklyDone += 1;
    }
  }

  return { total: created.size, done: done.size, weeklyDone };
}

export function buildProjectProgress(
  events: FounderEvent[],
  workspace: FounderWorkspaceData | null,
  analyses: ProjectIntelligence[],
  now: Date = new Date(),
): ProjectProgressRow[] {
  const projects = workspace?.projects ?? [];
  const analysisById = new Map(analyses.map((a) => [a.project.id, a]));

  return projects
    .filter((p) => p.status !== "done")
    .map((project) => {
      const stats = taskStatsForProject(events, project.id, now);
      const intel = analysisById.get(project.id);
      const fromTasks =
        stats.total > 0
          ? Math.round((stats.done / stats.total) * 100)
          : null;
      const percentComplete =
        fromTasks ?? intel?.completionScore ?? (project.status === "active" ? 25 : 10);

      const deadline = parseDeadline(project.description);
      const behindSchedule =
        (deadline !== null && deadline < now.toISOString().slice(0, 10)) ||
        intel?.health === "at_risk" ||
        intel?.health === "stalled";

      return {
        projectId: project.id,
        title: project.title,
        percentComplete,
        velocityPerWeek: stats.weeklyDone,
        upcomingDeadline: deadline,
        behindSchedule,
        status: project.status,
      };
    })
    .sort((a, b) => {
      if (a.behindSchedule !== b.behindSchedule) return a.behindSchedule ? -1 : 1;
      return b.percentComplete - a.percentComplete;
    });
}

export function buildExperimentInsights(
  tracking: FounderTrackingData,
  filters: AnalyticsFilters,
  now: Date = new Date(),
): ExperimentInsightRow[] {
  const ms =
    filters.timeframe === "day"
      ? MS_DAY
      : filters.timeframe === "week"
        ? 7 * MS_DAY
        : 30 * MS_DAY;

  return tracking.experiments
    .filter((e) => now.getTime() - new Date(e.updatedAt).getTime() <= ms)
    .map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      startDate: e.createdAt,
      endDate:
        e.status === "successful" || e.status === "failed"
          ? e.updatedAt
          : null,
      result: e.result || e.expectedOutcome || "",
      success:
        e.status === "successful"
          ? true
          : e.status === "failed"
            ? false
            : null,
    }))
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
}

export function buildExperimentSuccessRate(
  tracking: FounderTrackingData,
  filters: AnalyticsFilters,
): TimeSeriesPoint[] {
  const buckets = new Map<string, { success: number; total: number }>();

  for (const e of tracking.experiments) {
    if (e.status !== "successful" && e.status !== "failed") continue;
    const key =
      filters.timeframe === "day"
        ? e.updatedAt.slice(0, 13)
        : e.updatedAt.slice(0, 10);
    const row = buckets.get(key) ?? { success: 0, total: 0 };
    row.total += 1;
    if (e.status === "successful") row.success += 1;
    buckets.set(key, row);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([ts, row]) => ({
      ts,
      label: filters.timeframe === "day" ? ts.slice(11, 16) : ts.slice(5),
      value: row.total ? Math.round((row.success / row.total) * 100) : 0,
    }));
}

export function buildAnalyticsAlerts(input: {
  projectProgress: ProjectProgressRow[];
  experimentInsights: ExperimentInsightRow[];
  apiTokens: number;
  apiCalls: number;
  timeframe: AnalyticsFilters["timeframe"];
}): AnalyticsAlert[] {
  const alerts: AnalyticsAlert[] = [];

  for (const p of input.projectProgress.filter((x) => x.behindSchedule)) {
    alerts.push({
      id: `deadline-${p.projectId}`,
      severity: p.upcomingDeadline ? "high" : "medium",
      message: p.upcomingDeadline
        ? `${p.title} is behind — deadline ${p.upcomingDeadline}`
        : `${p.title} is behind schedule (${p.percentComplete}% complete)`,
      category: "deadline",
      relatedId: p.projectId,
    });
  }

  for (const e of input.experimentInsights.filter((x) => x.success === false)) {
    alerts.push({
      id: `exp-fail-${e.id}`,
      severity: "medium",
      message: `Experiment failed: ${e.title}`,
      category: "experiment",
      relatedId: e.id,
    });
  }

  const tokenThreshold = input.timeframe === "month" ? 80_000 : 20_000;
  const callThreshold = input.timeframe === "month" ? 100 : 30;
  if (input.apiTokens >= tokenThreshold) {
    alerts.push({
      id: "api-tokens-high",
      severity: "high",
      message: `High API token usage (~${input.apiTokens.toLocaleString()} tokens)`,
      category: "api",
    });
  } else if (input.apiCalls >= callThreshold) {
    alerts.push({
      id: "api-calls-high",
      severity: "medium",
      message: `Elevated API usage (${input.apiCalls} calls)`,
      category: "api",
    });
  }

  return alerts.slice(0, 8);
}
