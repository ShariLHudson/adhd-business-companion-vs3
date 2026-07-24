/**
 * Automatic repair — prefer model regeneration with targeted instructions.
 * Topic fail-safes remain last-resort only.
 */

import type { ShariAnswerSubstanceValidation, ShariResponseDecision } from "./types";
import { validateShariAnswerSubstance } from "./substanceValidation";
import { validateConversationExcellence } from "./conversationExcellence";
import type { ResolvedShariContext } from "./contextResolver";
import type { ShariQuestionPolicy } from "./questionPolicy";
import type { ShariProfessionalRole } from "./professionalRoles";
import type { ShariResponseComposition } from "./responseComposer";
import type { ShariWisdomPlan } from "./wisdomPlan";
import { trackShariAnswerFirstEvent } from "./observability";

export const SHARI_MAX_MODEL_REPAIR_ATTEMPTS = 1;

export function buildAnswerFirstRepairInstructions(
  decision: ShariResponseDecision,
  validation: ShariAnswerSubstanceValidation,
): string | null {
  if (validation.valid) return null;
  return [
    "ANSWER-FIRST REPAIR REQUIRED:",
    "Your previous reply failed substance validation.",
    ...validation.repairInstructions.map((r) => `- ${r}`),
    `Help mode: ${decision.primaryHelpMode}. Depth: ${decision.answerDepth}.`,
    "Rewrite a complete, useful answer in Shari's voice.",
    "Do not open or list destinations. Do not echo the request.",
    "Answer first; at most one soft next-step offer at the end.",
  ].join("\n");
}

export function evaluateAndRepairAnswerFirst(input: {
  decision: ShariResponseDecision;
  answer: string;
  priorContext?: string | null;
}): {
  validation: ShariAnswerSubstanceValidation;
  repairInstructions: string | null;
  needsRepair: boolean;
} {
  const validation = validateShariAnswerSubstance(input);
  const repairInstructions = buildAnswerFirstRepairInstructions(
    input.decision,
    validation,
  );
  return {
    validation,
    repairInstructions,
    needsRepair: Boolean(repairInstructions),
  };
}

/**
 * Excellence + delight repair instructions for model regeneration.
 */
export function evaluateConversationExcellenceRepair(input: {
  decision: ShariResponseDecision;
  answer: string;
  context: ResolvedShariContext;
  questionPolicy: ShariQuestionPolicy;
  primaryRole: ShariProfessionalRole;
  composition?: ShariResponseComposition | null;
  wisdom?: ShariWisdomPlan | null;
}): {
  validation: ReturnType<typeof validateConversationExcellence>;
  repairInstructions: string | null;
  needsRepair: boolean;
  preferModelRepair: boolean;
} {
  const validation = validateConversationExcellence({
    request: input.decision.rawRequest,
    answer: input.answer,
    decision: input.decision,
    context: input.context,
    questionPolicy: input.questionPolicy,
    primaryRole: input.primaryRole,
    composition: input.composition,
    wisdom: input.wisdom,
  });

  if (validation.baseline.shariIsWeaker) {
    trackShariAnswerFirstEvent("baseline_threshold_failed", {
      mode: input.decision.primaryHelpMode,
      role: input.primaryRole,
      comparative: validation.baseline.comparativeScore,
    });
  }
  if (validation.delight && !validation.delight.passes) {
    trackShariAnswerFirstEvent("delight_threshold_failed", {
      mode: input.decision.primaryHelpMode,
      delightScore: validation.delight.delightScore,
    });
  }

  if (validation.excellent && validation.valid) {
    return {
      validation,
      repairInstructions: null,
      needsRepair: false,
      preferModelRepair: false,
    };
  }

  const failureDirections = mapFailuresToRepair(validation.excellenceFailures);

  const repairInstructions = [
    "CONVERSATION EXCELLENCE + WISDOM REPAIR REQUIRED:",
    `Score: ${validation.score}/10. Delight: ${validation.delight?.delightScore ?? "n/a"}. Comparative: ${validation.baseline.comparativeScore}/10.`,
    ...validation.repairInstructions.map((r) => `- ${r}`),
    ...failureDirections.map((r) => `- ${r}`),
    ...validation.excellenceFailures.map((f) => `- Failure code: ${f}`),
    `Professional role: ${input.primaryRole}.`,
    input.composition
      ? `Opening must be: ${input.composition.openingApproach}. Shape: ${input.composition.primaryResponseShape}.`
      : "",
    input.wisdom?.highestLeverageInsight
      ? `Include this insight: ${input.wisdom.highestLeverageInsight}`
      : "",
    input.wisdom?.keyJudgment
      ? `Key judgment: ${input.wisdom.keyJudgment}`
      : "",
    input.context.knownContextAvailable
      ? `Apply known context keys: ${input.context.relevantContextKeys.join(", ")}`
      : "No strong stored context — use reasonable assumptions and state them.",
    "Rewrite the full answer. Substance first. Match or beat a strong general AI, then add Estate advantages.",
    "Do not ask for known products/audience. Do not open destination menus. At most one question and one soft offer.",
  ]
    .filter(Boolean)
    .join("\n");

  trackShariAnswerFirstEvent("repair_attempted", {
    mode: input.decision.primaryHelpMode,
    score: validation.score,
  });

  return {
    validation,
    repairInstructions,
    needsRepair: true,
    preferModelRepair: true,
  };
}

function mapFailuresToRepair(failures: string[]): string[] {
  const out: string[] = [];
  for (const f of failures) {
    switch (f) {
      case "weaker_than_general_ai_baseline":
        out.push("Thin vs baseline — add missing substance and implementation detail.");
        break;
      case "personalization_without_substance":
        out.push("Do not rely on a personal fact alone — match baseline completeness.");
        break;
      case "delight_threshold_failed":
        out.push("Add one insight, shortcut, mistake, or personalized application.");
        break;
      case "ignored_known_context":
      case "asks_for_known_context":
        out.push("Apply relevant known context to examples and decisions.");
        break;
      case "question_before_substance":
      case "forbidden_clarify_pattern":
        out.push("Answer first; keep at most one high-value question after substance.");
        break;
      case "role_mismatch":
        out.push("Match the selected professional role (teach/advise/coach/consult).");
        break;
      case "destination_menu":
      case "route_before_answer":
        out.push("Remove destination menus; help in chat first.");
        break;
      default:
        break;
    }
  }
  return [...new Set(out)];
}
