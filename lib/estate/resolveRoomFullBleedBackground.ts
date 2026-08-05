import {
  getRoomBackdropImageUrl,
  getRoomBackdropOverrideId,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import {
  resolveEstateBackground,
  type EstateBackgroundCandidate,
  type EstateBackgroundResolution,
} from "@/lib/estate/resolveEstateBackground";

/**
 * Resolves the background for a room rendered through
 * EstateRoomFullBleedBackground, through the authoritative resolver.
 *
 * memberChoice is read via the room's own override scope only (the same
 * getRoomBackdropOverrideId/getRoomBackdropImageUrl pair
 * EstateRoomFullBleedBackground's own hasMemberOverride check reads) — never
 * the general chat backdrop or Clear My Mind preference. Callers pass their
 * room's existing hardcoded constant as `defaultBackground`, preserving each
 * room's current default image exactly.
 *
 * Callers are expected to memoize on useChatBackdropRevision() themselves
 * (this function does no subscribing — it is a plain read, like
 * resolveWelcomeHomeBackground()).
 */
export function resolveRoomFullBleedBackground(
  roomId: string,
  defaultBackground: EstateBackgroundCandidate,
): EstateBackgroundResolution {
  const overrideId = getRoomBackdropOverrideId(roomId);
  const overrideImageUrl = overrideId ? getRoomBackdropImageUrl(roomId) : null;

  return resolveEstateBackground({
    place: roomId,
    memberChoice:
      overrideId && overrideImageUrl
        ? { backgroundId: overrideId, imageUrl: overrideImageUrl }
        : null,
    roomRequired: null,
    default: defaultBackground,
  });
}
