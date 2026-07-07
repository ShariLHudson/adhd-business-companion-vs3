/**
 * Apply Companion Decision Intelligence™ to frictionless decisions.
 */

import { SPARK_HUMAN_VOICE_FINAL_CHECK } from "@/lib/humanConversation/sparkHumanVoice";
import {
  evaluateCompanionDecision,
  isCompanionDecisionIntelligenceEnabled,
} from "./evaluateCompanionDecision";
import type { CompanionDecisionInput } from "./types";

const FEATURE_DUMP_RE =
  /\b(?:you could use|try using|features? like)\b.{0,80}\b(?:research|momentum|discovery key|spark cards?)\b/i;

export type CompanionDecisionDecisionShape = {
  responseHint: string | null;
  localReply: string | null;
  immediateEstatePlaceNavigate?: {
    navigationLine: string;
    placeId: string;
    userText: string;
  } | null;
};

export function applyCompanionDecisionGuidance<T extends CompanionDecisionDecisionShape>(
  decision: T,
  context: CompanionDecisionInput,
): T {
  if (!isCompanionDecisionIntelligenceEnabled()) {
    return decision;
  }

  const guidance = evaluateCompanionDecision(context);
  const hints = [
    decision.responseHint,
    guidance.responseHint,
    SPARK_HUMAN_VOICE_FINAL_CHECK,
  ].filter(Boolean);

  let localReply = decision.localReply;
  if (localReply && guidance.suppressFeatureDump && FEATURE_DUMP_RE.test(localReply)) {
    localReply = guidance.smallestNextStep;
  }

  if (
    localReply &&
    guidance.needType === "navigation" &&
    decision.immediateEstatePlaceNavigate
  ) {
    const line = decision.immediateEstatePlaceNavigate.navigationLine?.trim();
    if (line) localReply = line;
  }

  return {
    ...decision,
    localReply,
    responseHint: hints.join("\n\n"),
  };
}
