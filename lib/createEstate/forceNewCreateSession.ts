/**
 * Session flag for Create Estate “Start Something New”.
 * Survives CreateEstateEntrancePanel remount when the parent clears the builder.
 */

let forceNewCreateArmed = false;

/** Arm after explicit Start Something New — next guided begin uses forceNew. */
export function armForceNewCreateSession(): void {
  forceNewCreateArmed = true;
}

export function isForceNewCreateSessionArmed(): boolean {
  return forceNewCreateArmed;
}

/** Clear after a successful open or Cancel. */
export function clearForceNewCreateSession(): void {
  forceNewCreateArmed = false;
}

/** Test helper. */
export function resetForceNewCreateSessionForTests(): void {
  forceNewCreateArmed = false;
}
