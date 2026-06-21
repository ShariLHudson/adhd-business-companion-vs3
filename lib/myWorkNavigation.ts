import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";

/** Sub-areas opened from the My Work hub card grid. */
export const MY_WORK_SUB_SECTIONS: AppSection[] = [
  "projects",
  "saved-work",
  "templates-library",
  "snippets",
  "playbook",
];

/** Workspace panels that belong to the My Work family (hub + sub-areas). */
export const MY_WORK_PANEL_SECTIONS: AppSection[] = [
  "my-work",
  ...MY_WORK_SUB_SECTIONS,
];

export function isMyWorkPanelSection(
  section: AppSection | null | undefined,
): boolean {
  return section != null && MY_WORK_PANEL_SECTIONS.includes(section);
}

export function isMyWorkSubSection(
  section: AppSection | null | undefined,
): boolean {
  return section != null && MY_WORK_SUB_SECTIONS.includes(section);
}

export function myWorkPanelBackLabel(
  fromPanel: AppSection | null,
  activeSection: AppSection,
): string | null {
  if (fromPanel === "my-work") return "My Work";
  if (fromPanel) return workspaceTitle(fromPanel);
  if (activeSection === "home") return "Chat";
  return workspaceTitle(activeSection);
}
