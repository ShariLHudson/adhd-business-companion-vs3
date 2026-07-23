/**
 * Projects / Project Homes adapter for the shared library.
 */

import type { Project } from "@/lib/companionProjectsStore";
import { getProjects } from "@/lib/companionProjectsStore";
import type { ProjectHomeRecord } from "@/lib/projectHomes/types";
import {
  loadMemberProjectHomesFromStore,
  mergeMemberHomesWithStore,
} from "@/lib/projectHomes/homeActions";
import { getSourceCreationForProjectHome } from "../relationships";
import { isLibraryFavorite } from "../favorites";
import type { LibraryItem, LibraryItemCapabilities } from "../types";

function projectStatusLabel(
  home: ProjectHomeRecord,
  storeProject?: Project | null,
): { statusId: string; statusLabel: string } {
  if (home.archived || storeProject?.archived) {
    return { statusId: "archived", statusLabel: "Archived" };
  }
  const storeStatus = storeProject?.status;
  if (storeStatus === "completed") {
    return { statusId: "completed", statusLabel: "Completed" };
  }
  if (storeStatus === "paused") {
    return { statusId: "waiting", statusLabel: "Waiting" };
  }
  if (storeStatus === "not-started") {
    return { statusId: "planning", statusLabel: "Planning" };
  }
  switch (home.status) {
    case "dreaming":
      return { statusId: "planning", statusLabel: "Planning" };
    case "resting":
      return { statusId: "waiting", statusLabel: "Waiting" };
    case "nearly-ready":
      return { statusId: "completed", statusLabel: "Nearly ready" };
    case "in-motion":
    default:
      return { statusId: "active", statusLabel: "Active" };
  }
}

function capabilitiesFor(
  home: ProjectHomeRecord,
  hasSource: boolean,
): LibraryItemCapabilities {
  const sample = Boolean(home.isSample);
  const archived = Boolean(home.archived);
  return {
    canRename: !sample,
    canEditDetails: !sample,
    canDuplicate: true,
    canArchive: !sample && !archived,
    canRestore: !sample && archived,
    canTrash: false, // Phase 1 — Archive only; Trash deferred
    canFavorite: !sample,
    canCreateProject: false,
    canViewLinkedProject: false,
    canViewSourceCreation: hasSource,
    canChangeStatus: !sample && !archived,
    canContinue: false,
    canOpen: true,
  };
}

export function projectHomeToLibraryItem(
  home: ProjectHomeRecord,
  storeProject?: Project | null,
): LibraryItem {
  const { statusId, statusLabel } = projectStatusLabel(home, storeProject);
  const source = getSourceCreationForProjectHome(home.id);
  const dueHint =
    storeProject?.nextStepSuggestion ||
    home.nextSuggestedStep ||
    null;

  return {
    id: home.id,
    kind: "project",
    title: home.name || "Untitled project",
    description: home.purpose,
    typeLabel: "Project",
    statusId,
    statusLabel,
    tags: [],
    clientOrAudience: null,
    favorite: isLibraryFavorite("project", home.id),
    archived: Boolean(home.archived),
    createdAt: storeProject?.createdAt || home.lastWorkedAt,
    updatedAt: storeProject?.updatedAt || home.lastWorkedAt,
    dueAt: null,
    nextMilestoneLabel: dueHint,
    relationship: source
      ? {
          kind: "source_creation",
          id: source.id,
          label: source.title,
        }
      : null,
    capabilities: capabilitiesFor(home, Boolean(source)),
    primaryAction: "open",
    sourceRef: home,
  };
}

export function listProjectLibraryItems(
  localHomes?: ProjectHomeRecord[],
): LibraryItem[] {
  const storeHomes = loadMemberProjectHomesFromStore();
  const homes = localHomes
    ? mergeMemberHomesWithStore(localHomes, storeHomes)
    : storeHomes;
  const projects = getProjects();
  const byCompanion = new Map(projects.map((p) => [p.id, p]));

  return homes
    .filter((h) => !h.isSample)
    .map((home) => {
      const store =
        (home.companionProjectId
          ? byCompanion.get(home.companionProjectId)
          : undefined) ?? byCompanion.get(home.id);
      return projectHomeToLibraryItem(home, store ?? null);
    });
}
