/**
 * Decision fatigue reducer — one clear recommendation, tradeoff when needed.
 */

import type { DecisionReduction } from "./types";

export function reduceDecisionFatigue(message: string): DecisionReduction | undefined {
  const lower = message.toLowerCase();

  if (!/\b(which|should i|decide|choose|option|or )\b/i.test(lower)) {
    return undefined;
  }

  if (/\b(price|pricing|raise|lower)\b/i.test(lower)) {
    return {
      question: "Pricing direction",
      recommendedOptionId: "test-small",
      rationale:
        "Run a small test with your warmest buyers before changing the main price.",
      tradeoffNote:
        "Holding price protects margin; testing learns faster than guessing.",
    };
  }

  if (/\b(focus on|priorit|which project)\b/i.test(lower)) {
    return {
      question: "What to focus on",
      recommendedOptionId: "revenue-nearest",
      rationale:
        "Pick the project closest to revenue or relief — the one that unblocks other work.",
      tradeoffNote: "Everything matters; one thread moves first.",
    };
  }

  if (/\b(platform|tool|software)\b/i.test(lower)) {
    return {
      question: "Tool choice",
      recommendedOptionId: "good-enough",
      rationale:
        "Choose the option you'll actually use this week — good enough beats perfect.",
    };
  }

  return {
    question: "Next decision",
    recommendedOptionId: "smallest-commitment",
    rationale:
      "Choose the path with the smallest reversible step — you can adjust once you have data.",
  };
}
