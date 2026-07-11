/**
 * Estate room background URLs — registry + live room assets.
 */

import type { AppSection } from "@/lib/companionUi";
import { getRoomBackdropImageUrl } from "@/lib/chatBackdrop/chatBackdropPreference";
import { MOMENTUM_BUILDER_ROOM_BG } from "@/lib/momentumBuilderRoom/roomRegistry";
import {
  ESTATE_ROOM_BG,
  ESTATE_ROOM_BG_BY_ROOM_ID,
} from "./estateRoomAssets";
import { getEstateDirectoryEntry } from "./directory";
import { resolveCanonicalPlaceId } from "./canonicalEstateRegistry";
import {
  getEstateRoomById,
  getEstateRoomForRoute,
} from "./estateRoomRegistry";

const ROOM_BACKGROUND_OVERRIDES: Record<string, string> = {
  ...ESTATE_ROOM_BG_BY_ROOM_ID,
  "momentum-builder": MOMENTUM_BUILDER_ROOM_BG,
};

/** Tier A immersive rooms — canonical gazebo/desk plates; not member backdrop swaps. */
const IMMERSIVE_CANONICAL_PLATE_ROOM_IDS = new Set(["journal"]);

export function estateRoomUsesCanonicalPlateOnly(roomId: string): boolean {
  return IMMERSIVE_CANONICAL_PLATE_ROOM_IDS.has(resolveCanonicalPlaceId(roomId));
}

/** Background plate for a room id (e.g. stables, conservatory). */
export function resolveEstateRoomBackgroundImage(
  roomId: string,
): string | null {
  const canonicalId = resolveCanonicalPlaceId(roomId);
  const memberOverride = estateRoomUsesCanonicalPlateOnly(canonicalId)
    ? null
    : getRoomBackdropImageUrl(canonicalId) ?? getRoomBackdropImageUrl(roomId);
  if (memberOverride) return memberOverride;

  const directoryBg = getEstateDirectoryEntry(canonicalId)?.media.backgroundUrl;
  if (directoryBg) return directoryBg;

  const override = ROOM_BACKGROUND_OVERRIDES[roomId];
  if (override) return override;

  const room = getEstateRoomById(roomId);
  if (!room) {
    return getEstateDirectoryEntry(roomId)?.media.backgroundUrl ?? null;
  }
  return room.backgroundImage ?? room.intendedBackgroundImage ?? null;
}

/** Background plate when navigating by AppSection. */
export function resolveEstateRoomBackgroundForSection(
  section: AppSection,
): string | null {
  const room = getEstateRoomForRoute(section);
  if (!room) return null;
  return (
    resolveEstateRoomBackgroundImage(room.id) ??
    room.backgroundImage ??
    room.intendedBackgroundImage ??
    null
  );
}

export { ESTATE_ROOM_BG };
