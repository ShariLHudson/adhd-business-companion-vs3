/**
 * Living workspace section status — not finished until review.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceV2";
import type { FacilitatedSectionStatus } from "./types";

export function resolveFacilitatedSectionStatus(
  section: { id: string; content: string; skipped: boolean },
  workflow: CreateWorkflowState,
): FacilitatedSectionStatus {
  if (section.skipped) return "complete";
  const content = section.content.trim();
  const isActive = workflow.activeSectionId === section.id;

  if (!content) {
    return isActive ? "in_progress" : "not_started";
  }

  if (workflow.draftStatus === "ready" && workflow.buildApproved) {
    return "needs_review";
  }

  if (isActive) return "in_progress";
  return "complete";
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
    if (status === "complete" || status === "needs_review") complete += 1;
    else if (status === "in_progress") inProgress += 1;
    else notStarted += 1;
  }
  return { total: sections.length, complete, inProgress, notStarted };
}
