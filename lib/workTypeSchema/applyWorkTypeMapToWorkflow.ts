/**
 * Shared hydrate: Work Type Full Workshop Map → CreateWorkflowState.
 * Domain bridges (Event Record fields, etc.) layer on top — they do not own map behavior.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { WorkTypeSchema } from "./types";
import { workshopMapToTemplateSections } from "./ensureMapSections";

export type ApplyWorkTypeMapOptions = {
  /** Override show-all; default true for Full Workshop Map (077). */
  showAllSections?: boolean;
  /** Prefer keeping an already-selected active section. */
  preserveActiveSection?: boolean;
  /** Content already known (section id → text). */
  sectionContent?: Record<string, string>;
  /** Focus subset; defaults to schema.defaultFocusSectionIds. */
  focusSectionIds?: string[];
  /** Preferred first focus when none set. */
  nextSectionId?: string | null;
  selectedTemplateId?: string | null;
};

/**
 * Apply map structure + focus defaults. Does not invent Event/SOP domain facts.
 */
export function applyWorkTypeMapToCreateWorkflow(
  workflow: CreateWorkflowState,
  schema: WorkTypeSchema,
  options?: ApplyWorkTypeMapOptions,
): CreateWorkflowState {
  const templateSections = workshopMapToTemplateSections(schema.sections);
  const focusIds = [
    ...(options?.focusSectionIds ?? schema.defaultFocusSectionIds ?? []),
  ];
  const sectionContent = {
    ...(workflow.sectionContent ?? {}),
    ...(options?.sectionContent ?? {}),
  };

  const preserve =
    options?.preserveActiveSection !== false &&
    Boolean(workflow.activeSectionId?.trim());

  return {
    ...workflow,
    templateSections,
    sectionContent,
    workspaceFirst: true,
    focusSectionIds: focusIds.length ? focusIds : workflow.focusSectionIds,
    showAllWorkspaceSections:
      options?.showAllSections ??
      workflow.showAllWorkspaceSections ??
      true,
    activeSectionId: preserve
      ? workflow.activeSectionId
      : (workflow.activeSectionId ??
        options?.nextSectionId ??
        focusIds[0] ??
        templateSections[0]?.id ??
        null),
    selectedTemplateId:
      options?.selectedTemplateId ??
      workflow.selectedTemplateId ??
      `${schema.workTypeId}-workspace`,
  };
}
