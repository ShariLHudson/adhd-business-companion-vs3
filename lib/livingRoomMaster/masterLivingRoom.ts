/**
 * Master Living Room — one approved photograph until a new asset is approved.
 * Time of day is expressed through homestead lighting on this scene, not photo swaps.
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
