import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  CREATE_SECTION_LIFECYCLE_LABELS,
  type CreateSectionLifecycleStatus,
} from "./types";

export type SectionLifecycleView = {
  id: string;
  content: string;
  skipped: boolean;
};

/**
 * Resolve canonical Create section status from workflow fields.
 * Complete for Now is never a permanent lock.
 */
export function resolveCreateSectionLifecycleStatus(
  section: SectionLifecycleView,
  workflow: CreateWorkflowState,
): CreateSectionLifecycleStatus {
  if (section.skipped) return "skipped_for_now";

  const completed = new Set(workflow.completedSectionIds ?? []);
  const content = section.content.trim();
  const isActive = workflow.activeSectionId === section.id;
  const hadMilestone = Boolean(
    workflow.completedSectionVersions?.[section.id],
  );

  if (completed.has(section.id)) {
    return "complete_for_now";
  }

  if (
    workflow.draftStatus === "ready" &&
    workflow.buildApproved &&
    content
  ) {
    return "needs_review";
  }

  // Prior Complete for Now + not currently completed = reopened
  if (hadMilestone && (content || isActive)) {
    return "reopened";
  }

  if (!content) {
    return isActive ? "in_progress" : "not_started";
  }

  return "in_progress";
}

export function labelForCreateSectionLifecycleStatus(
  status: CreateSectionLifecycleStatus,
): string {
  return CREATE_SECTION_LIFECYCLE_LABELS[status];
}
