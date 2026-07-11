/**
 * In-room conversation intents — context-aware replies when already visiting a place.
 */

import { canClaimAlreadyHere } from "@/lib/estate/roomAwareness";
import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { resolveChamberMemberFacingName } from "./chamberOfMomentumIdentity";

const RECIPE_RE =
  /\b(?:recipe|bake|baking|cook|cooking|apple\s+pie|pie\s+recipe)\b/i;

const GALLERY_ACK_RE =
  /\b(?:this is (?:the )?gallery|we(?:'re| are) in (?:the )?gallery|hall of (?:accomplishments|achievements)|gallery of firsts)\b/i;

const BREATHE_IN_ROOM_RE =
  /\b(?:breath(?:ing)?\s+exercise|breathe\s+with\s+me|help me breathe|calm(?:ing)?\s+breath)\b/i;

const ALREADY_HERE_RE =
  /\b(?:already (?:there|here)|we(?:'re| are) already (?:there|here))\b/i;

const WRONG_DECK_ARRIVAL_RE =
  /\b(?:ended up in|wrong (?:room|place)|not (?:the|where) i wanted|not the deck|this (?:is|isn't) the deck|supposed to be.{0,24}deck|no we ended up)\b/i;

const DISCOVERY_MISROUTE_RE =
  /\b(?:discovery\s+room|discovery-room)\b/i;

export function isKitchenPlaceId(placeId?: string | null): boolean {
  return placeId === "estate-kitchen";
}

export function isGalleryPlaceId(placeId?: string | null): boolean {
  return placeId === "gallery-of-firsts";
}

export function memberFacingPlaceName(placeId: string): string {
  const chamberName = resolveChamberMemberFacingName(placeId);
  if (chamberName) return chamberName.replace(/\u2122/g, "");
  const canonical = getCanonicalEstatePlaceById(placeId);
  if (canonical) return canonical.officialName.replace(/\u2122/g, "");
  return placeId;
}

export function formatKitchenRecipeReply(): string {
  return "The kitchen is warm — we can talk through an apple pie recipe right here. Do you want something classic and simple, or a version with a twist?";
}

export function formatGalleryInRoomReply(): string {
  return "Yes — this is the Hall of Accomplishments. Quiet walls for milestones you've earned. Want to browse what's here, or talk through something you're proud of?";
}

export function formatBreatheExerciseReply(): string {
  return "Let's slow down together. I'll stay with you while we breathe — in through the nose, out slow. Tell me when you're ready to start.";
}

export function formatAlreadyHereReply(currentPlaceId: string): string {
  const name = memberFacingPlaceName(currentPlaceId);
  return `You're right — we're already in ${name}. We can stay here, or tell me where you'd rather be.`;
}

export function formatWrongDeckArrivalReply(): string {
  return "You're right — that wasn't the deck. Want me to take you to the Back Deck?";
}

export function isDeckCorrectionTurn(
  userText: string,
  currentPlaceId?: string | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (!WRONG_DECK_ARRIVAL_RE.test(t) && !DISCOVERY_MISROUTE_RE.test(t)) {
    return false;
  }
  if (/\bdeck\b/i.test(t)) return true;
  const misroutedOutdoor =
    currentPlaceId === "woodland-path" || currentPlaceId === "discovery-room";
  return misroutedOutdoor && WRONG_DECK_ARRIVAL_RE.test(t);
}

export function evaluateInRoomConversationReply(
  userText: string,
  currentPlaceId?: string | null,
): string | null {
  const t = userText.trim();
  if (!t) return null;

  if (BREATHE_IN_ROOM_RE.test(t)) {
    return formatBreatheExerciseReply();
  }

  if (currentPlaceId && ALREADY_HERE_RE.test(t)) {
    // Never claim already-here unless visual_room confirms.
    if (!canClaimAlreadyHere(currentPlaceId)) return null;
    return formatAlreadyHereReply(currentPlaceId);
  }

  if (isKitchenPlaceId(currentPlaceId) && RECIPE_RE.test(t)) {
    return formatKitchenRecipeReply();
  }

  if (isGalleryPlaceId(currentPlaceId) && GALLERY_ACK_RE.test(t)) {
    return formatGalleryInRoomReply();
  }

  return null;
}
