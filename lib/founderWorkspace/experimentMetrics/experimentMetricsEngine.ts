import type { FounderEvent } from "@/lib/ecosystem/events";
import type { ApiUsageRecord } from "@/lib/founderWorkspace/analytics/types";
import type { AnalyticsTimeframe } from "@/lib/founderWorkspace/analytics/types";
import type { ProjectIntelligence } from "@/lib/founderWorkspace/intelligence/types";
import type { ProjectIntelligenceStore } from "@/lib/founderWorkspace/intelligence/types";
import type { FounderWorkspaceData } from "@/lib/founderWorkspace/types";
import type {
  FounderTrackedExperiment,
  FounderTrackingData,
} from "@/lib/founderWorkspace/tracking/types";

import {
  avgDaysPerMilestone,
  milestoneProgress,
  parseMilestones,
} from "./milestones";
import {
  captureProjectActivity,
  countInsightsFlagged,
  openIssuesForProject,
} from "./activityCapture";
import { buildExperimentMetricAlerts, detectAnomalies } from "./alerts";
import type { ExperimentCustomKpi } from "./kpiStore";
import { DEFAULT_KPI_SUGGESTIONS } from "./kpiStore";
import {
  buildExperimentRecommendations,
  buildPendingActions,
  detectBottlenecks,
} from "./recommendations";
import { inferTagsFromTracked, inferTagsFromWorkspaceItem } from "./tagInference";
import { buildExperimentTimeline } from "./timeline";
import { estimateApiCostUsd } from "./tokenCost";
import type {
  ExperimentMetricRow,
  ExperimentMetricsFilters,
  ExperimentMetricsReport,
} from "./types";

const MS_DAY = 86_400_000;

function timeframeMs(tf: AnalyticsTimeframe): number {
  if (tf === "day") return MS_DAY;
  if (tf === "week") return 7 * MS_DAY;
  return 30 * MS_DAY;
}

function inTimeframe(ts: string, filters: ExperimentMetricsFilters, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= timeframeMs(filters.timeframe);
}

function successOf(exp: FounderTrackedExperiment): boolean | null {
  if (exp.status === "successful") return true;
  if (exp.status === "failed") return false;
  return null;
}

const DUE_RE = /due\s*:\s*(\d{4}-\d{2}-\d{2})/i;

function isProjectDelayed(
  projectId: string | undefined,
  workspace: FounderWorkspaceData | null,
  analyses: ProjectIntelligence[],
  now: Date,
): boolean {
  if (!projectId) return false;
  const intel = analyses.find((a) => a.project.id === projectId);
  if (intel?.health === "at_risk" || intel?.health === "stalled") return true;
  const project = workspace?.projects.find((p) => p.id === projectId);
  if (!project) return false;
  const due = project.description.match(DUE_RE)?.[1];
  if (due && due < now.toISOString().slice(0, 10)) return true;
  return false;
}

function googleLinksForProject(
  store: ProjectIntelligenceStore,
  projectId?: string,
): { label: string; url?: string }[] {
  if (!projectId) return [];
  return store.links
    .filter((l) => l.projectId === projectId && l.targetKind === "google_doc")
    .map((l) => ({ label: l.label, url: l.url }));
}

function bottleneckFor(exp: FounderTrackedExperiment, milestones: number): string | null {
  if (exp.status === "testing" && milestones > 0) {
    const { rate } = milestoneProgress(exp.status, milestones);
    if (rate < 50) return "Milestone progress stalled in testing";
  }
  if (exp.status === "failed" && /block|scope|unclear/i.test(exp.result)) {
    return "Scope or clarity issue noted in result";
  }
  if (exp.status === "idea" && exp.createdAt) {
    const days =
      (Date.now() - new Date(exp.createdAt).getTime()) / MS_DAY;
    if (days > 10) return "Idea aging without test start";
  }
  return null;
}

function kpiSnapshots(
  experimentId: string,
  customKpis: ExperimentCustomKpi[],
): ExperimentMetricRow["customKpis"] {
  return customKpis
    .filter((k) => k.experimentId === experimentId)
    .map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      unit: k.unit,
      threshold: k.threshold,
      thresholdExceeded:
        k.threshold !== undefined && k.value > k.threshold,
    }));
}

