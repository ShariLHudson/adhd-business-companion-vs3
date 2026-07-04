import { classifySparkPrimaryIntent } from "./classifyIntent";
import {
  COMPANION_STYLE_DESCRIPTIONS,
  mapStyleRoleToDynamicRole,
  selectCompanionStyleRoleWithText,
} from "./companionRole";
import { ESTATE_ROUTE_FORBIDDEN, suggestEstateRoute } from "./estateRouting";
import { FRICTION_RESPONSES, identifySparkFriction } from "./friction";
import {
  anticipateNaturalNext,
  extractLearningSignals,
  targetLeaveBetterOutcomes,
} from "./outcomes";
import { evaluateSparkLandscapes } from "@/lib/sparkCompanion/sparkLandscapes/evaluateLandscapes";
import { landscapeEstatePlaceForLandscape } from "@/lib/sparkCompanion/sparkLandscapes/landscapes";
import type {
  SparkDecisionEngineDecision,
  SparkDecisionEngineInput,
  EstateRouteSuggestion,
} from "./types";

/**
 * Spark Decision Engine™ — seven-step orchestration before every response.
 * Composes constitution layers; does not replace them.
 */
export function evaluateSparkDecisionEngine(
  input: SparkDecisionEngineInput,
): SparkDecisionEngineDecision {
  const { intent, confidence, reason: intentReason } = classifySparkPrimaryIntent({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const friction = identifySparkFriction({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
    intent,
  });

  const companionRole = selectCompanionStyleRoleWithText({
    intent,
    friction,
    userText: input.userText,
    trustEstablished: input.trustEstablished,
  });

  const landscape = evaluateSparkLandscapes({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  let estateRoute = suggestEstateRoute({
    intent,
    friction,
    currentPlaceId: input.placeId,
    landscape: landscape.primary,
  });

  if (!estateRoute && !input.placeId) {
    const placeId = landscapeEstatePlaceForLandscape(landscape.primary);
    if (placeId) {
      estateRoute = {
        placeId,
        reason: `landscape ${landscape.primary} — optional atmosphere`,
        optional: true,
      } satisfies EstateRouteSuggestion;
    }
  }

  const targetOutcomes = targetLeaveBetterOutcomes({ intent, friction });
  const learningSignals = extractLearningSignals(input.userText);
  const anticipateHints = anticipateNaturalNext({
    userText: input.userText,
    intent,
  });

  const suppressEmotionalCoaching =
    intent === "CREATE" &&
    confidence === "high" &&
    friction !== "emotional_weight" &&
    friction !== "capacity";

  return {
    intent,
    intentConfidence: confidence,
    friction,
    companionRole,
    estateRoute,
    landscape,
    targetOutcomes,
    learningSignals,
    anticipateHints,
    suppressEmotionalCoaching,
    reason: `${intentReason}; friction=${friction}; role=${companionRole}; ${landscape.reason}`,
  };
}

export function mapDecisionToDynamicCompanionRole(
  decision: SparkDecisionEngineDecision,
): ReturnType<typeof mapStyleRoleToDynamicRole> {
  return mapStyleRoleToDynamicRole(decision.companionRole, decision.intent);
}

export {
  COMPANION_STYLE_DESCRIPTIONS,
  ESTATE_ROUTE_FORBIDDEN,
  FRICTION_RESPONSES,
  mapStyleRoleToDynamicRole,
};
