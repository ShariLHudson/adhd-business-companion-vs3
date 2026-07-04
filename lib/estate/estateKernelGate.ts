/**
 * Estate kernel gate — never let informational-chat bypass steal estate navigation.
 */

import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import {
  isExplicitPoolNavigationRequest,
  isVagueSwimmingActivityRequest,
} from "@/lib/estate/estatePlaceNavigationIntents";
import {
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
  extractSoftPlaceProposal,
} from "./estateMetaNavigation";
import {
  messageNamesExactEstateRoom,
  resolveEstatePlaceIdFromUserText,
} from "./estateRoomAliasRegistry";
import { evaluateImpliedNeed } from "@/lib/intentAwareConversation/impliedNeed";
import {
  primaryTurnAllowsKernel,
  type PrimaryTurnDecision,
} from "@/lib/conversation/primaryTurnClassifier";

const PLACE_LOOK_LIKE_RE =
  /\bwhat does (?:the\s+)?(.+?)\s+look like\b/i;

const VISIT_WISH_RE =
  /\b(?:i(?:'d| would)?\s+like\s+to\s+visit|i want to visit|can we visit)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i;

function phraseNamesEstateRoom(phrase: string): boolean {
  const trimmed = phrase.trim().replace(/[™®.!?]+$/g, "");
  if (!trimmed) return false;
  return messageNamesExactEstateRoom(trimmed) || detectDirectCommand(trimmed) !== null;
}

/**
 * True when this turn must route through the estate decision kernel —
 * even if it looks like a how-to / informational chat turn.
 */
export function shouldRouteThroughEstateKernel(
  userText: string,
  options?: { primaryTurn?: PrimaryTurnDecision | null },
): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;

  if (
    options?.primaryTurn &&
    !primaryTurnAllowsKernel(options.primaryTurn)
  ) {
    return false;
  }

  // IMPLIED_NEED — frictionless offers choices; do not steal with kernel auto-route.
  if (evaluateImpliedNeed(trimmed)) return false;

  if (messageNamesExactEstateRoom(trimmed)) return true;
  if (detectDirectCommand(trimmed) !== null) return true;
  if (resolveEstatePlaceIdFromUserText(trimmed)) return true;
  if (
    isExplicitPoolNavigationRequest(trimmed) ||
    isVagueSwimmingActivityRequest(trimmed)
  ) {
    return true;
  }

  const lookLike = trimmed.match(PLACE_LOOK_LIKE_RE);
  if (lookLike?.[1] && phraseNamesEstateRoom(lookLike[1])) return true;

  const visitWish = trimmed.match(VISIT_WISH_RE);
  if (visitWish?.[1] && phraseNamesEstateRoom(visitWish[1])) return true;

  if (isAnotherRoomRequest(trimmed) || isEstateRoomListOrMapRequest(trimmed)) {
    return true;
  }

  const softProposal = extractSoftPlaceProposal(trimmed);
  if (softProposal && resolveEstatePlaceIdFromUserText(softProposal)) {
    return true;
  }

  return false;
}
