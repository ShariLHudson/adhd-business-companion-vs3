/**
 * Leaf section views for Create workflows.
 * Does not import createTemplates / createWorkspaceV2 (Project Homes cycle break).
 */

import type { CreateWorkflowState } from "./createWorkflowState";

export type WorkspaceV2SectionView = {
  id: string;
  label: string;
  content: string;
  skipped: boolean;
};

export function workspaceV2Sections(
  workflow: CreateWorkflowState,
): WorkspaceV2SectionView[] {
  const sections = workflow.templateSections ?? [];
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  const content = workflow.sectionContent ?? {};
  return sections.map((s) => ({
    id: s.id,
    label: s.label,
    content: content[s.id] ?? "",
    skipped: skipped.has(s.id),
  }));
}
