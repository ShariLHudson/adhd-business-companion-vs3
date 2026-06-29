/**
 * Response patterns — Shari test, no shame, no streak pressure.
 */

import type {
  EFResponsePattern,
  ExecutiveFunctionGuidance,
  ExecutiveFunctionState,
  RestartRecovery,
  TaskBreakdown,
  TinyNextStep,
} from "./types";

const AVOID_ALWAYS = [
  "you must",
  "you should have",
  "behind",
  "streak",
  "don't break",
  "hurry",
  "asap unless member asked",
  "failure",
  "lazy",
];

export function buildResponseGuidance(input: {
  state: ExecutiveFunctionState;
  pattern: EFResponsePattern;
  nextStep: TinyNextStep;
  taskBreakdown?: TaskBreakdown;
  restartRecovery?: RestartRecovery;
  singleRecommendation?: string;
  encouragement?: string;
}): ExecutiveFunctionGuidance {
  const {
    state,
    pattern,
    nextStep,
    taskBreakdown,
    restartRecovery,
    singleRecommendation,
    encouragement,
  } = input;

  let composeGuidance = "";
  let memberFacingLead: string | undefined;

  switch (pattern) {
    case "empathy_then_one_step":
      memberFacingLead =
        "That sounds like a lot to carry. We don't need to fix everything today.";
      composeGuidance =
        "Empathy first. One small next step only. No lists unless asked.";
      break;
    case "phased_project":
      memberFacingLead =
        "Let's break this into phases — you only need the first tiny piece today.";
      composeGuidance =
        "Offer phases internally; member sees first action only unless they ask for the full map.";
      break;
    case "starting_point":
      memberFacingLead = "Here's a place to start — not a lecture.";
      composeGuidance = "One starting point. No framework dump. Invite motion.";
      break;
    case "welcome_back":
      memberFacingLead = restartRecovery?.welcomeCopy;
      composeGuidance =
        "Welcome back without guilt. Resume where we left off. No catch-up shame.";
      break;
    case "single_recommendation":
      memberFacingLead = singleRecommendation;
      composeGuidance = "One clear recommendation — not a menu of options.";
      break;
    case "gentle_encouragement":
      memberFacingLead = encouragement;
      composeGuidance = "Encourage with evidence from their context — no empty hype.";
      break;
  }

  if (nextStep.effort?.phrase) {
    composeGuidance += ` ${nextStep.effort.phrase}`;
  }

  if (state.singleRecommendationOnly) {
    composeGuidance += " Do not offer multiple paths — one recommendation only.";
  }

  return {
    pattern,
    composeGuidance: composeGuidance.trim(),
    memberFacingLead,
    nextStep,
    taskBreakdown,
    restartRecovery,
    effortEstimate: nextStep.effort,
    avoid: AVOID_ALWAYS,
    integrationHints: [],
  };
}

export function groundedEncouragement(input: {
  openLoopCount?: number;
  returnedAfterAbsence?: boolean;
  priorWin?: string;
}): string {
  if (input.returnedAfterAbsence) {
    return "Showing up again is the hard part — you're already moving.";
  }
  if (input.priorWin) {
    return `You already proved you can finish things — like when you ${input.priorWin}.`;
  }
  if (input.openLoopCount && input.openLoopCount > 0) {
    return "You don't need a clean slate — one small close counts.";
  }
  return "One step is enough for today.";
}
