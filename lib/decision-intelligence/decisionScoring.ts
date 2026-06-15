/**
 * Score decision state, pick support frame, suggest next step.
 */

import type {
  DecisionBlocker,
  DecisionConfidence,
  DecisionInput,
  DecisionSnapshot,
  DecisionState,
  DecisionSupportMethod,
} from "./types";
import {
  detectDecisionSignals,
  detectDecisionType,
  extractDecisionOptions,
  inferBlockers,
  signalStrength,
} from "./decisionSignals";

const RESEARCH_LOOPS = new Set([
  "research_loop",
  "planning_loop",
  "optimization_loop",
  "comparison_loop",
]);

const RECOVERY_STATUSES = new Set([
  "needs_support",
  "overloaded",
  "recovering",
]);

export function pickSupportMethod(
  blockers: DecisionBlocker[],
  input: DecisionInput,
): DecisionSupportMethod {
  const load = input.cognitiveLoadLevel;
  const loop = input.loopType;
  const health = input.userHealthStatus;

  if (
    load === "overloaded" ||
    blockers.includes("high_cognitive_load") ||
    (health && RECOVERY_STATUSES.has(health))
  ) {
    return "park_it";
  }
  if (blockers.includes("too_many_options")) {
    return "reduce_options";
  }
  if (
    loop && RESEARCH_LOOPS.has(loop) ||
    blockers.includes("too_much_information") ||
    blockers.includes("perfectionism")
  ) {
    return "good_enough_choice";
  }
  if (blockers.includes("fear_of_wrong_choice")) {
    return "reversible_vs_irreversible";
  }
  if (blockers.includes("unclear_goal")) {
    return "clarify_goal";
  }
  if (blockers.includes("low_energy") || input.dayEnergyLow) {
    return "energy_match";
  }
  if (input.activationState === "stuck" || input.activationState === "frozen") {
    return "energy_match";
  }
  if (blockers.includes("urgency_pressure")) {
    return "impact_effort_lens";
  }
  return "impact_effort_lens";
}

export function inferDecisionState(
  hits: ReturnType<typeof detectDecisionSignals>,
  blockers: DecisionBlocker[],
  input: DecisionInput,
): DecisionState {
  if (hits.some((h) => h.id === "decided")) return "decided";

  const strength = signalStrength(hits);
  if (!strength) return "clear";

  if (
    blockers.includes("high_cognitive_load") &&
    blockers.includes("too_many_options")
  ) {
    return "overloaded";
  }
  if (hits.some((h) => h.id === "avoiding")) return "avoiding";
  if (
    input.activationState === "stuck" ||
    input.activationState === "frozen" ||
    hits.some((h) => h.id === "cant_decide")
  ) {
    return "stuck";
  }
  if (strength >= 6) return "overloaded";
  if (strength >= 2) return "considering";
  return "clear";
}

export function buildSuggestedNextStep(
  method: DecisionSupportMethod,
  blockers: DecisionBlocker[],
  options: string[],
): string {
  switch (method) {
    case "reduce_options":
      return options.length >= 2
        ? `Narrow to: ${options.slice(0, 2).join(" or ")} — which feels lighter?`
        : "Name the two options that actually matter — park the rest.";
    case "clarify_goal":
      return "Ask: What are we trying to protect or achieve with this choice?";
    case "good_enough_choice":
      return "Pick a small test version you could try this week — not the final answer.";
    case "future_self_lens":
      return "Ask: Which option will Future You most appreciate a month from now?";
    case "energy_match":
      return "Choose the option that fits today's energy — not the hardest one.";
    case "impact_effort_lens":
      return "Compare impact, effort, urgency, and emotional cost — one line each.";
    case "reversible_vs_irreversible":
      return "Check: can this be changed later? If yes, a small test is enough.";
    case "park_it":
      return blockers.includes("high_cognitive_load")
        ? "Park the big decision — choose the next tiny action instead."
        : "If it's not urgent, park it safely and return when you have more capacity.";
    default:
      return "Name one criterion that matters most — then compare options against only that.";
  }
}

export function scoreDecision(
  input: DecisionInput,
  now = input.now ?? new Date(),
): DecisionSnapshot {
  const text = input.text?.trim() ?? "";
  const hits = detectDecisionSignals(text);
  const blockers = inferBlockers(input, hits);
  const decisionState = inferDecisionState(hits, blockers, input);
  const recommendedFrame = pickSupportMethod(blockers, input);
  const options = extractDecisionOptions(text);
  const strength = signalStrength(hits);

  const confidence: DecisionConfidence =
    strength >= 6 || blockers.length >= 2
      ? "high"
      : strength >= 3 || blockers.length >= 1
        ? "medium"
        : "low";

  return {
    decisionState,
    confidence,
    decisionType: detectDecisionType(text),
    options,
    blockers,
    recommendedFrame,
    suggestedNextStep: buildSuggestedNextStep(
      recommendedFrame,
      blockers,
      options,
    ),
    createdAt: now.toISOString(),
  };
}
