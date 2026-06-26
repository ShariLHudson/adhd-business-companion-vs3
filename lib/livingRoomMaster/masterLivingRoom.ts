/**
 * Master Living Room™ — composition lock.
 *
 * No Living Change™, Environmental Truth™, seasons, wildlife, or overlay
 * objects render until this master scene is approved.
 */

export const MASTER_LIVING_ROOM_IMAGE_ID = "shari-i-am-here-2";

/** When true, the welcome scene shows only the master photograph + linen UI. */
export const MASTER_LIVING_ROOM_COMPOSITION_LOCKED = true;

export const MASTER_LIVING_ROOM_GREETING = "It's good to see you.";
export const MASTER_LIVING_ROOM_INVITE = "Come on in — I'm glad you stopped by.";

export function masterLivingRoomImageId(): string {
  return MASTER_LIVING_ROOM_IMAGE_ID;
}

export function isMasterLivingRoomLocked(): boolean {
  return MASTER_LIVING_ROOM_COMPOSITION_LOCKED;
}
