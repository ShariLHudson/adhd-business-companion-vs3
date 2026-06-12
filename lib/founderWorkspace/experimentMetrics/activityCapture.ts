import type { FounderEvent } from "@/lib/ecosystem/events";
import type { ProjectIntelligenceStore } from "@/lib/founderWorkspace/intelligence/types";

export type ProjectActivityMetrics = {
  tasksCreated: number;
  tasksCompleted: number;
  projectUpdates: number;
  googleExports: number;
  focusMinutes: number;
  engagementEvents: number;
};

export function captureProjectActivity(
  events: FounderEvent[],
  projectId?: string,
): ProjectActivityMetrics {
  if (!projectId) {
    return {
      tasksCreated: 0,
      tasksCompleted: 0,
      projectUpdates: 0,
      googleExports: 0,
      focusMinutes: 0,
      engagementEvents: 0,
    };
  }

  let tasksCreated = 0;
  let tasksCompleted = 0;
  let projectUpdates = 0;
  let googleExports = 0;
  let focusMinutes = 0;
  let engagementEvents = 0;

  for (const e of events) {
    if (e.refs?.projectId !== projectId) continue;
    if (e.type === "task.created") tasksCreated += 1;
    if (e.type === "task.completed") tasksCompleted += 1;
    if (e.type === "project.updated" || e.type === "project.stage_changed") {
      projectUpdates += 1;
    }
    if (
      e.type === "document.exported" &&
      /google/i.test(String(e.data?.provider ?? ""))
    ) {
      googleExports += 1;
    }
    if (e.type === "focus.completed") {
      focusMinutes += Number(e.data?.actualMinutes ?? 0);
    }
    if (
      e.type === "workspace.opened" ||
      e.type === "chat.coaching" ||
      e.type === "assisted_action.accepted"
    ) {
      engagementEvents += 1;
    }
  }

  return {
    tasksCreated,
    tasksCompleted,
    projectUpdates,
    googleExports,
    focusMinutes,
    engagementEvents,
  };
}

export function countInsightsFlagged(input: {
  bottleneck: string | null;
  status: string;
  success: boolean | null;
  openProjectIssues: number;
  kpiThresholdBreaches: number;
}): number {
  let n = 0;
  if (input.bottleneck) n += 1;
  if (input.success === false) n += 1;
  if (input.status === "testing" && input.openProjectIssues > 0) n += 1;
  n += input.kpiThresholdBreaches;
  return n;
}

export function openIssuesForProject(
  store: ProjectIntelligenceStore,
  projectId?: string,
): number {
  if (!projectId) return 0;
  return store.issues.filter(
    (i) => i.projectId === projectId && i.status === "active",
  ).length;
}
