/**
 * P0.16.1 — single source of truth for Create panel open + visibility checks.
 * 066 — Create opens as single-experience workspace (never permanent Chat|Create split).
 */

import type { AppSection } from "./companionUi";
import { resolveCreationWorkspaceLayoutMode } from "./singleExperienceWorkspace";
import type { ChatLayoutMode } from "./workspaceNav";
import { shouldBlockWorkspaceOpenForPhase1 } from "./phase1Onboarding";

export const CREATE_PANEL_SECTION = "content-generator" as const;

export type CreatePanelUiState = {
  workspacePanel: AppSection | null;
  activeSection: AppSection;
  chatLayoutMode: ChatLayoutMode;
};

export type HardNavCreateLogSnapshot = {
  matched: boolean;
  command: string;
  target: typeof CREATE_PANEL_SECTION;
  beforeWorkspacePanel: AppSection | null;
  beforeActiveSection: AppSection;
  calledOpenSectionBesideChatCore?: boolean;
  calledRequestCreateOpen?: boolean;
  requestCreateOpenResult?: boolean;
  afterWorkspacePanel: AppSection | null;
  afterActiveSection: AppSection;
  rightPanelVisible: boolean;
};

/** Dev-only trace for hard-nav Create opens. */
export function logHardNavCreate(snapshot: HardNavCreateLogSnapshot): void {
  if (typeof console === "undefined") return;
  console.log(
    [
      "[hard-nav]",
      `matched: ${snapshot.matched}`,
      `command: ${snapshot.command}`,
      `target: ${snapshot.target}`,
      `before workspacePanel: ${snapshot.beforeWorkspacePanel ?? "null"}`,
      `before active section: ${snapshot.beforeActiveSection}`,
      `called openSectionBesideChatCore: ${snapshot.calledOpenSectionBesideChatCore ?? false}`,
      `called requestCreateOpen: ${snapshot.calledRequestCreateOpen ?? false}`,
      snapshot.requestCreateOpenResult !== undefined
        ? `requestCreateOpen result: ${snapshot.requestCreateOpenResult}`
        : null,
      `after workspacePanel: ${snapshot.afterWorkspacePanel ?? "null"}`,
      `after active section: ${snapshot.afterActiveSection}`,
      `right panel visible: ${snapshot.rightPanelVisible}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export function isCreatePanelOpen(state: CreatePanelUiState): boolean {
  return state.workspacePanel === CREATE_PANEL_SECTION;
}

export function isRightPanelVisible(state: CreatePanelUiState): boolean {
  return state.workspacePanel === CREATE_PANEL_SECTION;
}

export function isChatOnlyLayout(state: CreatePanelUiState): boolean {
  return state.workspacePanel !== CREATE_PANEL_SECTION;
}

/**
 * Pure model of panel state after a successful user-initiated Create open.
 * Integration tests use this to verify Phase 1 no longer blocks explicit opens.
 */
export function applyOpenCreateWorkspaceState(
  state: CreatePanelUiState,
  opts: { userInitiated: boolean },
): CreatePanelUiState {
  if (shouldBlockWorkspaceOpenForPhase1({ userInitiated: opts.userInitiated })) {
    return state;
  }
  return {
    workspacePanel: CREATE_PANEL_SECTION,
    activeSection: "home",
    chatLayoutMode: resolveCreationWorkspaceLayoutMode(),
  };
}
