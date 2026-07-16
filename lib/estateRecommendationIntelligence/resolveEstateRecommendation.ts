/**
 * Estate Recommendation Intelligence
 *
 * Connects human need signals → validated Live destinations → why-now invitations.
 * Companion, not directory. Permission before navigation (Spec 108).
 */

import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import { formatRecommendationInvitation } from "./formatRecommendationInvitation";
import { matchMemberNeedSignal } from "./memberNeedSignals";
import { buildRecommendationChoices } from "./recommendationReasons";
import type {
  EstateRecommendationContext,
  EstateRecommendationDecision,
} from "./types";

const EXPLICIT_NAVIGATION_RE =
  /\b(?:take me to|go to|show me the|visit the|head to|bring me to|open the)\b/i;

const EXPLICIT_TASK_RE =
  /\b(?:help me (?:write|create|draft|build|plan)|write a|create a|draft a)\b/i;

/** Functional relief destinations allowed when scenic auto-suggestions are off. */
const FUNCTIONAL_RELIEF_LOCATION_IDS = new Set(["clear-my-mind"]);

function isRecommendationQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (EXPLICIT_NAVIGATION_RE.test(trimmed)) return false;
  if (EXPLICIT_TASK_RE.test(trimmed)) return false;
  return matchMemberNeedSignal(trimmed) != null;
}

/**
 * Resolve member text to a why-now Estate invitation.
 * Returns unresolved when the message is not a human-need signal.
 */
export function resolveEstateRecommendation(
  query: string,
  context: EstateRecommendationContext = {},
): EstateRecommendationDecision {
  const trimmed = query.trim();
  const base: EstateRecommendationDecision = {
    kind: "unresolved",
    query: trimmed,
    stayHereOffered: true,
    reason: "not_recommendation_query",
  };

  if (!trimmed) return base;
  if (!isRecommendationQuery(trimmed)) return base;

  const match = matchMemberNeedSignal(trimmed);
  if (!match) return base;

  // Bare overwhelm / task overwhelm → conversation, not scenic place menus.
  // Cognitive overload may gently invite Clear My Mind only.
  const scenicAllowed = mayOfferScenicPlaceSuggestions(trimmed);
  const overwhelmKind = classifyOverwhelmNeed(trimmed);
  const blockScenic = shouldBlockScenicOverwhelmMenu(trimmed);

  if (!scenicAllowed && blockScenic) {
    if (overwhelmKind === "task_breakdown") {
      return {
        ...base,
        signalId: match.signal.signalId,
        signalLabel: match.signal.label,
        reason: "task_overwhelm_stays_in_conversation",
      };
    }
    if (overwhelmKind !== "cognitive_overload") {
      return {
        ...base,
        signalId: match.signal.signalId,
        signalLabel: match.signal.label,
        reason: "overwhelm_stays_in_conversation",
      };
    }
  }

  let choices = buildRecommendationChoices(match.signal.signalId, context, 3);
  if (!scenicAllowed && blockScenic) {
    choices = choices.filter((choice) =>
      FUNCTIONAL_RELIEF_LOCATION_IDS.has(choice.locationId),
    );
  }

  if (choices.length === 0) {
    return {
      kind: "unresolved",
      query: trimmed,
      signalId: match.signal.signalId,
      signalLabel: match.signal.label,
      stayHereOffered: true,
      reason: "no_validated_recommendations",
    };
  }

  const [primary, ...rest] = choices;
  const decision: EstateRecommendationDecision = {
    kind: "invitation",
    query: trimmed,
    signalId: match.signal.signalId,
    signalLabel: match.signal.label,
    emotionalTone: match.signal.emotionalTone,
    matchedPhrase: match.matchedPhrase,
    primary,
    alternatives: scenicAllowed ? rest.slice(0, 2) : [],
    stayHereOffered: true,
    reason: "need_signal_matched",
  };

  decision.memberFacingInvitation = formatRecommendationInvitation(decision);
  return decision;
}

export function isResolvedEstateRecommendation(
  decision: EstateRecommendationDecision,
): decision is EstateRecommendationDecision & {
  primary: NonNullable<EstateRecommendationDecision["primary"]>;
} {
  return decision.kind === "invitation" && decision.primary != null;
}
