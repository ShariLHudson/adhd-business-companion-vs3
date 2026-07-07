/**
 * Estate Recommendation Intelligence™
 *
 * Connects human need signals → validated Live destinations → why-now invitations.
 * Companion, not directory. Permission before navigation (Spec 108).
 */

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

  const choices = buildRecommendationChoices(match.signal.signalId, context, 3);
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
    alternatives: rest.slice(0, 2),
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
