/**
 * Leaf section views for Create workflows.
 * Safe for creationRecord / registry — does not import createWorkspaceV2.
 */

import type { CreateWorkflowState } from "./createWorkflow";
import {
  resolveTemplateSections,
  type CreateTemplateSection,
} from "./createTemplates";

export type WorkspaceV2SectionView = CreateTemplateSection & {
  content: string;
  skipped: boolean;
};

export function workspaceV2Sections(
  workflow: CreateWorkflowState,
): WorkspaceV2SectionView[] {
  const sections = resolveTemplateSections(workflow) ?? [];
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  const content = workflow.sectionContent ?? {};
  return sections.map((s) => ({
    ...s,
    content: content[s.id] ?? "",
    skipped: skipped.has(s.id),
  }));
}
