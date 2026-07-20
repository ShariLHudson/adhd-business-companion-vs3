/**
 * 057 — List Active Work for Projects landing.
 * Creation Workspaces first; member projects that aren't already linked.
 * Light Continue cards only — no Create write-path modules.
 */

import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { PROJECT_HOME_STATUS_LABEL } from "@/lib/projectHomes/sampleProjects";
import type { ProjectHomeRecord } from "@/lib/projectHomes/types";
import type { ActiveWorkCardModel } from "./types";

function fromCreationWorkspace(
  summary: ReturnType<typeof listActiveCreationWorkspaces>[number],
): ActiveWorkCardModel {
  const status = summary.statusLabel || summary.phaseLabel;
  return {
    id: `workspace:${summary.id}`,
    name: summary.title,
    creationType: summary.kindLabel,
    statusLabel: status,
    phaseLabel: status,
    currentFocus: summary.nextAction || "Continue where you left off",
    progressPercent: null,
    nextRecommendedStep: summary.nextAction || "Continue",
    lastWorkedAt: summary.updatedAt,
    waitingItems: [],
    sourceKind: "creation_workspace",
    eventRecordId: summary.eventRecordId,
    projectHomeRecordId: summary.projectHomeId,
    companionProjectId: null,
  };
}

function fromMemberProject(home: ProjectHomeRecord): ActiveWorkCardModel {
  return {
    id: `project:${home.id}`,
    name: home.name,
    creationType: "Project",
    statusLabel: PROJECT_HOME_STATUS_LABEL[home.status] ?? "In motion",
    phaseLabel: PROJECT_HOME_STATUS_LABEL[home.status] ?? "In motion",
    currentFocus: home.currentFocus?.trim() || "Continue this work",
    progressPercent: null,
    nextRecommendedStep:
      home.nextSuggestedStep?.trim() || "Open and continue",
    lastWorkedAt: home.lastWorkedAt,
    waitingItems: [],
    sourceKind: "member_project",
    eventRecordId: null,
    projectHomeRecordId: home.id,
    companionProjectId: home.companionProjectId ?? null,
  };
}

/**
 * Active Work for Projects — Creation Workspaces + unlinked member projects.
 */
export function listActiveWorkCards(
  memberHomes: readonly ProjectHomeRecord[] = [],
): ActiveWorkCardModel[] {
  const fromWorkspaces = listActiveCreationWorkspaces().map(fromCreationWorkspace);

  const linkedProjectHomeIds = new Set(
    fromWorkspaces
      .map((w) => w.projectHomeRecordId)
      .filter((id): id is string => Boolean(id)),
  );

  const fromHomes = memberHomes
    .filter((h) => !h.archived && !h.isSample)
    .filter((h) => {
      if (h.companionProjectId && linkedProjectHomeIds.has(h.id)) {
        return false;
      }
      if (linkedProjectHomeIds.has(h.id)) return false;
      return true;
    })
    .map(fromMemberProject);

  return [...fromWorkspaces, ...fromHomes].sort(
    (a, b) =>
      new Date(b.lastWorkedAt).getTime() - new Date(a.lastWorkedAt).getTime(),
  );
}
