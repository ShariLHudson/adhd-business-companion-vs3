import type { AppSection } from "./companionUi";
import {
  WORKSPACE_EMOJI,
  supportsWorkspace,
  workspaceAreaTitle,
} from "./workspaceMode";

/** Areas users can open beside Chat — shown in empty-state suggestions. */
export const SPLIT_BESIDE_SUGGESTIONS: readonly {
  section: AppSection;
  label: string;
}[] = [
  { section: "projects", label: "Projects" },
  { section: "my-work", label: "Other" },
  { section: "visual-focus", label: "Visual Thinking" },
  { section: "growth", label: "Growth" },
  { section: "templates-library", label: "Templates" },
  { section: "playbook", label: "Strategies" },
] as const;

export { workspaceAreaTitle };

export function workspaceAreaEmoji(section: AppSection): string {
  return WORKSPACE_EMOJI[section] ?? "🛠";
}

export function splitBesideAreaDescription(section: AppSection): string {
  const title = workspaceAreaTitle(section);
  if (supportsWorkspace(section)) {
    return `${title} is open beside your conversation. Work here while you talk with the Companion on the left.`;
  }
  return `${title} works best on its own screen. Open it from the menu when you are ready — chat stays available when you return.`;
}
