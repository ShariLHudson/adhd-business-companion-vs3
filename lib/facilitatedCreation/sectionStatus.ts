/**
 * Living workspace section status — Complete for Now is never a lock (077_006).
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceV2";
import type { FacilitatedSectionStatus } from "./types";

export function resolveFacilitatedSectionStatus(
  section: { id: string; content: string; skipped: boolean },
  workflow: CreateWorkflowState,
): FacilitatedSectionStatus {
  if (section.skipped) return "skipped_for_now";

  const completed = new Set(workflow.completedSectionIds ?? []);
  const content = section.content.trim();
  const isActive = workflow.activeSectionId === section.id;

  if (completed.has(section.id)) {
    return "complete_for_now";
  }

  if (!content) {
    return isActive ? "in_progress" : "not_started";
  }

  if (workflow.draftStatus === "ready" && workflow.buildApproved) {
    return "needs_review";
  }

  if (isActive) return "in_progress";
  // Has content but not marked complete — still in progress on the map
  return "in_progress";
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
    } else if (status === "in_progress") inProgress += 1;
    else notStarted += 1;
  }
  return { total: sections.length, complete, inProgress, notStarted };
}
