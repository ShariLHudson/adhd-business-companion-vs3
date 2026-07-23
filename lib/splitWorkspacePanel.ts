import type { AppSection } from "./companionUi";
import { SPLIT_PANEL_CONVERSATION_HINT } from "./conversationFirstLanguage";
import { workspaceObjectId, supportsWorkspace, workspaceAreaTitle } from "./workspaceMode";
/** Areas users can open — shown in empty-state suggestions. */
export const SPLIT_BESIDE_SUGGESTIONS: readonly {
  section: AppSection;
  label: string;
}[] = [
  { section: "projects", label: "Projects" },
  { section: "my-work", label: "Other" },
  { section: "visual-focus", label: "Visual Thinking" },
  { section: "the-gallery", label: "The Gallery" },
  { section: "templates-library", label: "Templates" },
  { section: "playbook", label: "Strategy Chamber" },
] as const;

export { workspaceAreaTitle };

export function workspaceAreaObjectId(section: AppSection): string {
  return workspaceObjectId(section);
}

/** @deprecated Use workspaceAreaObjectId */
export function workspaceAreaEmoji(_section: AppSection): string {
  return "";
}
export function splitBesideAreaDescription(section: AppSection): string {
  const title = workspaceAreaTitle(section);
  if (supportsWorkspace(section)) {
    // 066/067 — workspace is the experience; never promise permanent split UI
    return `${title} is ready. We can work here together.`;
  }
  return `${title} ${SPLIT_PANEL_CONVERSATION_HINT}`;
}
