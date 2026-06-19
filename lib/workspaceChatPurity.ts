/**
 * Trust Sprint #5 — conversation purity for workspace-scoped chat.
 */

import type { AppSection } from "./companionUi";

export type WorkspaceChatScope = {
  section: AppSection;
};

export type WorkspaceChatLine = {
  role: "user" | "assistant" | "system";
  content: string;
};

/** Workspaces that start a fresh chat thread on open (Phase 1). */
export const PURITY_SCOPED_SECTIONS: ReadonlySet<AppSection> = new Set([
  "content-generator",
  "projects",
  "client-avatars",
  "templates-library",
  "snippets",
  "decision-compass",
]);

export function isPurityScopedSection(section: AppSection): boolean {
  return PURITY_SCOPED_SECTIONS.has(section);
}

/** Short workspace openers — no coaching overload. */
export function workspaceOpenerForSection(section: AppSection): string | null {
  switch (section) {
    case "content-generator":
      return "What would you like to create?";
    case "projects":
      return "What are we working on today?";
    case "client-avatars":
      return "Let's build your client avatar together.";
    case "templates-library":
      return "What would you like to do with this template?";
    case "snippets":
      return "How would you like to use or improve this snippet?";
    case "decision-compass":
      return "What decision are you working through?";
    default:
      return null;
  }
}

export function resolveWorkspaceOpener(
  section: AppSection,
  custom?: string | null,
): string {
  return (
    custom?.trim() ||
    workspaceOpenerForSection(section) ||
    "What would you like to work on here?"
  );
}

/** Fresh thread after beginWorkspaceChat. */
export function freshWorkspaceChatMessages(opener: string): WorkspaceChatLine[] {
  return [{ role: "assistant", content: opener }];
}

/**
 * Messages sent to /api/companion-chat.
 * When a purity scope is active, only the current in-memory thread is sent
 * (beginWorkspaceChat replaces the buffer on workspace open).
 */
export function messagesForApi(
  messages: WorkspaceChatLine[],
  scope: WorkspaceChatScope | null,
): WorkspaceChatLine[] {
  const apiLines = messages.filter(
    (m): m is WorkspaceChatLine & { role: "user" | "assistant" } =>
      m.role === "user" || m.role === "assistant",
  );

  if (!scope || !isPurityScopedSection(scope.section)) {
    return apiLines;
  }

  return apiLines;
}
