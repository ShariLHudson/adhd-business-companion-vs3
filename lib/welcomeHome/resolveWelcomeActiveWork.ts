/**
 * 073/074 — Welcome Home reads the canonical Active Workspace Registry.
 */

import {
  buildWorkspaceIdentityCard,
  getMostRecentActiveWorkspace,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  readLastActiveWorkspaceId,
  getActiveWorkspace,
  type WorkspaceIdentityCard,
} from "@/lib/activeWorkspaceRegistry";

export type WelcomeActiveWorkCard = WorkspaceIdentityCard & {
  continueLabel: "Continue";
};

/**
 * Active work for Welcome Home — never React memory alone.
 */
export function resolveWelcomeActiveWork(): WelcomeActiveWorkCard | null {
  hydrateActiveWorkspaceRegistryFromRuntimeRecords();
  const lastId = readLastActiveWorkspaceId();
  const entry =
    (lastId ? getActiveWorkspace(lastId) : null) ??
    getMostRecentActiveWorkspace() ??
    listActiveWorkspaces()[0] ??
    null;
  if (!entry) return null;
  const card = buildWorkspaceIdentityCard(entry);
  return {
    ...card,
    continueLabel: "Continue",
  };
}
