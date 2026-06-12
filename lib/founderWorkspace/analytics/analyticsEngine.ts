import type { FounderEvent } from "@/lib/ecosystem/events";
import type { FounderWorkspaceData } from "../types";
import type { ProjectIntelligence } from "../intelligence/types";
import {
  getFailedRetests,
  getPendingRetests,
} from "../tracking/retestHelpers";
import type { FounderTrackingData } from "../tracking/types";

import {
  buildAnalyticsAlerts,
  buildExperimentInsights,
  buildExperimentSuccessRate,
  buildProjectProgress,
} from "./insightsEngine";

import type { ApiUsageRecord } from "./types";
import type {
  ActivityFeedItem,
  AnalyticsFilters,
  AnalyticsKpi,
  BarSeriesItem,
  FounderAnalyticsReport,
  PieSlice,
  TimeSeriesPoint,
} from "./types";

const MS_DAY = 86_400_000;

const WORKSPACE_COLORS: Record<string, string> = {
  create: "#1e4f4f",
  projects: "#e0795a",
  "time-block": "#e8c547",
  templates: "#6b635a",
  "focus-audio": "#4a7c9b",
  snippets: "#a85c4a",
  strategies: "#7a5c00",
  other: "#d4cdc3",
};

function timeframeMs(tf: AnalyticsFilters["timeframe"]): number {
  if (tf === "day") return MS_DAY;
  if (tf === "week") return 7 * MS_DAY;
  return 30 * MS_DAY;
}

function inTimeframe(ts: string, filters: AnalyticsFilters, now: Date): boolean {
  return now.getTime() - new Date(ts).getTime() <= timeframeMs(filters.timeframe);
}

function matchesProject(e: FounderEvent, projectId: string | null): boolean {
  if (!projectId) return true;
  return e.refs?.projectId === projectId;
}

function matchesWorkspace(e: FounderEvent, workspace: string | null): boolean {
  if (!workspace) return true;
  const ws = e.refs?.workspace ?? e.workspaceContext?.kind;
  return ws === workspace;
}

function filterEvents(
  events: FounderEvent[],
  filters: AnalyticsFilters,
  now: Date,
): FounderEvent[] {
  return events.filter(
    (e) =>
      inTimeframe(e.ts, filters, now) &&
      matchesProject(e, filters.projectId) &&
      matchesWorkspace(e, filters.workspace),
  );
}

function dayKey(ts: string): string {
  return ts.slice(0, 10);
}

function bucketLabel(tf: AnalyticsFilters["timeframe"], key: string): string {
  if (tf === "day") return key.slice(11, 16) || key;
  return key.slice(5);
}

function seriesFromEvents(
  events: FounderEvent[],
  type: string,
  filters: AnalyticsFilters,
): TimeSeriesPoint[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.type !== type) continue;
    const key = filters.timeframe === "day" ? e.ts.slice(0, 13) : dayKey(e.ts);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => ({
      label: bucketLabel(filters.timeframe, key),
      value,
      ts: key,
    }));
}

function loadTemplateSnippetCounts(): { templates: number; snippets: number } {
  if (typeof window === "undefined") return { templates: 0, snippets: 0 };
  try {
    const templates = JSON.parse(
      window.localStorage.getItem("companion-templates-v1") ?? "[]",
    );
    const snippets = JSON.parse(
      window.localStorage.getItem("companion-snippets-v1") ?? "[]",
    );
    return {
      templates: Array.isArray(templates) ? templates.length : 0,
      snippets: Array.isArray(snippets) ? snippets.length : 0,
    };
  } catch {
    return { templates: 0, snippets: 0 };
  }
}

