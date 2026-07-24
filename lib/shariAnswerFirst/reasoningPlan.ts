/**
 * Internal reasoning plan — invisible to members; shapes answer construction.
 */

import type { ShariResponseDecision } from "./types";
import type { ShariProfessionalRole } from "./professionalRoles";
import type { ResolvedShariContext } from "./contextResolver";
import type { ShariQuestionPolicy } from "./questionPolicy";

export type ShariReasoningPlan = {
  userGoal: string;
  successCriteria: string[];
  answerShape: string;
  whatMustBeIncluded: string[];
  whatMustBeAvoided: string[];
  contextKeysToUse: string[];
  assumptions: string[];
  confidence: number;
  uncertaintyNotes: string[];
  followUpStrategy: "none" | "one_high_leverage" | "offer_only" | "reflective";
  handoffEligibility: string[];
};

export function buildReasoningPlan(input: {
  decision: ShariResponseDecision;
  primaryRole: ShariProfessionalRole;
  context: ResolvedShariContext;
  questionPolicy: ShariQuestionPolicy;
}): ShariReasoningPlan {
  const { decision, primaryRole, context, questionPolicy } = input;
  const mode = decision.primaryHelpMode;

  const successCriteria = [
    "Directly addresses the request",
    "Useful without requiring another turn to start",
  ];
  if (mode === "how_to_guidance") {
    successCriteria.push("Ordered steps a member can follow today");
  }
  if (mode === "advice") {
    successCriteria.push("Clear recommendation with tradeoffs");
  }
  if (context.knownContextAvailable) {
    successCriteria.push("Uses known business context instead of re-asking");
  }

  const whatMustBeIncluded: string[] = [];
  const whatMustBeAvoided = [
    "Destination / room menus before substance",
    "Profiling questions when context is already known",
    "Route-before-answer offers as the whole reply",
    "Generic cheerleading without guidance",
  ];

  if (mode === "how_to_guidance") {
    whatMustBeIncluded.push(
      "Complete initial how-to for the stated task",
      "Practical defaults when size/details are missing (state the assumption)",
    );
  }
  if (mode === "advice") {
    whatMustBeIncluded.push(
      "A judgment call",
      "When it would / would not make sense",
      "One next move",
    );
  }
  if (primaryRole === "consultant" || primaryRole === "teacher") {
    whatMustBeIncluded.push("Situation-applied detail when context exists");
  }

  let answerShape = "Warm prose with one clear next move";
  if (decision.answerStructure === "numbered_steps") {
    answerShape = "Brief lead-in + numbered steps + optional soft offer";
  } else if (decision.answerStructure === "comparison") {
    answerShape = "Recommendation first, then concise tradeoffs";
  } else if (decision.answerStructure === "troubleshoot_sequence") {
    answerShape = "Ordered checks simplest-first";
  } else if (decision.answerStructure === "reflective") {
    answerShape = "Reflect + one question; no task dump";
  }

  let followUpStrategy: ShariReasoningPlan["followUpStrategy"] = "none";
  if (mode === "reflective_thinking") followUpStrategy = "reflective";
  else if (questionPolicy.bestFollowUpQuestion) followUpStrategy = "one_high_leverage";
  else if (decision.optionalCapabilityOffer !== "none") followUpStrategy = "offer_only";

  const handoffEligibility: string[] = [];
  if (decision.optionalCapabilityOffer === "create_from_answer") {
    handoffEligibility.push("create");
  }
  if (decision.optionalCapabilityOffer === "turn_into_project") {
    handoffEligibility.push("projects");
  }
  if (decision.optionalCapabilityOffer === "research_current") {
    handoffEligibility.push("research_library");
  }
  if (decision.optionalCapabilityOffer === "show_visually") {
    handoffEligibility.push("visual_thinking");
  }
  if (decision.optionalCapabilityOffer === "build_strategy") {
    handoffEligibility.push("strategic_planning");
  }

  return {
    userGoal: decision.rawRequest.trim(),
    successCriteria,
    answerShape,
    whatMustBeIncluded,
    whatMustBeAvoided,
    contextKeysToUse: context.relevantContextKeys.slice(0, 12),
    assumptions: context.assumptions,
    confidence: Math.min(decision.confidence, context.knownContextAvailable ? Math.max(context.contextConfidence, decision.confidence) : decision.confidence),
    uncertaintyNotes: decision.currentResearchRequired
      ? ["Current research may be needed for live facts"]
      : [],
    followUpStrategy,
    handoffEligibility,
  };
}

export function reasoningPlanHintForChat(plan: ShariReasoningPlan): string {
  return [
    "INTERNAL REASONING PLAN (do not show members):",
    `Goal: ${plan.userGoal}`,
    `Answer shape: ${plan.answerShape}`,
    `Must include: ${plan.whatMustBeIncluded.join("; ") || "direct helpful substance"}`,
    `Must avoid: ${plan.whatMustBeAvoided.join("; ")}`,
    plan.contextKeysToUse.length
      ? `Use context keys: ${plan.contextKeysToUse.join(", ")}`
      : "No strong context keys — use reasonable defaults and state assumptions.",
    plan.assumptions.length
      ? `Assumptions: ${plan.assumptions.join(" ")}`
      : "",
    `Follow-up strategy: ${plan.followUpStrategy}`,
    `Success: ${plan.successCriteria.join(" · ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
