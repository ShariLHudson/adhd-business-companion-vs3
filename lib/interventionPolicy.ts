/**
 * Product policy: one intervention at a time.
 * Automatic recovery / lighter-day and loop-awareness cards are disabled in chat.
 */

export const SURFACE_AUTOMATIC_RECOVERY_OFFERS = false;

export function shouldSurfaceAutomaticRecoveryOffer(): boolean {
  return SURFACE_AUTOMATIC_RECOVERY_OFFERS;
}

export const SURFACE_AUTOMATIC_LOOP_OFFERS = false;

export function shouldSurfaceAutomaticLoopOffer(): boolean {
  return SURFACE_AUTOMATIC_LOOP_OFFERS;
}
