/**
 * Decision Complexity Score™ — how much discovery a decision needs.
 */

import type { ChatTurn } from "../companionIntelligence";
import { countAssistantQuestions } from "../companionActionBias";
import type { DecisionComplexityLevel, DecisionComplexityScore } from "./types";

const PRODUCT_EXPANSION_RE =
  /\b(?:new product(?:\s+line)?|add(?:ing)? (?:a )?(?:new )?(?:product|offer|service|line)|second (?:product|offer)|expand(?:ing)? (?:my )?(?:product|offer|line)|group program|launch (?:a )?new)\b/i;

const SIMPLE_RECOMMENDATION_RE =
  /\b(?:what(?:'s| is) the best (?:tool|app|time)|quick tip|simple answer|just tell me)\b/i;

const HIGH_STAKES_RE =
  /\b(?:worried|afraid|risk|devalue|lose (?:clients|customers|revenue)|replace(?:ing)? (?:my )?(?:current|existing)|pricing|revenue|customer satisfaction|market validation)\b/i;

const CONTEXT_SIGNALS: { key: string; re: RegExp }[] = [
  { key: "current_offer", re: /\b(?:current(?:ly)? sell|existing (?:product|offer|clients?)|my (?:coaching|course|service))\b/i },
  { key: "new_offer", re: /\b(?:new (?:product|offer|line|program)|group program|second offer)\b/i },
  { key: "audience", re: /\b(?:clients?|customers?|audience|entrepreneur|buyers?)\b/i },
  { key: "pricing", re: /\b(?:price|pricing|half the price|\$\d+)\b/i },
  { key: "risk", re: /\b(?:worried|afraid|risk|devalue|lose)\b/i },
  { key: "goals", re: /\b(?:grow|revenue|replace|keep both|phase)\b/i },
];

function countContextSignals(messages: ChatTurn[]): number {
  const text = messages.map((m) => m.content).join("\n");
  return CONTEXT_SIGNALS.filter(({ re }) => re.test(text)).length;
}

function inferLevel(input: {
  userText: string;
  messages: ChatTurn[];
  questionCount: number;
  contextSignals: number;
}): { level: DecisionComplexityLevel; score: number; rationale: string[] } {
  const t = input.userText.trim();
  const rationale: string[] = [];

  if (SIMPLE_RECOMMENDATION_RE.test(t) && !PRODUCT_EXPANSION_RE.test(t)) {
    rationale.push("User asked for a simple recommendation.");
    return { level: "low", score: 22, rationale };
  }

  const expansion = PRODUCT_EXPANSION_RE.test(t) ||
    messagesMentionExpansion(input.messages);
  const highStakes = HIGH_STAKES_RE.test(t) ||
    input.messages.some((m) => HIGH_STAKES_RE.test(m.content));

  if (expansion) {
    rationale.push("Product or offer expansion detected.");
    if (highStakes) rationale.push("Customer, pricing, or revenue risk present.");
    if (input.contextSignals >= 4) {
      rationale.push("Sufficient business context gathered.");
      return { level: "high", score: 82, rationale };
    }
    if (input.contextSignals >= 2 || input.questionCount >= 2) {
      rationale.push("Partial context — structured decision support appropriate.");
      return { level: "high", score: 74, rationale };
    }
    rationale.push("Early expansion mention — discovery required first.");
    return { level: "medium", score: 58, rationale };
  }

  if (highStakes || /\b(?:should i|stuck between|can'?t decide)\b/i.test(t)) {
    rationale.push("Decision with meaningful downside.");
    if (input.contextSignals >= 3) {
      return { level: "high", score: 70, rationale };
    }
    return { level: "medium", score: 52, rationale };
  }

  if (input.questionCount >= 2 && input.contextSignals >= 2) {
    rationale.push("Enough thread context for decision support.");
    return { level: "medium", score: 48, rationale };
  }

  rationale.push("Straightforward or early-turn request.");
  return { level: "low", score: 30, rationale };
}

function messagesMentionExpansion(messages: ChatTurn[]): boolean {
  return messages.some((m) => PRODUCT_EXPANSION_RE.test(m.content));
}

function targetQuestionsForLevel(level: DecisionComplexityLevel): number {
  switch (level) {
    case "low":
      return 0;
    case "medium":
      return 3;
    case "high":
      return 4;
  }
}

export function scoreDecisionComplexity(input: {
  messages: ChatTurn[];
  userText: string;
}): DecisionComplexityScore {
  const questionCount = countAssistantQuestions(input.messages);
  const contextSignals = countContextSignals(input.messages);
  const { level, score, rationale } = inferLevel({
    userText: input.userText,
    messages: input.messages,
    questionCount,
    contextSignals,
  });
  const targetDiscoveryQuestions = targetQuestionsForLevel(level);
  const discoveryComplete =
    level === "low" ||
    (questionCount >= Math.min(2, targetDiscoveryQuestions) &&
      contextSignals >= 2) ||
    questionCount >= targetDiscoveryQuestions;

  return {
    level,
    score,
    targetDiscoveryQuestions,
    discoveryQuestionsAsked: questionCount,
    discoveryComplete,
    rationale,
  };
}
