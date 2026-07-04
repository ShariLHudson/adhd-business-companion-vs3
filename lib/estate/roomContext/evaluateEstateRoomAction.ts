/**
 * Estate Room Context™ — perform in-room actions when already in the right place.
 *
 * Decision order:
 * 1. Member already in the correct room → room action
 * 2. Otherwise → navigation (handled by estate kernel)
 */

import type { EvaluateEstateRoomActionInput, EstateRoomActionResult } from "./types";
import { matchEstateRoomAction } from "./roomActionMatchers";
import { normalizeEstateRoomId } from "./roomIds";

export function evaluateEstateRoomAction(
  input: EvaluateEstateRoomActionInput,
): EstateRoomActionResult | null {
  const current = normalizeEstateRoomId(input.currentPlaceId);
  if (!current) return null;
  return matchEstateRoomAction(input.userText, current);
}
