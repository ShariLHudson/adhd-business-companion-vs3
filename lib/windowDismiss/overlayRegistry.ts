/**
 * Spark Estate overlay registry — shell for "one temporary experience at a time".
 *
 * Records *what kind* of surface each open window is, so the Estate can tell a
 * temporary overlay apart from a primary workspace. Open state still lives in
 * each feature; this registry only observes it and answers questions about it.
 *
 * Deliberately layered on top of the existing dismiss stack rather than
 * duplicating it — `useDismissibleWindow` owns Escape / outside-click and the
 * topmost-layer rule; this module adds identity, classification, and
 * exclusivity.
 *
 * Exclusivity is opt-in per caller (`openExclusiveOverlay`). Nothing is closed
 * implicitly by registering, so adopting the registry is behaviour-neutral
 * until a surface explicitly asks for exclusive focus.
 *
 * @see lib/windowDismiss/dismissPolicy.ts
 * @see lib/unsavedWorkGuard.ts
 */

import { isUnsavedWorkGuardDirty } from "@/lib/unsavedWorkGuard";

/**
 * What a surface *is* — decides whether opening something else may close it.
 *
 * - `modal`     temporary, blocking, one at a time (Spark Estate Guide, pickers)
 * - `sheet`     drawer sliding from an edge (Settings sheet, Plan My Day drawer)
 * - `popover`   menu or popover anchored to a trigger (Estate Sounds, room menu)
 * - `dialog`    confirmation needing an explicit decision — may stack, never auto-closed
 * - `workspace` primary destination, not a temporary window — never auto-closed
 * - `utility`   persistent chrome that coexists with everything — never auto-closed
 */
export type OverlayKind =
  | "modal"
  | "sheet"
  | "popover"
  | "dialog"
  | "workspace"
  | "utility";

/** Kinds that a newly opened temporary overlay may replace. */
const TEMPORARY_KINDS: ReadonlySet<OverlayKind> = new Set<OverlayKind>([
  "modal",
  "sheet",
  "popover",
]);

export function isTemporaryOverlayKind(kind: OverlayKind): boolean {
  return TEMPORARY_KINDS.has(kind);
}

export type OverlayRegistration = {
  /** Stable, unique id. Also used to find this overlay's unsaved-work guard. */
  id: string;
  kind: OverlayKind;
  /** Ask this overlay to close itself. Return true when it actually closed. */
  requestDismiss: () => boolean;
  /**
   * Optional local dirty check. When omitted the registry falls back to the
   * unsaved-work guard registered under the same id.
   */
  isDirty?: () => boolean;
};

export type OverlaySnapshot = {
  id: string;
  kind: OverlayKind;
};

/** Ordered — the last entry is topmost. */
const overlays: OverlayRegistration[] = [];

function isDirtyOverlay(entry: OverlayRegistration): boolean {
  try {
    if (entry.isDirty) return entry.isDirty();
  } catch {
    // A surface that cannot answer is treated as clean — never trap the member.
    return false;
  }
  // Falls back to Step 1.2's keyed guard registry, matched on overlay id.
  return isUnsavedWorkGuardDirty(entry.id);
}

/**
 * Register an open overlay. Returns an unregister function — call it on close
 * or unmount. Registering never closes anything on its own.
 */
export function registerOverlay(entry: OverlayRegistration): () => void {
  // Same id re-registering: drop the stale entry so it cannot be double-listed.
  const existing = overlays.findIndex((o) => o.id === entry.id);
  if (existing >= 0) overlays.splice(existing, 1);

  overlays.push(entry);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    // Remove by identity so a stale unregister cannot drop a newer overlay
    // that happens to share this id.
    const index = overlays.indexOf(entry);
    if (index >= 0) overlays.splice(index, 1);
  };
}

export function overlayCount(): number {
  return overlays.length;
}

export function listOpenOverlays(): OverlaySnapshot[] {
  return overlays.map((o) => ({ id: o.id, kind: o.kind }));
}

export function topmostOverlay(): OverlaySnapshot | null {
  const top = overlays[overlays.length - 1];
  return top ? { id: top.id, kind: top.kind } : null;
}

export function isTopmostOverlay(id: string): boolean {
  return topmostOverlay()?.id === id;
}

/** Is this exact overlay holding unsaved work right now? */
export function isOverlayDirty(id: string): boolean {
  const entry = overlays.find((o) => o.id === id);
  return entry ? isDirtyOverlay(entry) : false;
}

export type ExclusiveOpenResult = {
  /** Overlays that were asked to dismiss and did. */
  dismissed: string[];
  /** Overlays deliberately left open, with the reason. */
  kept: { id: string; reason: "dirty" | "not-temporary" | "refused" }[];
};

/**
 * Claim exclusive focus for `id`: ask every *other* temporary overlay to close.
 *
 * Never touches confirmation dialogs, primary workspaces, or persistent
 * utilities — those are not temporary windows. Never closes an overlay holding
 * unsaved work, so a draft can never be discarded merely because something else
 * opened; that overlay stays open beneath and the new one stacks on top.
 *
 * An overlay whose `requestDismiss` returns false (an active upload, operation,
 * or an explicit-decision block) is also kept.
 */
export function openExclusiveOverlay(id: string): ExclusiveOpenResult {
  const result: ExclusiveOpenResult = { dismissed: [], kept: [] };

  // Snapshot first — requestDismiss will mutate the array as overlays close.
  for (const entry of [...overlays]) {
    if (entry.id === id) continue;

    if (!isTemporaryOverlayKind(entry.kind)) {
      result.kept.push({ id: entry.id, reason: "not-temporary" });
      continue;
    }
    if (isDirtyOverlay(entry)) {
      result.kept.push({ id: entry.id, reason: "dirty" });
      continue;
    }

    let closed = false;
    try {
      closed = entry.requestDismiss();
    } catch {
      closed = false;
    }
    if (closed) result.dismissed.push(entry.id);
    else result.kept.push({ id: entry.id, reason: "refused" });
  }

  return result;
}

/** Test helper — clears every registration. */
export function __resetOverlayRegistryForTests(): void {
  overlays.length = 0;
}
