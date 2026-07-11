/**
 * Spec 131 — Outcome Discovery
 * Hidden intent is the why. Outcome is what success looks like when it works.
 *
 * Rule: Ask outcome questions before solution questions.
 *
 * @see docs/SPARK_WISDOM_LAYER_FRAMEWORK.md#spec-131--outcome-discovery
 */

import type { HiddenIntentHypothesis } from "@/lib/sparkConversation/hiddenIntent";
import { detectHiddenIntent } from "@/lib/sparkConversation/hiddenIntent";

export const OUTCOME_BEFORE_SOLUTION_RULE =
  "Ask what success looks like before discussing tools, templates, steps, or deliverables." as const;

export const OUTCOME_DISCOVERY_QUESTION =
  "What would success look like for you when this is working?" as const;

export type OutcomeDiscoveryResult = {
  patternId: string | null;
  hiddenGoal: string | null;
  hopedSuccess: string;
  outcomeQuestion: string;
  avoidYet: string[];
  rationale: string;
};

const OUTCOME_BY_PATTERN: Record<
  string,
  {
    hopedSuccess: string;
    outcomeQuestions: string[];
    avoidYet: string[];
  }
> = {
  sop: {
    hopedSuccess:
      "Someone runs this without you — fewer repeat questions, more of your time back",
    outcomeQuestions: [
      "If this were working perfectly, who would handle it without coming back to you?",
      "What would be different day-to-day once they're truly independent?",
      "When you picture this solved, what stops landing on your plate?",
    ],
    avoidYet: ["SOP outline", "step lists", "process templates"],
  },
  newsletter: {
    hopedSuccess:
      "Readers feel known and trust you before they're ready to buy",
    outcomeQuestions: [
      "When someone finishes reading you, what should they feel?",
      "What would make you trust a business before you bought from them?",
      "If this worked in six months, how would you know it's building real connection?",
    ],
    avoidYet: ["email platform picks", "cadence calendars", "subject line formulas"],
  },
  pricing: {
    hopedSuccess:
      "You state your price calmly and believe it's fair for what you deliver",
    outcomeQuestions: [
      "If pricing felt settled, what would you say on your next sales conversation?",
      "What would 'fair and confident' look like in your body — not just on paper?",
      "When this is working, what changes about how you talk about money?",
    ],
    avoidYet: ["pricing tiers", "formulas", "competitor rate tables"],
  },
  website: {
    hopedSuccess:
      "A stranger quickly understands what you do and takes the right next step",
    outcomeQuestions: [
      "In the first ten seconds, what should someone understand or feel?",
      "If the site worked perfectly, what would a visitor do next?",
      "What would 'taken seriously' look like — a booking, a reply, something else?",
    ],
    avoidYet: ["page wireframes", "builders", "homepage sections"],
  },
  marketing: {
    hopedSuccess:
      "The right people understand why your business is different — and lean in",
    outcomeQuestions: [
      "If marketing were working, who would finally 'get' what makes you different?",
      "What would they say back to you that would tell you it's landing?",
      "When this succeeds, what changes about how people find you or refer you?",
    ],
    avoidYet: ["channel lists", "content calendars", "funnel maps"],
  },
  generic_need: {
    hopedSuccess: "The real problem behind the deliverable is solved — not just the document exists",
    outcomeQuestions: [
      "If this worked perfectly, what would be different for you?",
      "What would success look like a month from now?",
      "Beyond having the thing, what changes in your day or business?",
    ],
    avoidYet: ["templates", "outlines", "tool recommendations"],
  },
};

const GENERIC_OUTCOME: (typeof OUTCOME_BY_PATTERN)["generic_need"] =
  OUTCOME_BY_PATTERN.generic_need;

function pickOutcomeQuestion(questions: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return questions[hash % questions.length];
}

export function discoverOutcome(
  message: string,
  hiddenIntent: HiddenIntentHypothesis | null,
): OutcomeDiscoveryResult {
  const intent = hiddenIntent ?? detectHiddenIntent(message);
  const patternId = intent?.patternId ?? null;
  const entry =
    (patternId && OUTCOME_BY_PATTERN[patternId]) || GENERIC_OUTCOME;

  const outcomeQuestion = pickOutcomeQuestion(
    entry.outcomeQuestions,
    message.trim().toLowerCase(),
  );

  return {
    patternId,
    hiddenGoal: intent?.hiddenGoal ?? null,
    hopedSuccess: entry.hopedSuccess,
    outcomeQuestion,
    avoidYet: entry.avoidYet,
    rationale: OUTCOME_BEFORE_SOLUTION_RULE,
  };
}

export function summarizeOutcomeDiscovery(result: OutcomeDiscoveryResult): string {
  return `Outcome: ${result.hopedSuccess}`;
}

export function buildOutcomeDiscoveryPromptBlock(
  result: OutcomeDiscoveryResult,
): string {
  return [
    "OUTCOME DISCOVERY (Spec 131):",
    `Hoped success: ${result.hopedSuccess}`,
    `Ask this outcome question (before any solution talk): ${result.outcomeQuestion}`,
    `Do NOT discuss yet: ${result.avoidYet.join(", ")}`,
    OUTCOME_BEFORE_SOLUTION_RULE,
  ].join(" ");
}
