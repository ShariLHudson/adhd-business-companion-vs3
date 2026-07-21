/**
 * Assemble the finished piece from ordered Work sections (schema / template order).
 * Preserves Work ID; never invents a second master identity.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { coalesceWorkflowWorkId } from "../identity/resolveWorkIdentity";
import type {
  AssembleWorkValidation,
  AssembledWorkOutput,
  WorkSectionStatus,
} from "./types";

function sectionStatus(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
  skipped: boolean,
): WorkSectionStatus {
  if (skipped) return "skipped";
  if (workflow.completedSectionIds?.includes(sectionId)) return "complete";
  if (content.trim()) return "in_progress";
  return "not_started";
}

export function validateWorkForAssembly(
  workflow: CreateWorkflowState,
): AssembleWorkValidation {
  const sections = workspaceV2Sections(workflow).filter((s) => !s.skipped);
  const hasAny = sections.some((s) => s.content.trim());
  if (!hasAny) {
    return {
      ok: false,
      missingRequiredSectionIds: sections.map((s) => s.id),
      message:
        "Add content to at least one section before completing the full piece.",
    };
  }

  // Short maps (e.g. Marketing Campaign): require every included non-optional section.
  // Long maps (e.g. Event Plan): require Current Focus / focus-set sections only.
  const focusIds = workflow.focusSectionIds ?? [];
  const required =
    focusIds.length > 0
      ? sections.filter((s) => focusIds.includes(s.id) && !s.optional)
      : sections.length <= 8
        ? sections.filter((s) => !s.optional)
        : [];

  const missing = required.filter((s) => !s.content.trim()).map((s) => s.id);
  if (missing.length > 0) {
    const labels = sections
      .filter((s) => missing.includes(s.id))
      .map((s) => s.label)
      .join(", ");
    return {
      ok: false,
      missingRequiredSectionIds: missing,
      message: `A few sections still need something before we can assemble the full piece: ${labels}.`,
    };
  }
  return { ok: true, missingRequiredSectionIds: [], message: null };
}

/**
 * Deterministic assembly — headings + latest saved content in map order.
 */
export function assembleWorkFromWorkflow(
  workflow: CreateWorkflowState,
  options?: { markStale?: boolean },
): AssembledWorkOutput {
  const workType =
    resolvedTypeLabel(workflow) || workflow.selectedTypeLabel || "Creation";
  const workId =
    coalesceWorkflowWorkId({
      sessionId: workflow.sessionId,
      eventRecordId: workflow.eventRecordId,
    }) ||
    workflow.sessionId?.trim() ||
    workflow.eventRecordId?.trim() ||
    "unknown";
  const title =
    workflow.selectedTemplateName?.trim() ||
    workType;
  const sections = workspaceV2Sections(workflow);
  const provenance = sections
    .filter((s) => !s.skipped)
    .map((s) => {
      const status = sectionStatus(workflow, s.id, s.content, s.skipped);
      return {
        sectionId: s.id,
        title: s.label,
        content: s.content.trim(),
        status,
        versionCompletedAt:
          workflow.completedSectionVersions?.[s.id]?.completedAt ?? null,
      };
    });

  const bodyParts = [
    title,
    "",
    ...provenance.flatMap((p) => [
      p.title,
      p.content || "[No content yet]",
      "",
    ]),
  ];

  return {
    workId,
    workType,
    title,
    body: bodyParts.join("\n").trim() + "\n",
    assembledAt: new Date().toISOString(),
    stale: options?.markStale ?? false,
    sections: provenance,
  };
}

/**
 * Apply assembled output onto the workflow (same Work ID).
 * Sets draftContent to the assembled body for display / Projects.
 */
export function applyAssembledOutputToWorkflow(
  workflow: CreateWorkflowState,
  assembled: AssembledWorkOutput,
): CreateWorkflowState {
  return {
    ...workflow,
    draftContent: assembled.body,
    draftStatus: "ready",
    buildApproved: true,
    readinessConfirmed: true,
    workspacePhaseLabel: "Complete piece ready",
    assembledOutput: {
      workId: assembled.workId,
      assembledAt: assembled.assembledAt,
      stale: assembled.stale,
      body: assembled.body,
      sectionIds: assembled.sections.map((s) => s.sectionId),
    },
  };
}

/** After a section edit, mark assembled output stale when present. */
export function markAssembledOutputStale(
  workflow: CreateWorkflowState,
): CreateWorkflowState {
  if (!workflow.assembledOutput) return workflow;
  return {
    ...workflow,
    assembledOutput: {
      ...workflow.assembledOutput,
      stale: true,
    },
  };
}
