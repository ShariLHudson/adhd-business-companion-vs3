/**
 * Project selection continuity — selected project survives refresh.
 */

import type { WorkspacePanelDetail } from "./workspaceAwareness";

export const PROJECT_CONTINUITY_KEY = "companion-project-continue-v1";

export type ProjectContinuitySnapshot = {
  projectContinueId: string | null;
  projectName: string | null;
  view: WorkspacePanelDetail["view"] | null;
  workspacePanelOpen: boolean;
  lastTouchedAt: string;
};

export function saveProjectContinuity(
  input: Omit<ProjectContinuitySnapshot, "lastTouchedAt">,
): void {
  if (typeof window === "undefined") return;
  if (!input.projectContinueId && !input.workspacePanelOpen) return;
  try {
    localStorage.setItem(
      PROJECT_CONTINUITY_KEY,
      JSON.stringify({
        ...input,
        lastTouchedAt: new Date().toISOString(),
      } satisfies ProjectContinuitySnapshot),
    );
  } catch {
    /* noop */
  }
}

export function loadProjectContinuity(): ProjectContinuitySnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROJECT_CONTINUITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectContinuitySnapshot;
    if (!parsed?.projectContinueId && !parsed?.workspacePanelOpen) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProjectContinuity(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROJECT_CONTINUITY_KEY);
  } catch {
    /* noop */
  }
}
