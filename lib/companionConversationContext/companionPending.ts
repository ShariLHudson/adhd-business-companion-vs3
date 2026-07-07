/**
 * Recover or validate pending Estate navigation from assistant offers.
 */

import { messageAsksUserConfirmation } from "@/lib/conversationConfirmationGate";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import { matchObjectAlias } from "@/lib/estateObjectIntelligence/objectAliases";
import { getEstateObjectById } from "@/lib/estateObjectIntelligence/estateObjects";
import { selectPlacementForContext } from "@/lib/estateObjectIntelligence/objectLocations";
import type { CompanionConversationState, CompanionPendingAction } from "./types";
import { PENDING_ACTION_TURN_LIMIT } from "./types";
import { isCompanionPendingExpired } from "./store";
import { isAffirmativeReply } from "./isAffirmativeReply";

const OFFER_NAV_RE =
  /\b(?:would you like to (?:go|visit)|would you like me to take (?:you|us)|want to go there|take you there|visit the|go there together)\b/i;

function locationIdToPlaceId(locationId: string): string {
  const loc = getEstateLocationById(locationId);
  return loc?.canonicalPlaceId ?? locationId;
}

function inferPendingFromAssistantOffer(
  assistantText: string,
  state: CompanionConversationState,
  currentTurn: number,
): CompanionPendingAction | null {
  const last = assistantText.trim();
  if (!last || !messageAsksUserConfirmation(last)) return null;
  if (!OFFER_NAV_RE.test(last) && !/\bvisit\b/i.test(last)) return null;

  const alias = matchObjectAlias(last);
  if (alias) {
    const object = getEstateObjectById(alias.objectId);
    const placement = selectPlacementForContext(
      alias.objectId,
      state.currentLocation?.locationId,
    );
    const locationId =
      placement?.locationId ?? object?.appearsInLocations?.[0] ?? null;
    if (locationId) {
      return {
        type: "estate_navigate",
        placeId: locationIdToPlaceId(locationId),
        locationId,
        priorAssistantQuestion: last,
        originalReason: `object_offer:${alias.objectId}`,
        offeredAtTurn: currentTurn,
        expiresAtTurn: currentTurn + PENDING_ACTION_TURN_LIMIT,
      };
    }
  }

  if (/\bfireplace\b/i.test(last)) {
    return {
      type: "estate_navigate",
      placeId: "observatory-fireplace",
      locationId: "house-possibility-observatory",
      priorAssistantQuestion: last,
      originalReason: "fireplace_offer",
      offeredAtTurn: currentTurn,
      expiresAtTurn: currentTurn + PENDING_ACTION_TURN_LIMIT,
    };
  }

  if (state.currentLocation) {
    return {
      type: "estate_navigate",
      placeId: state.currentLocation.placeId,
      locationId: state.currentLocation.locationId,
      priorAssistantQuestion: last,
      originalReason: "location_offer",
      offeredAtTurn: currentTurn,
      expiresAtTurn: currentTurn + PENDING_ACTION_TURN_LIMIT,
    };
  }

  return null;
}

export function resolveActiveCompanionPending(input: {
  userText: string;
  lastAssistantText?: string | null;
  state: CompanionConversationState;
  currentTurn: number;
}): CompanionPendingAction | null {
  if (!isAffirmativeReply(input.userText)) return null;

  const stored = input.state.pendingAction;
  if (
    stored &&
    !isCompanionPendingExpired(stored, input.currentTurn)
  ) {
    return stored;
  }

  const last = input.lastAssistantText?.trim();
  if (!last) return null;
  return inferPendingFromAssistantOffer(last, input.state, input.currentTurn);
}
