/**
 * Estate-wide unsaved-work guards — keyed registry.
 *
 * Previously a single module-level slot: the second screen to register
 * silently replaced the first, so one of them lost its protection entirely
 * and nesting was impossible. Screens now register their own guard and get
 * an unregister function back.
 *
 * Selection when leaving is requested: the **topmost dirty guard** — the most
 * recently registered guard that currently reports unsaved work. This mirrors
 * the window dismiss stack (the newest layer is the one being dismissed), and
 * is behaviour-identical to the old slot when only one guard exists.
 *
 * @see lib/windowDismiss/dismissPolicy.ts
 */

export type UnsavedWorkGuardInput = {
  /** Stable id for diagnostics. Generated when omitted. */
  id?: string;
  /**
   * True while this screen holds unsaved work.
   * Omit when registration itself means "dirty" — the guard is then always
   * considered dirty for as long as it stays registered.
   */
  isDirty?: () => boolean;
  /** Ask the member. Return true to allow leaving (discard the work). */
  confirmLeave: () => boolean;
};

type RegisteredGuard = {
  id: string;
  isDirty: () => boolean;
  confirmLeave: () => boolean;
};

/** Ordered registration stack — the last entry is topmost. */
const guards: RegisteredGuard[] = [];

let idSeq = 0;
function nextGuardId(): string {
  idSeq += 1;
  return `unsaved-guard-${idSeq}`;
}

function isGuardDirty(guard: RegisteredGuard): boolean {
  try {
    return guard.isDirty();
  } catch {
    // A guard that cannot answer is treated as clean — never trap the member.
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * beforeunload
 * ------------------------------------------------------------------ */

let beforeUnloadAttached = false;

function onBeforeUnload(event: BeforeUnloadEvent): void {
  // Dirtiness is read live, so a guard going clean needs no re-subscription.
  if (!hasUnsavedWorkGuard()) return;
  event.preventDefault();
  // Legacy browsers require a non-empty returnValue to show the prompt.
  event.returnValue = "";
}

/** Listen only while at least one guard is registered. */
function syncBeforeUnload(): void {
  if (typeof window === "undefined") return;
  const shouldListen = guards.length > 0;
  if (shouldListen && !beforeUnloadAttached) {
    window.addEventListener("beforeunload", onBeforeUnload);
    beforeUnloadAttached = true;
    return;
  }
  if (!shouldListen && beforeUnloadAttached) {
    window.removeEventListener("beforeunload", onBeforeUnload);
    beforeUnloadAttached = false;
  }
}

/* ------------------------------------------------------------------ *
 * Registration
 * ------------------------------------------------------------------ */

/**
 * Register unsaved-work protection for one screen.
 * Returns an unregister function — call it on unmount or when work is saved.
 *
 * Registering never removes another screen's guard. Re-registering the same
 * id replaces that entry and moves it to the top.
 */
export function registerUnsavedWorkGuard(
  input: UnsavedWorkGuardInput,
): () => void {
  const guard: RegisteredGuard = {
    id: input.id ?? nextGuardId(),
    isDirty: input.isDirty ?? (() => true),
    confirmLeave: input.confirmLeave,
  };

  // Same id re-registering: drop the stale entry, then push so it sits on top.
  const existing = guards.findIndex((g) => g.id === guard.id);
  if (existing >= 0) guards.splice(existing, 1);

  guards.push(guard);
  syncBeforeUnload();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    // Remove by identity, so a stale unregister cannot drop a newer guard
    // that happens to share this id.
    const index = guards.indexOf(guard);
    if (index >= 0) guards.splice(index, 1);
    syncBeforeUnload();
  };
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/** True when any registered guard currently reports unsaved work. */
export function hasUnsavedWorkGuard(): boolean {
  return guards.some(isGuardDirty);
}

/** Most recently registered guard that is currently dirty, if any. */
export function topmostDirtyUnsavedWorkGuard(): RegisteredGuard | null {
  for (let i = guards.length - 1; i >= 0; i -= 1) {
    const guard = guards[i]!;
    if (isGuardDirty(guard)) return guard;
  }
  return null;
}

/** Number of registered guards, dirty or not. Diagnostics and tests. */
export function unsavedWorkGuardCount(): number {
  return guards.length;
}

/**
 * True when the guard registered under this exact id is currently dirty.
 * Lets a caller ask about one specific window instead of the whole Estate —
 * used by the overlay registry so exclusivity never closes a dirty overlay.
 */
export function isUnsavedWorkGuardDirty(id: string): boolean {
  const guard = guards.find((g) => g.id === id);
  return guard ? isGuardDirty(guard) : false;
}

/**
 * Returns true when navigation / dismiss may proceed.
 * Asks the topmost dirty guard; clean or absent guards never block.
 */
export function confirmLeaveUnsavedWork(): boolean {
  const guard = topmostDirtyUnsavedWorkGuard();
  if (!guard) return true;
  try {
    return guard.confirmLeave();
  } catch {
    // Never trap the member behind a throwing confirm.
    return true;
  }
}

/** Test helper — clears every guard and detaches beforeunload. */
export function __resetUnsavedWorkGuardsForTests(): void {
  guards.length = 0;
  syncBeforeUnload();
}
