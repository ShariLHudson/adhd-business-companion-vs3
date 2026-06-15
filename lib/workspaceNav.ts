// Split-view navigation — which sections open beside chat vs full screen.
// Rule: chat is always available but never auto-opens; user chooses "Work With Shari".
// Only ONE workspace is active on the right when split. Opening a new menu item
// replaces the current workspace — never stacks.

import type { AppSection } from "./companionUi";
import { supportsWorkspace } from "./workspaceMode";

export type ChatLayoutMode = "split" | "workspace-focus";

export function isSplitWorkspaceSection(section: AppSection): boolean {
  return supportsWorkspace(section);
}

/** Nav target should open/replace the right workspace pane, not a full-page view. */
export function shouldOpenBesideChat(section: AppSection): boolean {
  return supportsWorkspace(section);
}
