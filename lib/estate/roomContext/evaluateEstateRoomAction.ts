/**
 * Estate Room Context — perform in-room actions when already in the right place.
 *
 * Decision order:
 * 1. Member already in the correct room → room action
 * 2. Otherwise → navigation (handled by estate kernel)
 */

import { canClaimAlreadyHere } from "@/lib/estate/roomAwareness";
import type { EvaluateEstateRoomActionInput, EstateRoomActionResult } from "./types";
import { matchEstateRoomAction } from "./roomActionMatchers";
import { normalizeEstateRoomId } from "./roomIds";

export function evaluateEstateRoomAction(
  input: EvaluateEstateRoomActionInput,
): EstateRoomActionResult | null {
  const current = normalizeEstateRoomId(input.currentPlaceId);
  if (!current) return null;
  const result = matchEstateRoomAction(input.userText, current);
  if (!result) return null;
  // Redundant navigation / remain_in_room already gated inside matchers;
  // double-check remain replies never fire without visual confirmation.
  if (
    result.action.kind === "remain_in_room" &&
    !canClaimAlreadyHere(result.currentRoomId)
  ) {
    return null;
  }
  return result;
}
