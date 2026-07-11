/**
 * Resolve the member's current estate room from visit, section, or memory.
 *
 * Global law: live shell (visit / section) always beats stale visual_room /
 * conversation / memory. Stale awareness must never make Spark claim
 * "already here" on the wrong page.
 */

import {
  getLiveShellPlaceId,
  isNonPlaceShellSection,
  resolvePlaceFromShell,
} from "@/lib/estate/roomAwareness";
import { normalizeEstateRoomId } from "./roomIds";

export type ResolveCurrentEstateRoomInput = {
  directVisitRoomId?: string | null;
  activeSection?: string | null;
  memoryRoomId?: string | null;
  /** @deprecated Live shell always wins; kept for call-site compatibility */
  preferVisualAwareness?: boolean;
};

/**
 * Best-effort current room for routing:
 * 1. Direct visit
 * 2. Live shell place from section
 * 3. Non-place tool section → null (never memory / stale visual)
 * 4. Synced liveShellPlaceId
 * 5. Memory only when section is absent
 */
export function resolveCurrentEstateRoom(
  input: ResolveCurrentEstateRoomInput,
): string | null {
  const fromVisit = normalizeEstateRoomId(input.directVisitRoomId);
  if (fromVisit) return fromVisit;

  const section = input.activeSection?.trim() ?? null;
  const fromShell = normalizeEstateRoomId(
    resolvePlaceFromShell({
      placeId: null,
      section,
    }),
  );
  if (fromShell) return fromShell;

  // Tool/panel screens are not "in" a remembered estate room.
  if (isNonPlaceShellSection(section)) {
    return null;
  }

  const liveShell = normalizeEstateRoomId(getLiveShellPlaceId());
  if (liveShell) return liveShell;

  // Memory only when we have no live section signal.
  if (!section) {
    const fromMemory = normalizeEstateRoomId(input.memoryRoomId);
    if (fromMemory && fromMemory !== "welcome-home") return fromMemory;
  }

  return null;
}
