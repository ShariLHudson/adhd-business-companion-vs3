import type {
  SparkDecisionFrictionType,
  SparkLeaveBetterOutcome,
  SparkPrimaryIntent,
} from "./types";

export function targetLeaveBetterOutcomes(input: {
  intent: SparkPrimaryIntent;
  friction: SparkDecisionFrictionType;
}): SparkLeaveBetterOutcome[] {
  const outcomes = new Set<SparkLeaveBetterOutcome>();

  switch (input.intent) {
    case "CREATE":
      outcomes.add("better_work");
      outcomes.add("more_momentum");
      break;
    case "THINK":
      outcomes.add("more_clarity");
      outcomes.add("better_decision");
      break;
    case "SUPPORT":
      outcomes.add("less_shame");
      outcomes.add("better_perspective");
      break;
    case "LEARN":
      outcomes.add("better_understanding");
      break;
    case "EXPLORE":
      outcomes.add("more_clarity");
      break;
  }

  if (input.friction === "confidence") outcomes.add("better_perspective");
  if (input.friction === "capacity") outcomes.add("better_rest");
  if (input.friction === "emotional_weight") outcomes.add("less_shame");
  if (input.friction === "clarity") outcomes.add("more_clarity");
  if (input.friction === "momentum") outcomes.add("more_momentum");

  if (outcomes.size === 0) outcomes.add("more_clarity");

  return [...outcomes];
}

export function extractLearningSignals(userText: string): string[] {
  const text = userText.trim();
  const signals: string[] = [];

  if (/\b(?:example|show me an example|like when)\b/i.test(text)) {
    signals.push("prefers examples");
  }
  if (/\b(?:visual|diagram|map|draw)\b/i.test(text)) {
    signals.push("visual thinker");
  }
  if (/\b(?:direct|straight|just tell me)\b/i.test(text)) {
    signals.push("likes direct feedback");
  }
  if (/\b(?:listen first|don'?t rush|just hear me)\b/i.test(text)) {
    signals.push("needs listening before solutions");
  }
  if (/\b(?:brainstorm|talk it through|out loud)\b/i.test(text)) {
    signals.push("decides verbally / brainstorms");
  }

  return signals;
}

export function anticipateNaturalNext(input: {
  userText: string;
  intent: SparkPrimaryIntent;
}): string[] {
  const text = input.userText.trim();
  const hints: string[] = [];

  if (/\b(?:sop|standard operating)\b/i.test(text) && input.intent === "CREATE") {
    hints.push(
      "After SOP complete (if member accepts): PDF · print · training checklist — one offer only",
    );
  }

  if (/\b(?:newsletter|email|proposal)\b/i.test(text)) {
    hints.push("After draft ready: permission to review · export — never auto-save claim");
  }

  if (/\b(?:hours|all day|long session)\b/i.test(text)) {
    hints.push("Natural follow: water · stretch · Coffee House break — one gentle suggestion");
  }

  if (input.intent === "SUPPORT" && /\b(?:done|finished|better)\b/i.test(text)) {
    hints.push("After support: one small next step OR permission to rest — member chooses");
  }

  return hints;
}
