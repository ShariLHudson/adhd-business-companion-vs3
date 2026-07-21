import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { CreateSectionLifecycleTransition } from "./types";

function normalizeMeaningful(a: string, b: string): boolean {
  return a.replace(/\s+/g, " ").trim() !== b.replace(/\s+/g, " ").trim();
}

/**
 * Apply one section lifecycle transition to CreateWorkflowState.
 * Sole mutation owner for completed/skipped/version fields.
 */
export function applySectionLifecycleTransition(
  workflow: CreateWorkflowState,
  sectionId: string,
  transition: CreateSectionLifecycleTransition,
): CreateWorkflowState {
  switch (transition.type) {
    case "start":
      return {
        ...workflow,
        activeSectionId: sectionId,
        showAllWorkspaceSections: workflow.showAllWorkspaceSections ?? true,
      };

    case "complete_for_now": {
      const content = (workflow.sectionContent?.[sectionId] ?? "").trim();
      const completed = new Set(workflow.completedSectionIds ?? []);
      completed.add(sectionId);
      const skipped = (workflow.skippedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      const versions = { ...(workflow.completedSectionVersions ?? {}) };
      versions[sectionId] = {
        content,
        completedAt: new Date().toISOString(),
      };
      return {
        ...workflow,
        skippedSectionIds: skipped,
        completedSectionIds: [...completed],
        completedSectionVersions: versions,
        activeSectionId: workflow.activeSectionId ?? sectionId,
      };
    }

    case "skip_for_now": {
      const skipped = new Set(workflow.skippedSectionIds ?? []);
      skipped.add(sectionId);
      const completed = (workflow.completedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      return {
        ...workflow,
        skippedSectionIds: [...skipped],
        completedSectionIds: completed,
      };
    }

    case "unskip": {
      const skipped = (workflow.skippedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      return { ...workflow, skippedSectionIds: skipped };
    }

    case "reopen": {
      const completed = (workflow.completedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      const skipped = (workflow.skippedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      return {
        ...workflow,
        completedSectionIds: completed,
        skippedSectionIds: skipped,
        activeSectionId: sectionId,
        showAllWorkspaceSections: workflow.showAllWorkspaceSections ?? true,
      };
    }

    case "edit": {
      const prior = (workflow.sectionContent?.[sectionId] ?? "").trim();
      const next = transition.content.trim();
      const skipped = (workflow.skippedSectionIds ?? []).filter(
        (id) => id !== sectionId,
      );
      const completed = new Set(workflow.completedSectionIds ?? []);
      if (completed.has(sectionId) && normalizeMeaningful(prior, next)) {
        completed.delete(sectionId);
      }
      return {
        ...workflow,
        skippedSectionIds: skipped,
        completedSectionIds: [...completed],
        sectionContent: {
          ...workflow.sectionContent,
          [sectionId]: transition.content,
        },
        // Section edits invalidate Complete It Now output until reassembled.
        assembledOutput: workflow.assembledOutput
          ? { ...workflow.assembledOutput, stale: true }
          : workflow.assembledOutput,
      };
    }

    case "mark_needs_review":
      return {
        ...workflow,
        draftStatus: "ready",
        buildApproved: true,
      };

    default:
      return workflow;
  }
}
