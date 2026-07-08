/**
 * Bridge — Estate Navigation Intelligence™ ↔ resolveEstatePlace.
 */

import type {
  EstatePlaceResolution,
  EstatePlaceResolutionKind,
} from "@/lib/estate/resolveEstatePlace";
import { getCanonicalEstatePlaceById } from "@/lib/estate/canonicalEstateRegistry";
import {
  resolveEstateNavigationIntent,
  shouldNavigateFromDecision,
} from "./resolveEstateNavigationIntent";
import type { EstateNavigationDecision } from "./types";

function resolutionKindForDecision(
  decision: EstateNavigationDecision,
): EstatePlaceResolutionKind {
  if (decision.kind === "navigate_direct") {
    return decision.intentKind === "alias_match"
      ? "exact-place"
      : "exact-place";
  }
  if (
    decision.kind === "offer_choices" ||
    decision.kind === "need_clarification"
  ) {
    return "suggestion";
  }
  return "none";
}

/** Adapt navigation intelligence to canonical place resolution. */
export function navigationDecisionToPlaceResolution(
  decision: EstateNavigationDecision,
): EstatePlaceResolution | null {
  if (decision.kind === "unresolved") return null;

  if (shouldNavigateFromDecision(decision)) {
    const place = getCanonicalEstatePlaceById(decision.placeId);
    return {
      kind: "exact-place",
      placeId: decision.placeId,
      place: place ?? undefined,
      confidence: "high",
      reason: `Estate Navigation Intelligence™ → ${decision.intentKind}`,
      matchedAlias: decision.matchedPhrase,
    };
  }

  if (
    (decision.kind === "offer_choices" || decision.kind === "need_clarification") &&
    decision.choices?.length
  ) {
    const suggestedPlaceIds = decision.choices.map((choice) => choice.placeId);
    return {
      kind: "suggestion",
      suggestedPlaceIds,
      suggestedPlaces: suggestedPlaceIds
        .map((id) => getCanonicalEstatePlaceById(id))
        .filter((place): place is NonNullable<typeof place> => place != null),
      confidence: "medium",
      reason: `Estate Navigation Intelligence™ → ${decision.intentKind}`,
      matchedAlias: decision.matchedPhrase,
    };
  }

  if (decision.kind === "need_clarification") {
    return {
      kind: "suggestion",
      confidence: "low",
      reason: decision.reason ?? "navigation clarification",
    };
  }

  return {
    kind: resolutionKindForDecision(decision),
    confidence: "low",
    reason: decision.reason ?? "navigation unresolved",
  };
}

/**
 * Early resolver for resolveEstatePlace — knowledge-base navigation wins for
 * explicit navigation and experience requests.
 */
export function tryKnowledgeBasePlaceResolution(
  userText: string,
): EstatePlaceResolution | null {
  const decision = resolveEstateNavigationIntent(userText);
  const resolution = navigationDecisionToPlaceResolution(decision);
  if (!resolution || resolution.kind === "none") return null;
  // Let explicit alias / registry routing handle navigation when KB has no match.
  if (
    decision.kind === "need_clarification" &&
    decision.reason === "no_match"
  ) {
    return null;
  }
  return resolution;
}
