/**
 * Chat destination — highest navigation priority.
 * Sidebar "Chat" must always return to the main conversation immediately.
 */

export const CHAT_NAV_PRIORITY = "highest" as const;

export type ChatNavigationIntent = {
  closeWorkspacePanel: boolean;
  restoreSplitLayout: boolean;
  clearStandaloneSection: boolean;
  clearGuideBeside: boolean;
  clearWelcomeRoom: boolean;
  clearArrivalImmersion: boolean;
  dismissOverlay: boolean;
  resetPanelBackStack: boolean;
  activeSection: "home";
  activeNav: "chat";
};

/** Canonical reset applied when navigating to Chat. */
export const CHAT_NAVIGATION_INTENT: ChatNavigationIntent = {
  closeWorkspacePanel: true,
  restoreSplitLayout: true,
  clearStandaloneSection: true,
  clearGuideBeside: true,
  clearWelcomeRoom: true,
  clearArrivalImmersion: true,
  dismissOverlay: true,
  resetPanelBackStack: true,
  activeSection: "home",
  activeNav: "chat",
};
