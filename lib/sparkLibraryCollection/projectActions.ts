/**
 * Project library actions — wraps Project Homes / companion-projects seams.
 */

import {
  archiveProjectHome,
  duplicateProjectHome,
  renameProjectHome,
  restoreProjectHome,
} from "@/lib/projectHomes/homeActions";
import type { ProjectHomeRecord } from "@/lib/projectHomes/types";
import { saveProject } from "@/lib/companionProjectsStore";
import type { ProjectStatus } from "@/lib/companionProjectsStore";
import { setLibraryFavorite, toggleLibraryFavorite } from "./favorites";

export function libraryRenameProject(
  homes: ProjectHomeRecord[],
  id: string,
  name: string,
): ProjectHomeRecord[] {
  return renameProjectHome(homes, id, name);
}

export function libraryArchiveProject(
  homes: ProjectHomeRecord[],
  id: string,
): ProjectHomeRecord[] {
  return archiveProjectHome(homes, id);
}

export function libraryRestoreProject(
  homes: ProjectHomeRecord[],
  id: string,
): ProjectHomeRecord[] {
  return restoreProjectHome(homes, id);
}

export function libraryDuplicateProject(
  homes: ProjectHomeRecord[],
  id: string,
): { homes: ProjectHomeRecord[]; duplicate: ProjectHomeRecord | null } {
  return duplicateProjectHome(homes, id);
}

export function libraryToggleProjectFavorite(id: string): boolean {
  return toggleLibraryFavorite("project", id);
}

export function librarySetProjectFavorite(id: string, favorite: boolean): void {
  setLibraryFavorite("project", id, favorite);
}

export function libraryEditProjectDetails(
  homes: ProjectHomeRecord[],
  id: string,
  details: { name?: string; purpose?: string },
): ProjectHomeRecord[] {
  return homes.map((h) => {
    if (h.id !== id) return h;
    const next = {
      ...h,
      name: details.name?.trim() || h.name,
      purpose:
        details.purpose !== undefined ? details.purpose.trim() : h.purpose,
      lastWorkedAt: new Date().toISOString(),
    };
    if (next.companionProjectId) {
      saveProject({
        id: next.companionProjectId,
        name: next.name,
        goal: next.purpose,
      });
    }
    return next;
  });
}

const STATUS_CYCLE: ProjectStatus[] = [
  "not-started",
  "in-progress",
  "paused",
  "completed",
];

export function libraryChangeProjectStatus(
  homes: ProjectHomeRecord[],
  id: string,
  status?: ProjectStatus,
): ProjectHomeRecord[] {
  return homes.map((h) => {
    if (h.id !== id) return h;
    const companionId = h.companionProjectId;
    let nextStoreStatus = status;
    if (!nextStoreStatus && companionId) {
      // Cycle calmly when no explicit status provided
      nextStoreStatus = "in-progress";
    }
    if (companionId && nextStoreStatus) {
      saveProject({ id: companionId, status: nextStoreStatus });
    }
    const homeStatus =
      nextStoreStatus === "completed"
        ? ("nearly-ready" as const)
        : nextStoreStatus === "paused"
          ? ("resting" as const)
          : nextStoreStatus === "not-started"
            ? ("dreaming" as const)
            : ("in-motion" as const);
    return {
      ...h,
      status: homeStatus,
      lastWorkedAt: new Date().toISOString(),
    };
  });
}

export function libraryCycleProjectStatus(
  homes: ProjectHomeRecord[],
  id: string,
  currentStoreStatus?: ProjectStatus | null,
): ProjectHomeRecord[] {
  const idx = STATUS_CYCLE.indexOf(currentStoreStatus ?? "in-progress");
  const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  return libraryChangeProjectStatus(homes, id, next);
}
