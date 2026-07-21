/**
 * Universal section runtime — one owner for active section + section ops.
 * Create and Projects both resolve through this helper over CreateWorkflowState.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { setWorkspaceV2ActiveSection } from "@/lib/createWorkspaceActiveSection";
import { applySectionLifecycleTransition } from "@/lib/createSectionLifecycle";
import { coalesceWorkflowWorkId } from "../identity/resolveWorkIdentity";
import {
  applyAssembledOutputToWorkflow,
  assembleWorkFromWorkflow,
  markAssembledOutputStale,
  validateWorkForAssembly,
} from "./assembleWork";
import type {
  AssembleWorkValidation,
  AssembledWorkOutput,
  WorkSection,
  WorkSectionStatus,
} from "./types";

function toStatus(
  workflow: CreateWorkflowState,
  id: string,
  content: string,
  skipped: boolean,
): WorkSectionStatus {
  if (skipped) return "skipped";
  if (workflow.completedSectionIds?.includes(id)) {
    // Reopened if active and completed list no longer contains — handled by lifecycle
    return "complete";
  }
  if (content.trim()) return "in_progress";
  return "not_started";
}

export function listOrderedWorkSections(
  workflow: CreateWorkflowState,
): WorkSection[] {
  return workspaceV2Sections(workflow).map((s, order) => ({
    id: s.id,
    title: s.label,
    order,
    content: s.content,
    status: toStatus(workflow, s.id, s.content, s.skipped),
    optional: s.optional,
  }));
}

export function resolveActiveSectionId(
  workflow: CreateWorkflowState,
): string | null {
  const active = workflow.activeSectionId?.trim();
  if (active) {
    const exists = workspaceV2Sections(workflow).some((s) => s.id === active);
    if (exists) return active;
  }
  // Legacy hydrate: first incomplete, else first registered
  const sections = workspaceV2Sections(workflow);
  const incomplete = sections.find((s) => !s.skipped && !s.content.trim());
  return incomplete?.id ?? sections[0]?.id ?? null;
}

export function getActiveWorkSection(
  workflow: CreateWorkflowState,
): WorkSection | null {
  const id = resolveActiveSectionId(workflow);
  if (!id) return null;
  return listOrderedWorkSections(workflow).find((s) => s.id === id) ?? null;
}

/** Reject invalid IDs safely — returns unchanged workflow. */
export function selectWorkSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const id = sectionId.trim();
  if (!id) return workflow;
  const sections = workspaceV2Sections(workflow);
  if (!sections.some((s) => s.id === id)) return workflow;

  const section = sections.find((s) => s.id === id)!;
  const typeLabel = resolvedTypeLabel(workflow) || "Creation";
  let next = setWorkspaceV2ActiveSection(
    {
      ...workflow,
      showAllWorkspaceSections: true,
      workspaceFirst: true,
      workspaceCurrentFocus: {
        title: section.label,
        reason: `Working on ${section.label}`,
        actionLabel: "Continue",
        sectionId: section.id,
        estimatedEffort: null,
        assetTypeId: null,
      },
    },
    id,
  );
  // Keep workspace phase oriented around the selected section
  next = {
    ...next,
    workspacePhaseLabel: `${section.label} · ${typeLabel}`,
  };
  return next;
}

export function updateWorkSectionContent(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
): CreateWorkflowState {
  const id = sectionId.trim();
  if (!id) return workflow;
  if (!workspaceV2Sections(workflow).some((s) => s.id === id)) return workflow;
  const edited = applySectionLifecycleTransition(workflow, id, {
    type: "edit",
    content,
  });
  return markAssembledOutputStale(edited);
}

export function completeWorkSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const id = sectionId.trim();
  if (!id) return workflow;
  return applySectionLifecycleTransition(workflow, id, {
    type: "complete_for_now",
  });
}

export function reopenWorkSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const id = sectionId.trim();
  if (!id) return workflow;
  return selectWorkSection(
    applySectionLifecycleTransition(workflow, id, { type: "reopen" }),
    id,
  );
}

export function resolveWorkIdFromWorkflow(
  workflow: CreateWorkflowState,
): string {
  return (
    coalesceWorkflowWorkId({
      sessionId: workflow.sessionId,
      eventRecordId: workflow.eventRecordId,
    }) ||
    workflow.sessionId?.trim() ||
    workflow.eventRecordId?.trim() ||
    ""
  );
}

export type CompleteItNowResult = {
  ok: boolean;
  workflow: CreateWorkflowState;
  assembled: AssembledWorkOutput | null;
  validation: AssembleWorkValidation;
};

/**
 * Complete It Now — assemble full piece (distinct from Complete Section).
 * Does not mutate section completion flags for the whole work until assembly succeeds.
 */
export function completeItNow(
  workflow: CreateWorkflowState,
): CompleteItNowResult {
  const validation = validateWorkForAssembly(workflow);
  if (!validation.ok) {
    return {
      ok: false,
      workflow,
      assembled: null,
      validation,
    };
  }
  const assembled = assembleWorkFromWorkflow(workflow, { markStale: false });
  const next = applyAssembledOutputToWorkflow(workflow, assembled);
  return {
    ok: true,
    workflow: next,
    assembled,
    validation,
  };
}

/** Facade matching the 098 UniversalSectionRuntime shape. */
export function createUniversalSectionRuntime(workflow: CreateWorkflowState) {
  const workId = resolveWorkIdFromWorkflow(workflow);
  const workType =
    resolvedTypeLabel(workflow) || workflow.selectedTypeLabel || "Creation";
  const orderedSections = listOrderedWorkSections(workflow);
  const activeSectionId = resolveActiveSectionId(workflow) ?? "";
  const activeSection =
    orderedSections.find((s) => s.id === activeSectionId) ?? orderedSections[0]!;

  return {
    workId,
    workType,
    orderedSections,
    activeSectionId,
    activeSection,
    selectSection: (sectionId: string) => selectWorkSection(workflow, sectionId),
    updateSectionContent: (sectionId: string, content: unknown) =>
      updateWorkSectionContent(workflow, sectionId, String(content ?? "")),
    saveSection: async (sectionId: string) => {
      // Persistence is owned by creationDurable via callers; runtime validates id.
      if (!orderedSections.some((s) => s.id === sectionId)) {
        throw new Error(`Unknown section: ${sectionId}`);
      }
    },
    completeSection: async (sectionId: string) =>
      completeWorkSection(workflow, sectionId),
    reopenSection: async (sectionId: string) =>
      reopenWorkSection(workflow, sectionId),
    assembleWork: async () => {
      const result = completeItNow(workflow);
      if (!result.ok || !result.assembled) {
        throw new Error(result.validation.message || "Assembly blocked");
      }
      return result.assembled;
    },
  };
}
