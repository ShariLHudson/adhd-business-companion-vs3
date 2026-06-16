/**
 * Build stable project workspace detail from store — used when the panel
 * remounts on list view before initialProjectId is applied.
 */

import {
  getProjectItems,
  getProjects,
  PROJECT_HORIZON_LABEL,
  PROJECT_STATUS_LABEL,
} from "./companionStore";
import type { WorkspacePanelDetail } from "./workspaceAwareness";

export function projectDetailFromStore(
  projectId: string,
): WorkspacePanelDetail | null {
  const p = getProjects().find((x) => x.id === projectId);
  if (!p) return null;

  const taskCount = getProjectItems(p.id).filter(
    (i) => i.kind === "task" || i.kind === "subtask",
  ).length;

  return {
    view: "detail",
    stage: "Project detail",
    selectedItemId: p.id,
    selectedItemName: p.name,
    selectedItemGoal: p.goal.trim() || null,
    selectedItemStatus: PROJECT_STATUS_LABEL[p.status],
    selectedItemHorizon: PROJECT_HORIZON_LABEL[p.horizon],
    selectedItemColor: p.color,
    showProjectColor: true,
    projectTaskCount: taskCount,
    projectGoalCount: (p.goals ?? []).length,
    nextAction: p.nextAction.trim() || null,
  };
}

/** Prefer live panel detail; fall back to projectContinueId from store. */
export function resolveProjectWorkspaceDetail(
  detail: WorkspacePanelDetail | null | undefined,
  projectContinueId: string | null | undefined,
): WorkspacePanelDetail | null {
  if (detail?.view === "detail" && detail.selectedItemId) return detail;
  const id = detail?.selectedItemId ?? projectContinueId ?? null;
  if (!id) return detail ?? null;
  return projectDetailFromStore(id) ?? detail ?? null;
}

export function projectIdFromDetail(
  detail: WorkspacePanelDetail | null | undefined,
  projectContinueId?: string | null,
): string | null {
  return detail?.selectedItemId ?? projectContinueId ?? null;
}
