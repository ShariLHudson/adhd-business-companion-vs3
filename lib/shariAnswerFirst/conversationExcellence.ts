/**
 * Conversation excellence validation — substance + baseline + delight.
 */

import type { ShariResponseDecision, ShariAnswerSubstanceValidation } from "./types";
import { validateShariAnswerSubstance } from "./substanceValidation";
import type { ResolvedShariContext } from "./contextResolver";
import {
  draftViolatesQuestionPolicy,
  type ShariQuestionPolicy,
} from "./questionPolicy";
import {
  reviewAgainstGeneralAiBaseline,
  type GeneralAiBaselineReview,
} from "./generalAiBaseline";
import type { ShariProfessionalRole } from "./professionalRoles";
import {
  reviewConversationDelight,
  type ConversationDelightReview,
} from "./conversationDelight";
import type { ShariResponseComposition } from "./responseComposer";
import type { ShariWisdomPlan } from "./wisdomPlan";

export type ConversationExcellenceValidation = ShariAnswerSubstanceValidation & {
  excellent: boolean;
  roleAppropriate: boolean;
  beatsOrMatchesGeneralAi: boolean;
  questionPolicyOk: boolean;
  knownContextRespected: boolean;
  excellenceFailures: string[];
  baseline: GeneralAiBaselineReview;
  delight: ConversationDelightReview | null;
  score: number;
};

