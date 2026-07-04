/**
 * Resolve the member's current estate room from visit, section, or memory.
 */

import { estatePresenceRoomForSection } from "../estatePresence/registry";
import { normalizeEstateRoomId } from "./roomIds";

export type ResolveCurrentEstateRoomInput = {
  directVisitRoomId?: string | null;
  activeSection?: string | null;
  memoryRoomId?: string | null;
};

/**
 * Best-effort current room — direct visit wins, then section mapping, then memory.
 */
export function resolveCurrentEstateRoom(
  input: ResolveCurrentEstateRoomInput,
): string | null {
  const fromVisit = normalizeEstateRoomId(input.directVisitRoomId);
  if (fromVisit) return fromVisit;

  const section = input.activeSection?.trim();
  if (section) {
    const fromSection = estatePresenceRoomForSection(section);
    if (fromSection) return fromSection;
  }

  const fromMemory = normalizeEstateRoomId(input.memoryRoomId);
  if (fromMemory && fromMemory !== "welcome-home") return fromMemory;

  return null;
}
