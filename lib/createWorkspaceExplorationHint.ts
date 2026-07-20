/**
 * Leaf Create V2 exploration hint — no createWorkspaceV2 / createTemplates imports.
 */

import type { CreateWorkflowState } from "./createWorkflowState";
import { userFacingCreateTypeLabel } from "./createTypePickers";

export function formatCreateWorkspaceV2ExplorationHint(
  session: { typeLabel: string | null; workflow: CreateWorkflowState },
  userText: string,
  sectionLabel?: string | null,
): string {
  const type = session.typeLabel ?? "content";
  const display = userFacingCreateTypeLabel(type) ?? type;
  const sections = session.workflow.templateSections ?? [];
  const active = session.workflow.activeSectionId
    ? sections.find((s) => s.id === session.workflow.activeSectionId)?.label
    : null;
  const focus = sectionLabel ?? active;

  return [
    `CREATE V2 SUPPORT (mandatory — overrides approval / auto-apply hints):`,
    `- Active: **${display}** living workspace (066). User types in section boxes; conversation supports the work, not a second pane.`,
    focus ? `- They are brainstorming **${focus}**.` : "",
    userText.trim() ? `- User said: "${userText.trim()}"` : "",
    "- Give ideas, examples, research, suggestions, or feedback only.",
    "- Do not ask permission to save, approve, or apply chat text to the workspace.",
    `- End with copy guidance, e.g.: Here are some ideas for **${focus ?? "this section"}**. Copy any parts you like into that box.`,
    "- Never use fill tags or approval-style buttons in chat.",
  ]
    .filter(Boolean)
    .join("\n");
}
