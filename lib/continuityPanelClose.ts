/**
 * Continuity Phase 1 — hide vs discard panel close semantics.
 */

export type PanelCloseMode = "hide" | "discard";

/** Hide keeps local persistence; discard clears resumable session storage. */
export function shouldClearPersistenceOnPanelClose(mode: PanelCloseMode): boolean {
  return mode === "discard";
}

export function shouldPreserveCreateOnPanelClose(mode: PanelCloseMode): boolean {
  return mode === "hide";
}

export function shouldClearWorkspaceSessionOnPanelClose(
  mode: PanelCloseMode,
): boolean {
  return mode === "discard";
}