function buildTrackedRow(
  exp: FounderTrackedExperiment,
  apiByExperiment: Map<string, ApiUsageRecord[]>,
  events: FounderEvent[],
  store: ProjectIntelligenceStore,
  customKpis: ExperimentCustomKpi[],
  workspace: FounderWorkspaceData | null,
  analyses: ProjectIntelligence[],
  now: Date,
): ExperimentMetricRow {
  const milestones = parseMilestones(exp.testPlan);
  const { completed, rate } = milestoneProgress(exp.status, milestones.length);
  const finished = exp.status === "successful" || exp.status === "failed";
  const apiRecords = apiByExperiment.get(exp.id) ?? [];
  const apiTokens = apiRecords.reduce((s, r) => s + r.totalTokens, 0);
  const durationDays = Math.max(
    0,
    Math.round(
      (new Date(exp.updatedAt).getTime() - new Date(exp.createdAt).getTime()) /
        MS_DAY,
    ),
  );
  const activity = captureProjectActivity(events, exp.relatedProjectId);
  const snapshots = kpiSnapshots(exp.id, customKpis);
  const kpiBreaches = snapshots.filter((k) => k.thresholdExceeded).length;
  const openIssues = openIssuesForProject(store, exp.relatedProjectId);
  const bottleneck = bottleneckFor(exp, milestones.length);
  const success = successOf(exp);

  return {
    id: exp.id,
    title: exp.title,
    source: "tracked",
    status: exp.status,
    tags: inferTagsFromTracked(exp),
    relatedProjectId: exp.relatedProjectId,
    relatedProjectTitle: exp.relatedProjectTitle,
    success,
    completionRate: rate,
    milestoneCount: milestones.length || 1,
    milestonesCompleted: completed,
    avgDaysPerMilestone: avgDaysPerMilestone(
      exp.createdAt,
      exp.updatedAt,
      milestones.length || 1,
      finished,
    ),
    durationDays,
    apiCalls: apiRecords.length,
    apiTokens,
    estimatedCostUsd: Math.round(
      apiRecords.reduce((s, r) => s + estimateApiCostUsd(r), 0) * 1000,
    ) / 1000,
    timeInvestedMinutes:
      activity.focusMinutes + Math.round(durationDays * 30),
    googleDocLinks: googleLinksForProject(store, exp.relatedProjectId),
    result: exp.result,
    hypothesis: exp.hypothesis,
    bottleneck,
    taskCount: Math.max(activity.tasksCreated, milestones.length || 1),
    tasksCompleted: Math.max(activity.tasksCompleted, completed),
    insightsFlagged: countInsightsFlagged({
      bottleneck,
      status: exp.status,
      success,
      openProjectIssues: openIssues,
      kpiThresholdBreaches: kpiBreaches,
    }),
    projectActivityCount:
      activity.projectUpdates +
      activity.tasksCompleted +
      activity.engagementEvents,
    googleDocUpdates: activity.googleExports,
    projectDelayed: isProjectDelayed(
      exp.relatedProjectId,
      workspace,
      analyses,
      now,
    ),
    customKpis: snapshots,
    timeline: buildExperimentTimeline({
      experimentId: exp.id,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
      status: exp.status,
      relatedProjectId: exp.relatedProjectId,
      events,
    }),
    createdAt: exp.createdAt,
    updatedAt: exp.updatedAt,
  };
}

function workspaceStatusRate(status: string): number {
  if (status === "done") return 100;
  if (status === "active") return 50;
  if (status === "parked") return 15;
  return 25;
}

