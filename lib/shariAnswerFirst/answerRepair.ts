/**
 * Automatic repair guidance when answer substance validation fails.
 * Prefer regenerating via companion-chat with these instructions; do not
 * invent a fake how-to locally.
 */

import type { ShariAnswerSubstanceValidation, ShariResponseDecision } from "./types";
import { validateShariAnswerSubstance } from "./substanceValidation";

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
