/**
 * Living workspace section status — Complete for Now is never a lock (077_006).
 * Delegates to `lib/createSectionLifecycle` (sole status owner).
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  resolveCreateSectionLifecycleStatus,
  type CreateSectionLifecycleStatus,
} from "@/lib/createSectionLifecycle";
import type { FacilitatedSectionStatus } from "./types";

export function resolveFacilitatedSectionStatus(
  section: { id: string; content: string; skipped: boolean },
  workflow: CreateWorkflowState,
): FacilitatedSectionStatus {
  return resolveCreateSectionLifecycleStatus(
    section,
    workflow,
  ) as CreateSectionLifecycleStatus;
}

export function facilitatedSectionSummary(workflow: CreateWorkflowState): {
  total: number;
  complete: number;
  inProgress: number;
  notStarted: number;
} {
  const sections = workspaceV2Sections(workflow);
  let complete = 0;
  let inProgress = 0;
  let notStarted = 0;
  for (const s of sections) {
    const status = resolveFacilitatedSectionStatus(s, workflow);
    if (
      status === "complete" ||
      status === "complete_for_now" ||
      status === "needs_review" ||
      status === "skipped_for_now"
    ) {
      complete += 1;
    } else if (status === "in_progress" || status === "reopened") {
      inProgress += 1;
    } else notStarted += 1;
  }
  return { total: sections.length, complete, inProgress, notStarted };
}