export function buildFounderAnalyticsReport(input: {
  events: FounderEvent[];
  workspace: FounderWorkspaceData | null;
  tracking: FounderTrackingData;
  apiUsage: ApiUsageRecord[];
  filters: AnalyticsFilters;
  analyses?: ProjectIntelligence[];
  now?: Date;
}): FounderAnalyticsReport {
  const now = input.now ?? new Date();
  const filtered = filterEvents(input.events, input.filters, now);
  const { templates, snippets } = loadTemplateSnippetCounts();

  const projectsCompletedEvents = filtered.filter(
    (e) => e.type === "project.completed",
  ).length;
  const projectsCreatedEvents = filtered.filter(
    (e) => e.type === "project.created",
  ).length;
  const workspaceProjects = input.workspace?.projects ?? [];
  const projectsDone = workspaceProjects.filter((p) => p.status === "done").length;
  const projectsTotal = workspaceProjects.length;
  const completionRate =
    projectsTotal > 0 ? Math.round((projectsDone / projectsTotal) * 100) : 0;

  const experiments = input.tracking.experiments.filter((e) =>
    inTimeframe(e.updatedAt, input.filters, now),
  );
  const expSuccessful = experiments.filter((e) => e.status === "successful").length;
  const expFailed = experiments.filter((e) => e.status === "failed").length;
  const expTesting = experiments.filter((e) => e.status === "testing").length;
  const expIdea = experiments.filter((e) => e.status === "idea").length;

  const pendingRetests = getPendingRetests(input.tracking);
  const failedRetests = getFailedRetests(input.tracking);

  const apiInRange = input.apiUsage.filter((r) =>
    inTimeframe(r.ts, input.filters, now),
  );
  const apiTokens = apiInRange.reduce((s, r) => s + r.totalTokens, 0);

  const googleExports = filtered.filter(
    (e) =>
      e.type === "document.exported" &&
      /google/i.test(String(e.data?.provider ?? "")),
  ).length;

  const focusMinutes = filtered
    .filter((e) => e.type === "focus.completed")
    .reduce((s, e) => s + Number(e.data?.actualMinutes ?? 0), 0);

  const workspaceCounts = new Map<string, number>();
  for (const e of filtered) {
    if (e.type !== "workspace.opened") continue;
    const ws = String(e.refs?.workspace ?? "other");
    workspaceCounts.set(ws, (workspaceCounts.get(ws) ?? 0) + 1);
  }
  const workspaceUsage: PieSlice[] = [...workspaceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      color: WORKSPACE_COLORS[label] ?? WORKSPACE_COLORS.other,
    }));

  const templateUsage: BarSeriesItem[] = [
    {
      label: "Templates saved",
      value: templates,
      color: "#6b635a",
    },
    {
      label: "Snippets saved",
      value: snippets,
      color: "#a85c4a",
    },
    {
      label: "Template workspace opens",
      value: filtered.filter(
        (e) =>
          e.type === "workspace.opened" &&
          (e.refs?.workspace === "templates" ||
            e.workspaceContext?.kind === "templates"),
      ).length,
      color: "#1e4f4f",
    },
    {
      label: "Snippet workspace opens",
      value: filtered.filter(
        (e) =>
          e.type === "workspace.opened" &&
          String(e.refs?.workspace ?? "").includes("snippet"),
      ).length,
      color: "#e0795a",
    },
  ];

  const experimentOutcomes: BarSeriesItem[] = [
    { label: "Planned", value: expIdea, color: "#ebe4d9" },
    { label: "Running", value: expTesting, color: "#e8c547" },
    { label: "Successful", value: expSuccessful, color: "#1e4f4f" },
    { label: "Failed", value: expFailed, color: "#a85c4a" },
  ];

  const projectsOverTime = seriesFromEvents(
    filtered,
    "project.created",
    input.filters,
  );
  const completedOverTime = seriesFromEvents(
    filtered,
    "project.completed",
    input.filters,
  );
  const mergedProjects = projectsOverTime.map((p, i) => ({
    ...p,
    value: p.value + (completedOverTime[i]?.value ?? 0),
  }));

  const apiUsageOverTime: TimeSeriesPoint[] = (() => {
    const map = new Map<string, number>();
    for (const r of apiInRange) {
      const key =
        input.filters.timeframe === "day" ? r.ts.slice(0, 13) : dayKey(r.ts);
      map.set(key, (map.get(key) ?? 0) + r.totalTokens);
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, value]) => ({
        label: bucketLabel(input.filters.timeframe, key),
        value,
        ts: key,
      }));
  })();

  const recentActivity: ActivityFeedItem[] = [];

  for (const e of [...filtered].sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 15)) {
    if (e.type === "project.created" || e.type === "project.completed") {
      recentActivity.push({
        id: e.id,
        ts: e.ts,
        kind: "project",
        title: String(e.data?.title ?? "Project"),
        detail: e.type === "project.completed" ? "Completed" : "Created",
      });
    }
    if (e.type === "document.exported") {
      recentActivity.push({
        id: e.id,
        ts: e.ts,
        kind: "google",
        title: "Document export",
        detail: String(e.data?.provider ?? "export"),
      });
    }
    if (e.type === "workspace.opened") {
      recentActivity.push({
        id: e.id,
        ts: e.ts,
        kind: "workspace",
        title: String(e.refs?.workspace ?? "workspace"),
        detail: "Opened",
      });
    }
  }

  for (const issue of input.tracking.issues.slice(0, 5)) {
    recentActivity.push({
      id: issue.id,
      ts: issue.updatedAt,
      kind: "issue",
      title: issue.title,
      detail: issue.status,
    });
  }
  for (const exp of experiments.slice(0, 5)) {
    recentActivity.push({
      id: exp.id,
      ts: exp.updatedAt,
      kind: "experiment",
      title: exp.title,
      detail: exp.status,
    });
  }

  recentActivity.sort((a, b) => (a.ts < b.ts ? 1 : -1));

  const kpis: AnalyticsKpi[] = [
    {
      id: "api_usage",
      label: "API tokens",
      value: apiTokens.toLocaleString(),
      sublabel: `${apiInRange.length} calls`,
      drillDown: "api_usage",
    },
    {
      id: "projects",
      label: "Project completion",
      value: `${completionRate}%`,
      sublabel: `${projectsDone}/${projectsTotal} done`,
      drillDown: "projects",
    },
    {
      id: "experiments",
      label: "Experiments",
      value: String(expSuccessful),
      sublabel: `${expFailed} failed`,
      drillDown: "experiments",
    },
    {
      id: "retests",
      label: "Retest queue",
      value: String(pendingRetests.length),
      sublabel: `${failedRetests.length} failed`,
      drillDown: "retests",
    },
    {
      id: "workspace",
      label: "Focus minutes",
      value: String(focusMinutes),
      sublabel: "This period",
      drillDown: "workspace",
    },
    {
      id: "google",
      label: "Google exports",
      value: String(googleExports),
      drillDown: "google",
    },
    {
      id: "templates",
      label: "Templates / snippets",
      value: `${templates}/${snippets}`,
      drillDown: "templates",
    },
  ];

  const projectProgress = buildProjectProgress(
    input.events,
    input.workspace,
    input.analyses ?? [],
    now,
  );
  const experimentInsights = buildExperimentInsights(
    input.tracking,
    input.filters,
    now,
  );
  const experimentSuccessRate = buildExperimentSuccessRate(
    input.tracking,
    input.filters,
  );
  const alerts = buildAnalyticsAlerts({
    projectProgress,
    experimentInsights,
    apiTokens,
    apiCalls: apiInRange.length,
    timeframe: input.filters.timeframe,
  });

  return {
    generatedAt: now.toISOString(),
    filters: input.filters,
    kpis,
    projectProgress,
    experimentInsights,
    experimentSuccessRate,
    alerts,
    projectsOverTime: mergedProjects.length ? mergedProjects : projectsOverTime,
    experimentOutcomes,
    templateUsage,
    workspaceUsage,
    apiUsageOverTime,
    recentActivity: recentActivity.slice(0, 20),
    drillDownLists: {
      projects: workspaceProjects.map((p) => ({
        id: p.id,
        ts: p.updatedAt,
        kind: "project",
        title: p.title,
        detail: p.status,
      })),
      experiments: experiments.map((e) => ({
        id: e.id,
        ts: e.updatedAt,
        kind: "experiment",
        title: e.title,
        detail: e.status,
      })),
      retests: [...pendingRetests, ...failedRetests].map((i) => ({
        id: i.id,
        ts: i.updatedAt,
        kind: "retest",
        title: i.title,
        detail: i.status,
      })),
      apiUsage: apiInRange,
      google: filtered
        .filter((e) => e.type === "document.exported")
        .map((e) => ({
          id: e.id,
          ts: e.ts,
          kind: "google",
          title: "Export",
          detail: String(e.data?.provider ?? ""),
        })),
      templates: recentActivity.filter((a) =>
        ["workspace", "experiment"].includes(a.kind),
      ),
    },
    summary: {
      projectsCompleted: projectsDone || projectsCompletedEvents,
      projectsTotal: projectsTotal || projectsCreatedEvents,
      completionRate,
      experimentsSuccessful: expSuccessful,
      experimentsFailed: expFailed,
      retestPending: pendingRetests.length,
      retestFailed: failedRetests.length,
      apiCalls: apiInRange.length,
      apiTokens,
      googleExports,
      templateCount: templates,
      snippetCount: snippets,
      focusMinutes,
    },
  };
}
