/**
 * 057 — List Active Work for Projects landing.
 * Creation Workspaces first; member projects that aren't already linked.
 */

import { hydrateActiveWorkspaceRegistryFromRuntimeRecords } from "@/lib/activeWorkspaceRegistry/registry";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listEventRecords } from "@/lib/eventsIntelligence/eventRecordStore";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { PROJECT_HOME_STATUS_LABEL } from "@/lib/projectHomes/sampleProjects";
import type { ProjectHomeRecord } from "@/lib/projectHomes/types";
import type { ActiveWorkCardModel } from "./types";

function progressFromEvent(record: EventRecord): number | null {
  const sections = record.sections ?? [];
  if (sections.length === 0) return null;
  const weight = (status: EventRecord["sections"][number]["status"]) => {
    if (status === "confirmed" || status === "skipped") return 1;
    if (status === "drafting") return 0.45;
    return 0;
  };
  const sum = sections.reduce((acc, s) => acc + weight(s.status), 0);
  return Math.round((sum / sections.length) * 100);
}

function waitingFromEvent(record: EventRecord): string[] {
  const open = (record.tasks ?? [])
    .filter((t) => t.confirmed && !t.done)
    .slice(0, 3)
    .map((t) => t.title);
  return open;
}

function fromCreationWorkspace(
  summary: ReturnType<typeof listActiveCreationWorkspaces>[number],
  record: EventRecord | undefined,
): ActiveWorkCardModel {
  // 073 — one canonical status everywhere (never Shaping vs Draft Ready mismatch)
  const status = summary.statusLabel || summary.phaseLabel;
  return {
    id: `workspace:${summary.id}`,
    name: summary.title,
    creationType: summary.kindLabel,
    statusLabel: status,
    phaseLabel: status,
    currentFocus: summary.nextAction || "Continue where you left off",
    progressPercent: record ? progressFromEvent(record) : null,
    nextRecommendedStep: summary.nextAction || "Continue",
    lastWorkedAt: summary.updatedAt,
    waitingItems: record ? waitingFromEvent(record) : [],
    sourceKind: "creation_workspace",
    eventRecordId: summary.eventRecordId,
    projectHomeRecordId: summary.projectHomeId,
    companionProjectId: record?.companionProjectId ?? null,
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
  // 074 — Projects reads persisted registry (heal from runtime after refresh)
  hydrateActiveWorkspaceRegistryFromRuntimeRecords();
  const events = listEventRecords();
  const eventById = new Map(events.map((e) => [e.id, e]));
  const linkedCompanionIds = new Set(
    events
      .map((e) => e.companionProjectId)
      .filter((id): id is string => Boolean(id)),
  );
  const linkedProjectHomeIds = new Set(
    events
      .map((e) => e.projectHomeId)
      .filter((id): id is string => Boolean(id)),
  );

  const fromWorkspaces = listActiveCreationWorkspaces().map((summary) =>
    fromCreationWorkspace(summary, eventById.get(summary.eventRecordId)),
  );

  const fromHomes = memberHomes
    .filter((h) => !h.archived && !h.isSample)
    .filter((h) => {
      if (h.companionProjectId && linkedCompanionIds.has(h.companionProjectId)) {
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
