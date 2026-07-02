/**
 * Estate Intelligence™ — main evaluation entry (matcher + router).
 */

import { bestEstateMatch, type EstateMatcherInput } from "./estateMatcher";
import {
  memberAlreadyInEstateDestination,
  routeEstateMatch,
} from "./estateRouter";
import type {
  EstateIntelligenceEvaluation,
  EvaluateEstateIntelligenceInput,
} from "./types";

export function evaluateEstateIntelligence(
  input: EvaluateEstateIntelligenceInput,
): EstateIntelligenceEvaluation {
  const matcherInput: EstateMatcherInput = {
    userText: input.userText,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
    intentCategory: input.intentCategory,
  };

  const bestMatch = bestEstateMatch(matcherInput);
  const now = new Date().toISOString();

  if (!bestMatch || bestMatch.confidence === "low") {
    return {
      userText: input.userText,
      bestMatch: bestMatch?.confidence === "low" ? null : bestMatch,
      route: null,
      suppressed: false,
      evaluatedAt: now,
    };
  }

  const suppressed = memberAlreadyInEstateDestination(
    input.activeSection,
    input.workspacePanel,
    bestMatch.entry,
  );

  const route =
    bestMatch.confidence === "high" || bestMatch.confidence === "medium"
      ? routeEstateMatch(bestMatch)
      : null;

  return {
    userText: input.userText,
    bestMatch,
    route: suppressed ? null : route,
    suppressed,
    evaluatedAt: now,
  };
}
