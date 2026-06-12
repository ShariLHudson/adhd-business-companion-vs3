// Founder Ecosystem — Phase 1 dashboard metrics.
//
// Everything here is DERIVED from the event stream — no manual input. Pass in
// the events (e.g. eventStore.query({ founderId })) and get a snapshot the
// Founder Dashboard can render directly. Keeping computation here (not in UI)
// means the same numbers power dashboards, reports, and Shari's intelligence.

import type { FounderEvent, WorkspaceKind } from "./events";

function dayKey(ts: string): string {
  return ts.slice(0, 10); // "YYYY-MM-DD"
}
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function withinDays(ts: string, days: number): boolean {
  return Date.now() - new Date(ts).getTime() < days * 86400000;
}

export type DashboardSnapshot = {
  // Headline counters
  activeProjects: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  focusMinutesThisWeek: number;
  documentsCreated: number;
  exportsByProvider: Record<string, number>;
  // Intelligence lists
  openDecisions: number;
  opportunities: number;
  topPainPoints: { text: string; occurrences: number }[];
  // Engagement / momentum
  activeDaysThisWeek: number;
  workspaceUsage: Record<string, number>;
  coachingInteractions: number;
};

export function computeDashboard(events: FounderEvent[]): DashboardSnapshot {
  const today = todayKey();

  const created = (t: string) => events.filter((e) => e.type === t).length;

  // Active projects = created − completed.
  const activeProjects =
    created("project.created") - created("project.completed");

  const taskCompletions = events.filter((e) => e.type === "task.completed");
  const tasksCompletedToday = taskCompletions.filter(
    (e) => dayKey(e.ts) === today,
  ).length;
  const tasksCompletedThisWeek = taskCompletions.filter((e) =>
    withinDays(e.ts, 7),
  ).length;

  const focusMinutesThisWeek = events
    .filter((e) => e.type === "focus.completed" && withinDays(e.ts, 7))
    .reduce((sum, e) => sum + Number(e.data?.actualMinutes ?? 0), 0);

  const documentsCreated = created("document.created");

  const exportsByProvider: Record<string, number> = {};
  for (const e of events.filter((e) => e.type === "document.exported")) {
    const p = String(e.data?.provider ?? "unknown");
    exportsByProvider[p] = (exportsByProvider[p] ?? 0) + 1;
  }

  const openDecisions =
    created("decision.created") -
    events.filter(
      (e) => e.type === "decision.updated" && e.data?.status === "made",
    ).length;

  const opportunities = created("opportunity.created");

  // Pain points: aggregate occurrences of the same observed friction.
  const painCounts = new Map<string, number>();
  for (const e of events.filter((e) => e.type === "painpoint.observed")) {
    const text = String(e.data?.text ?? "").trim();
    if (!text) continue;
    painCounts.set(text, (painCounts.get(text) ?? 0) + 1);
  }
  const topPainPoints = [...painCounts.entries()]
    .map(([text, occurrences]) => ({ text, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5);

  const activeDaysThisWeek = new Set(
    events.filter((e) => withinDays(e.ts, 7)).map((e) => dayKey(e.ts)),
  ).size;

  const workspaceUsage: Record<string, number> = {};
  for (const e of events.filter((e) => e.type === "workspace.opened")) {
    const k = (e.refs?.workspace ?? "unknown") as WorkspaceKind | "unknown";
    workspaceUsage[k] = (workspaceUsage[k] ?? 0) + 1;
  }

  const coachingInteractions = created("chat.coaching");

  return {
    activeProjects,
    tasksCompletedToday,
    tasksCompletedThisWeek,
    focusMinutesThisWeek,
    documentsCreated,
    exportsByProvider,
    openDecisions,
    opportunities,
    topPainPoints,
    activeDaysThisWeek,
    workspaceUsage,
    coachingInteractions,
  };
}
