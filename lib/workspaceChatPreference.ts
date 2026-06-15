import type { ChatLayoutMode } from "./workspaceNav";

const STORAGE_KEY = "companion-workspace-chat-layout";

/** Default: workspace only — chat is optional, never forced. */
export const DEFAULT_CHAT_LAYOUT_MODE: ChatLayoutMode = "workspace-focus";

export function loadWorkspaceChatLayoutPreference(): ChatLayoutMode {
  if (typeof window === "undefined") return DEFAULT_CHAT_LAYOUT_MODE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "split" || stored === "workspace-focus") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_CHAT_LAYOUT_MODE;
}

export function saveWorkspaceChatLayoutPreference(mode: ChatLayoutMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
