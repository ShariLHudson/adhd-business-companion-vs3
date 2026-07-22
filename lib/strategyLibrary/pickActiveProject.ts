/**
 * Resolve the member's Current Focus project for Strategy connections.
 * Never invent a project — only return an existing one.
 */

import {
  getProjects,
  type Project,
} from "@/lib/companionProjectsStore";

/** Prefer active-focus → now horizon → in-progress. */
export function pickActiveProject(): Project | null {
  const projects = getProjects().filter((p) => !p.archived);
  const focus = projects.find((p) => p.status === "active-focus");
  if (focus) return focus;
  const now = projects.find(
    (p) => p.horizon === "now" && p.status !== "completed",
  );
  if (now) return now;
  return projects.find((p) => p.status === "in-progress") ?? null;
}

export function pickActiveProjectName(): string | null {
  return pickActiveProject()?.name?.trim() ?? null;
}