export function validateConversationExcellence(input: {
  request: string;
  answer: string;
  decision: ShariResponseDecision;
  context: ResolvedShariContext;
  questionPolicy: ShariQuestionPolicy;
  primaryRole: ShariProfessionalRole;
  composition?: ShariResponseComposition | null;
  wisdom?: ShariWisdomPlan | null;
}): ConversationExcellenceValidation {
  const substance = validateShariAnswerSubstance({
    decision: input.decision,
    answer: input.answer,
  });

  const baseline = reviewAgainstGeneralAiBaseline({
    decision: input.decision,
    context: input.context,
    draft: input.answer,
  });

  const questionCheck = draftViolatesQuestionPolicy(
    input.answer,
    input.questionPolicy,
    input.context,
  );

  const excellenceFailures: string[] = [...substance.failures];
  if (baseline.shariIsWeaker) {
    excellenceFailures.push("weaker_than_general_ai_baseline");
  }
  if (baseline.personalizationWithoutSubstance) {
    excellenceFailures.push("personalization_without_substance");
  }
  if (questionCheck.violates) {
    excellenceFailures.push(...questionCheck.reasons);
  }

  const knownContextRespected =
    !input.context.knownContextAvailable ||
    !questionCheck.reasons.includes("asks_for_known_context");

  if (!knownContextRespected) {
    excellenceFailures.push("ignored_known_context");
  }

  // Explicit create/write must not be replaced by destination offers or empty interviews.
  if (input.decision.explicitCreationRequested) {
    const a = input.answer;
    const looksLikeDraft =
      /\b(?:subject|hi team|hello|dear |here'?s (?:a |an )?(?:simple |draft )?email|absolutely\.?\s*here'?s)\b/i.test(
        a,
      ) ||
      (a.includes("---") && /\b(?:subject|hi |hello)\b/i.test(a));
    const asksDiscoveryAgain =
      /\b(?:who is receiving|one person, a role|what is this email trying|main reason you'?re creating)\b/i.test(
        a,
      );
    const emotionalDestinationSteal =
      /\b(?:evidence vault|would it help to open|celebration garden)\b/i.test(a);
    if (emotionalDestinationSteal && !looksLikeDraft) {
      excellenceFailures.push("explicit_create_stolen_by_emotional_destination");
    }
    if (asksDiscoveryAgain && !looksLikeDraft) {
      excellenceFailures.push("explicit_create_unanswered_discovery_loop");
    }
    if (!looksLikeDraft && !asksDiscoveryAgain && a.trim().length < 80) {
      excellenceFailures.push("explicit_create_request_unanswered");
    }
  }

  const roleAppropriate = roleFitsAnswer(
    input.primaryRole,
    input.answer,
    input.decision.primaryHelpMode,
  );
  if (!roleAppropriate) {
    excellenceFailures.push("role_mismatch");
  }

  let delight: ConversationDelightReview | null = null;
  if (input.composition && input.wisdom) {
    delight = reviewConversationDelight({
      decision: input.decision,
      answer: input.answer,
      context: input.context,
      primaryRole: input.primaryRole,
      composition: input.composition,
      wisdom: input.wisdom,
      baseline,
    });
    if (!delight.passes) {
      excellenceFailures.push("delight_threshold_failed");
    }
  }

  const beatsOrMatchesGeneralAi =
    !baseline.shariIsWeaker &&
    (baseline.shariIsEqual || baseline.shariIsStronger);

  // Score 0–10
  let score = 7;
  if (!substance.valid) score -= 3;
  if (baseline.shariIsWeaker) score -= 3;
  if (baseline.shariIsStronger) score += 1;
  if (!knownContextRespected) score -= 2;
  if (questionCheck.violates) score -= 2;
  if (!roleAppropriate) score -= 1;
  if (delight) {
    score = Math.round((score + delight.delightScore) / 2);
    if (!delight.passes) score -= 1;
  }
  if (
    beatsOrMatchesGeneralAi &&
    knownContextRespected &&
    !questionCheck.violates &&
    (!delight || delight.passes)
  ) {
    // Floor for answers that clear baseline + delight even if a soft substance flag trips
    score = Math.max(score, delight?.passes ? 8 : 7);
  }
  if (substance.valid && beatsOrMatchesGeneralAi && knownContextRespected) {
    score = Math.max(score, 7);
  }
  score = Math.max(0, Math.min(10, score));

  const excellent =
    substance.valid &&
    beatsOrMatchesGeneralAi &&
    !questionCheck.violates &&
    knownContextRespected &&
    roleAppropriate &&
    (!delight || delight.passes) &&
    score >= 8;

  return {
    ...substance,
    excellent,
    roleAppropriate,
    beatsOrMatchesGeneralAi,
    questionPolicyOk: !questionCheck.violates,
    knownContextRespected,
    excellenceFailures: [...new Set(excellenceFailures)],
    baseline,
    delight,
    score,
    valid:
      substance.valid &&
      !baseline.shariIsWeaker &&
      !questionCheck.violates &&
      (!delight || delight.passes || score >= 7),
    repairInstructions: [
      ...substance.repairInstructions,
      ...(baseline.shariIsWeaker
        ? [
            "Regenerate to beat a competent general AI: lead with substance, then one optional follow-up or soft offer.",
          ]
        : []),
      ...(questionCheck.reasons.includes("asks_for_known_context")
        ? [
            "Use known Business Estate / People I Help context instead of asking what they sell or who they help.",
          ]
        : []),
      ...(delight?.repairInstructions ?? []),
      ...(excellenceFailures.includes("explicit_create_stolen_by_emotional_destination") ||
      excellenceFailures.includes("explicit_create_unanswered_discovery_loop") ||
      excellenceFailures.includes("explicit_create_request_unanswered")
        ? [
            "Honor the explicit create/write request: draft with what you know now. Soften tone for overwhelm, but do not open optional destinations or restart discovery.",
          ]
        : []),
    ],
  };
}

function roleFitsAnswer(
  role: ShariProfessionalRole,
  answer: string,
  helpMode: ShariResponseDecision["primaryHelpMode"],
): boolean {
  const a = answer.trim();
  if (!a) return false;
  if (role === "coach" || helpMode === "reflective_thinking") {
    const steps = (a.match(/^\s*\d+[\).]/gm) || []).length;
    if (steps >= 6 && a.length > 900) return false;
    return true;
  }
  if (role === "teacher" || role === "consultant" || role === "troubleshooter") {
    if (a.endsWith("?") && a.length < 200) return false;
    return a.length >= 100;
  }
  if (role === "advisor") {
    return (
      /\b(?:i(?:'d| would) |recommend|worth|depends|tradeoff|if you)\b/i.test(a) ||
      a.length >= 120
    );
  }
  return true;
}
