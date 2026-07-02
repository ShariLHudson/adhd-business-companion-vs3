/**
 * The sidebar / login click is a user gesture — unlock Welcome audio on the next page.
 * Persisted in sessionStorage so hard navigation after sign-in keeps the unlock intent.
 */

const GESTURE_PENDING_KEY = "spark-welcome-audio-gesture-pending";

let pendingGestureUnlock = false;

function readPendingFromStorage(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(GESTURE_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

function writePendingToStorage(pending: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (pending) {
      sessionStorage.setItem(GESTURE_PENDING_KEY, "1");
    } else {
      sessionStorage.removeItem(GESTURE_PENDING_KEY);
    }
  } catch {
    /* quota */
  }
}

if (typeof window !== "undefined") {
  pendingGestureUnlock = readPendingFromStorage();
}

export function markWelcomeRoomOpenedWithGesture(): void {
  pendingGestureUnlock = true;
  writePendingToStorage(true);
}

/** True while we still owe an automatic unlock attempt on the audio manager. */
export function hasPendingWelcomeRoomGestureUnlock(): boolean {
  return pendingGestureUnlock || readPendingFromStorage();
}

export function clearWelcomeRoomGestureUnlock(): void {
  pendingGestureUnlock = false;
  writePendingToStorage(false);
}

/** @deprecated Use hasPendingWelcomeRoomGestureUnlock */
export function consumeWelcomeRoomOpenedWithGesture(): boolean {
  return hasPendingWelcomeRoomGestureUnlock();
}