export function buildExperimentMetricsReport(input: {
  tracking: FounderTrackingData;
  workspace: FounderWorkspaceData | null;
  events: FounderEvent[];
  apiUsage: ApiUsageRecord[];
  intelligenceStore: ProjectIntelligenceStore;
  customKpis?: ExperimentCustomKpi[];
  analyses?: ProjectIntelligence[];
  filters: ExperimentMetricsFilters;
  now?: Date;
}): ExperimentMetricsReport {
  const now = input.now ?? new Date();
  const apiInRange = input.apiUsage.filter((r) =>
    inTimeframe(r.ts, input.filters, now),
  );

  const apiByExperiment = new Map<string, ApiUsageRecord[]>();
  const apiByProject = new Map<string, ApiUsageRecord[]>();
  for (const r of apiInRange) {
    if (r.experimentId) {
      const list = apiByExperiment.get(r.experimentId) ?? [];
      list.push(r);
      apiByExperiment.set(r.experimentId, list);
    }
    if (r.projectId) {
      const list = apiByProject.get(r.projectId) ?? [];
      list.push(r);
      apiByProject.set(r.projectId, list);
    }
  }

  const customKpis = input.customKpis ?? [];
  const analyses = input.analyses ?? [];

  let rows: ExperimentMetricRow[] = input.tracking.experiments
    .filter((e) => inTimeframe(e.updatedAt, input.filters, now))
    .map((e) =>
      buildTrackedRow(
        e,
        apiByExperiment,
        input.events,
        input.intelligenceStore,
        customKpis,
        input.workspace,
        analyses,
        now,
      ),
    );

  const trackedIds = new Set(rows.map((r) => r.id));
  const workspaceExps = input.workspace?.experiments ?? [];
  for (const item of workspaceExps) {
    if (trackedIds.has(item.id)) continue;
    if (!inTimeframe(item.updatedAt, input.filters, now)) continue;
    const apiRecords = apiByProject.get(item.id) ?? [];
    const tags = inferTagsFromWorkspaceItem(item);
    const activity = captureProjectActivity(input.events, item.id);
    const snapshots = kpiSnapshots(item.id, customKpis);
    const kpiBreaches = snapshots.filter((k) => k.thresholdExceeded).length;
    const openIssues = openIssuesForProject(input.intelligenceStore, item.id);
    const bottleneck =
      item.status === "active" ? "Workspace experiment still open" : null;
    const success = item.status === "done" ? true : null;
    rows.push({
      id: item.id,
      title: item.title,
      source: "workspace",
      status: item.status,
      tags,
      success,
      completionRate: workspaceStatusRate(item.status),
      milestoneCount: 1,
      milestonesCompleted: item.status === "done" ? 1 : 0,
      avgDaysPerMilestone: null,
      durationDays: Math.max(
        0,
        Math.round(
          (new Date(item.updatedAt).getTime() -
            new Date(item.createdAt).getTime()) /
            MS_DAY,
        ),
      ),
      apiCalls: apiRecords.length,
      apiTokens: apiRecords.reduce((s, r) => s + r.totalTokens, 0),
      estimatedCostUsd: Math.round(
        apiRecords.reduce((s, r) => s + estimateApiCostUsd(r), 0) * 1000,
      ) / 1000,
      timeInvestedMinutes: activity.focusMinutes,
      googleDocLinks: googleLinksForProject(input.intelligenceStore, item.id),
      result: item.description.slice(0, 200),
      bottleneck,
      taskCount: Math.max(activity.tasksCreated, 1),
      tasksCompleted: activity.tasksCompleted,
      insightsFlagged: countInsightsFlagged({
        bottleneck,
        status: item.status,
        success,
        openProjectIssues: openIssues,
        kpiThresholdBreaches: kpiBreaches,
      }),
      projectActivityCount:
        activity.projectUpdates +
        activity.tasksCompleted +
        activity.engagementEvents,
      googleDocUpdates: activity.googleExports,
      projectDelayed: isProjectDelayed(item.id, input.workspace, analyses, now),
      customKpis: snapshots,
      timeline: buildExperimentTimeline({
        experimentId: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        relatedProjectId: item.id,
        events: input.events,
      }),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  if (input.filters.projectId) {
    rows = rows.filter(
      (r) => r.relatedProjectId === input.filters.projectId || r.id === input.filters.projectId,
    );
  }
  if (input.filters.status !== "all") {
    rows = rows.filter((r) => r.status === input.filters.status);
  }
  if (input.filters.tag) {
    rows = rows.filter((r) => r.tags.includes(input.filters.tag!));
  }

  rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const allTags = [...new Set(rows.flatMap((r) => r.tags))].sort();
  const finished = rows.filter((r) => r.success !== null);
  const successful = finished.filter((r) => r.success === true).length;
  const failed = finished.filter((r) => r.success === false).length;
  const inProgress = rows.filter(
    (r) => r.success === null && r.status !== "parked",
  ).length;

  const aggregate = {
    total: rows.length,
    successful,
    failed,
    inProgress,
    avgCompletionRate: rows.length
      ? Math.round(rows.reduce((s, r) => s + r.completionRate, 0) / rows.length)
      : 0,
    successRate: finished.length
      ? Math.round((successful / finished.length) * 100)
      : 0,
    totalApiCalls: rows.reduce((s, r) => s + r.apiCalls, 0),
    totalApiTokens: rows.reduce((s, r) => s + r.apiTokens, 0),
    totalEstimatedCostUsd:
      Math.round(rows.reduce((s, r) => s + r.estimatedCostUsd, 0) * 100) / 100,
    totalTimeInvestedMinutes: rows.reduce((s, r) => s + r.timeInvestedMinutes, 0),
  };

  const outcomesPie = [
    { label: "Successful", value: successful, color: "#1e4f4f" },
    { label: "Failed", value: failed, color: "#a85c4a" },
    { label: "In progress", value: inProgress, color: "#e8c547" },
    { label: "Parked", value: rows.filter((r) => r.status === "parked").length, color: "#d4cdc3" },
  ].filter((s) => s.value > 0);

  const completionByExperiment = [...rows]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 8)
    .map((r) => ({
      label: r.title.slice(0, 14),
      value: r.completionRate,
      color: r.success === false ? "#a85c4a" : "#1e4f4f",
    }));

  const tokenBuckets = new Map<string, number>();
  for (const r of apiInRange) {
    const key = r.ts.slice(0, 10);
    tokenBuckets.set(key, (tokenBuckets.get(key) ?? 0) + r.totalTokens);
  }
  const tokensOverTime = [...tokenBuckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([ts, value]) => ({
      ts,
      label: ts.slice(5),
      value,
    }));

  const tagPerf = new Map<string, { success: number; total: number }>();
  for (const r of finished) {
    for (const tag of r.tags.slice(0, 3)) {
      const row = tagPerf.get(tag) ?? { success: 0, total: 0 };
      row.total += 1;
      if (r.success) row.success += 1;
      tagPerf.set(tag, row);
    }
  }
  const typePerformance = [...tagPerf.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([label, v]) => ({
      label,
      value: v.total ? Math.round((v.success / v.total) * 100) : 0,
      color: v.success / v.total >= 0.5 ? "#1e4f4f" : "#a85c4a",
    }));

  const successBuckets = new Map<string, { ok: number; total: number }>();
  for (const r of finished) {
    const key = r.updatedAt.slice(0, 10);
    const row = successBuckets.get(key) ?? { ok: 0, total: 0 };
    row.total += 1;
    if (r.success) row.ok += 1;
    successBuckets.set(key, row);
  }
  const successRateTrend = [...successBuckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([ts, row]) => ({
      ts,
      label: ts.slice(5),
      value: row.total ? Math.round((row.ok / row.total) * 100) : 0,
    }));

  const engagementBuckets = new Map<string, number>();
  for (const e of input.events) {
    if (
      e.type !== "task.completed" &&
      e.type !== "workspace.opened" &&
      e.type !== "chat.coaching"
    ) {
      continue;
    }
    if (!inTimeframe(e.ts, input.filters, now)) continue;
    const key = e.ts.slice(0, 10);
    engagementBuckets.set(key, (engagementBuckets.get(key) ?? 0) + 1);
  }
  const engagementTrend = [...engagementBuckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([ts, value]) => ({
      ts,
      label: ts.slice(5),
      value,
    }));

  const alerts = buildExperimentMetricAlerts(rows, customKpis);
  const anomalies = detectAnomalies(rows);

  return {
    generatedAt: now.toISOString(),
    filters: input.filters,
    aggregate,
    experiments: rows,
    outcomesPie,
    completionByExperiment,
    tokensOverTime,
    typePerformance,
    successRateTrend,
    bottlenecks: detectBottlenecks(rows),
    pendingActions: buildPendingActions(rows),
    recommendations: buildExperimentRecommendations(rows),
    allTags,
    alerts,
    anomalies,
    suggestedKpis: DEFAULT_KPI_SUGGESTIONS,
    engagementTrend,
  };
}
