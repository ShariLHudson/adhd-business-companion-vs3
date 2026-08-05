/**
 * Leaf section views for Create workflows.
 * Does not import createTemplates / createWorkspaceV2 (Project Homes cycle break).
 */

import type { CreateWorkflowState } from "./createWorkflowState";

export type WorkspaceV2SectionView = {
  optional?: boolean;
  id: string;
  label: string;
  content: string;
  skipped: boolean;
  /** Authored question from the Build Definition, when the template supplies one. */
  prompt?: string;
  /** Why this section matters, when the template supplies it. */
  why?: string;
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
    // Phase 1 — carry authoring through so Current Focus can prefer the
    // Build Definition's own question over a label-derived one.
    prompt: s.prompt,
    why: s.why,
  }));
}
