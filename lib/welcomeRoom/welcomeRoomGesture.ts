/**
 * The sidebar / visit click is a user gesture — use it to unlock Welcome Room audio.
 * Do not clear the flag until unlock succeeds (React Strict Mode remounts the panel).
 */

let pendingGestureUnlock = false;

export function markWelcomeRoomOpenedWithGesture(): void {
  pendingGestureUnlock = true;
}

/** True while we still owe an automatic unlock attempt on the audio manager. */
export function hasPendingWelcomeRoomGestureUnlock(): boolean {
  return pendingGestureUnlock;
}

export function clearWelcomeRoomGestureUnlock(): void {
  pendingGestureUnlock = false;
}

/** @deprecated Use hasPendingWelcomeRoomGestureUnlock */
export function consumeWelcomeRoomOpenedWithGesture(): boolean {
  return hasPendingWelcomeRoomGestureUnlock();
}
