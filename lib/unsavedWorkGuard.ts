/**
 * Lightweight leave guard for member-facing forms.
 * Screens register a confirm callback while dirty; navigations / dismiss check before leaving.
 */

type LeaveConfirm = () => boolean;

let activeGuard: LeaveConfirm | null = null;

/** Register or clear the current unsaved-work confirm callback. */
export function setUnsavedWorkGuard(guard: LeaveConfirm | null): void {
  activeGuard = guard;
}

/** True when a screen has registered an unsaved-work confirm callback. */
export function hasUnsavedWorkGuard(): boolean {
  return activeGuard !== null;
}

/**
 * Returns true when navigation / dismiss may proceed.
 * If a guard is active, it must return true (typically after confirm).
 */
export function confirmLeaveUnsavedWork(): boolean {
  if (!activeGuard) return true;
  try {
    return activeGuard();
  } catch {
    return true;
  }
}
