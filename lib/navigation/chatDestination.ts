/**
 * Chat destination — highest navigation priority.
 * Sidebar "Chat" and "Back to Chat" must return to the active conversation immediately.
 *
 * Back to Chat ≠ Back to Estate / Welcome Home / Visit Another Room.
 * Never reuse room-navigation fallbacks for this destination.
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
  /** Skip companionReturnSection / guide-return room restores. */
  skipSectionRestore: boolean;
  /** Everyday conversation shell — never Welcome Home cinematic / lobby. */
  preferEverydayConversation: boolean;
  /** Do not sync recognition place to welcome-home (avoids lobby + dark curtain). */
  suppressWelcomeHomePlaceSync: boolean;
  /** Keep Clear My Mind session paused in storage — do not discard thoughts. */
  preserveClearMyMindSession: boolean;
  activeSection: "home";
  activeNav: "chat";
};

/** Canonical reset applied when navigating to Chat / Back to Chat. */
export const CHAT_NAVIGATION_INTENT: ChatNavigationIntent = {
  closeWorkspacePanel: true,
  restoreSplitLayout: true,
  clearStandaloneSection: true,
  clearGuideBeside: true,
  clearWelcomeRoom: true,
  clearArrivalImmersion: true,
  dismissOverlay: true,
  resetPanelBackStack: true,
  skipSectionRestore: true,
  preferEverydayConversation: true,
  suppressWelcomeHomePlaceSync: true,
  preserveClearMyMindSession: true,
  activeSection: "home",
  activeNav: "chat",
};
