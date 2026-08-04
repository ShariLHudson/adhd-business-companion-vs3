/**
 * P0.27 — Explicit Chat sidebar navigation resets nested panels.
 */

import type { AppSection, SidebarNavId } from "./companionUi";

export type ChatNavigationResetTarget = {
  activeSection: "home";
  activeNav: "chat";
  overlay: null;
  workspacePanel: null;
  companionStandaloneSection: null;
  workspaceFirstSplit: false;
  chatLayoutMode: "split";
};

export function chatNavigationResetTarget(): ChatNavigationResetTarget {
  return {
    activeSection: "home",
    activeNav: "chat",
    overlay: null,
    workspacePanel: null,
    companionStandaloneSection: null,
    workspaceFirstSplit: false,
    chatLayoutMode: "split",
  };
}

/** Whether leaving this section for Chat should clear the beside-chat panel. */
export function chatNavClearsStandaloneSection(
  section: AppSection | null,
): boolean {
  if (!section) return false;
  return section !== "home";
}

export function chatNavClearsFullPageSection(activeSection: AppSection): boolean {
  return activeSection !== "home";
}

export function normalizeSidebarNavForChat(nav: SidebarNavId): SidebarNavId {
  return nav === "settings" ? nav : nav;
}
