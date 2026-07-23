/**
 * 066 — Creation Workspace layout: never permanent Chat | Workspace split.
 */

import type { ChatLayoutMode } from "@/lib/workspaceNav";
import { SINGLE_EXPERIENCE_WORKSPACE_RULE } from "./types";

/** Sections that must open as a single living experience (not dual pane). */
export const SINGLE_EXPERIENCE_CREATION_SECTIONS = [
  "content-generator",
  "create",
] as const;

export type SingleExperienceCreationSection =
  (typeof SINGLE_EXPERIENCE_CREATION_SECTIONS)[number];

export function isSingleExperienceCreationSection(
  section: string | null | undefined,
): boolean {
  if (!section) return false;
  return (SINGLE_EXPERIENCE_CREATION_SECTIONS as readonly string[]).includes(
    section,
  );
}

/**
 * Layout mode when opening a Creation Workspace.
 * Always workspace-focus — never "split".
 */
export function resolveCreationWorkspaceLayoutMode(): ChatLayoutMode {
  return SINGLE_EXPERIENCE_WORKSPACE_RULE.creationLayoutMode;
}

/**
 * If this open is a Creation Workspace, force single-experience layout.
 * Otherwise return the proposed mode unchanged (other panels may still use split until migrated).
 */
export function coerceLayoutForWorkspaceOpen(
  section: string | null | undefined,
  proposed: ChatLayoutMode,
): ChatLayoutMode {
  if (isSingleExperienceCreationSection(section)) {
    return resolveCreationWorkspaceLayoutMode();
  }
  return proposed;
}

/** True when Create is still mounted as legacy dual-pane split. */
export function isLegacyCreateSplitLayout(input: {
  workspacePanel: string | null;
  chatLayoutMode: ChatLayoutMode;
}): boolean {
  return (
    input.workspacePanel === "content-generator" &&
    input.chatLayoutMode === "split"
  );
}
