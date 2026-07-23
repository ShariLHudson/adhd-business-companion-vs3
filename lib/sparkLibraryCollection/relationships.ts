/**
 * Creation ↔ Project relationship helpers for library cards.
 * Does not duplicate creation content into projects.
 */

import { getProjects } from "@/lib/companionProjectsStore";
import {
  findCanonicalWorkByCreateWorkflow,
  findCanonicalWorkByProjectHome,
  listCanonicalWorkRecords,
} from "@/lib/createProjects/canonicalWorkRecord";
import { loadMemberProjectHomesFromStore } from "@/lib/projectHomes/homeActions";
import { peekRegistryWorkspaceEntry } from "@/lib/activeWorkspaceRegistry";

export function getProjectHomeName(projectHomeId: string): string | null {
  const id = projectHomeId.trim();
  if (!id) return null;
  const homes = loadMemberProjectHomesFromStore();
  const home =
    homes.find((h) => h.id === id) ||
    homes.find((h) => h.companionProjectId === id);
  if (home?.name?.trim()) return home.name.trim();

  const projects = getProjects();
  const project = projects.find((p) => p.id === id);
  if (project?.name?.trim()) return project.name.trim();

  const canonical = findCanonicalWorkByProjectHome(id);
  if (canonical?.title?.trim()) return canonical.title.trim();
  return null;
}

export function getSourceCreationForProjectHome(projectHomeId: string): {
  id: string;
  title: string;
} | null {
  const id = projectHomeId.trim();
  if (!id) return null;

  const byHome = findCanonicalWorkByProjectHome(id);
  if (byHome?.createWorkflowId) {
    const entry = peekRegistryWorkspaceEntry(byHome.createWorkflowId);
    return {
      id: byHome.createWorkflowId,
      title:
        entry?.title?.trim() ||
        byHome.title?.trim() ||
        "Source creation",
    };
  }

  // Fallback: registry entries pointing at this project home
  const homes = loadMemberProjectHomesFromStore();
  const home = homes.find((h) => h.id === id);
  const companionId = home?.companionProjectId ?? id;
  for (const work of listCanonicalWorkRecords()) {
    if (
      work.projectHomeId === id ||
      work.companionProjectId === companionId
    ) {
      if (work.createWorkflowId) {
        return {
          id: work.createWorkflowId,
          title: work.title || "Source creation",
        };
      }
    }
  }
  return null;
}

export function getLinkedProjectForCreation(workspaceId: string): {
  id: string;
  title: string;
} | null {
  const entry = peekRegistryWorkspaceEntry(workspaceId);
  if (entry?.projectHomeId) {
    const name = getProjectHomeName(entry.projectHomeId);
    return {
      id: entry.projectHomeId,
      title: name || "Linked project",
    };
  }
  const canonical = findCanonicalWorkByCreateWorkflow(workspaceId);
  if (canonical?.projectHomeId) {
    return {
      id: canonical.projectHomeId,
      title: getProjectHomeName(canonical.projectHomeId) || canonical.title,
    };
  }
  return null;
}
