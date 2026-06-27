/**
 * Money Intelligence — ADHD Entrepreneur Behavioral Framework
 */

import type { ChatTurn } from "./companionIntelligence";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";

export type MoneyAdhdPattern =
  | "financial_avoidance"
  | "pricing_guilt"
  | "revenue_anxiety"
  | "money_avoidance_loop"
  | "pricing_confidence_gap";

export type MoneyIntelligenceAnalysis = {
  inMoneyContext: boolean;
  patterns: MoneyAdhdPattern[];
  primaryPattern: MoneyAdhdPattern | null;
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  adhdTranslation: string;
};

export const MONEY_SCORECARD_THRESHOLDS = {
  understanding: 85,
  trust: 85,
  confidence: 85,
  momentum: 80,
  action: 85,
  routing: 80,
  overanalysis: 90,
  adhdAlignment: 90,
} as const;

const MONEY_CONTEXT_RE =
  /\b(?:revenue|money|pricing|rates?|charge|invoice|expenses?|profit|financial|numbers|income|cash flow|bookkeeping)\b/i;

const PATTERN_RULES: { pattern: MoneyAdhdPattern; re: RegExp }[] = [
  {
    pattern: "financial_avoidance",
    re: /\b(?:haven'?t looked at|avoiding (?:my )?(?:numbers|revenue|books)|scared to (?:look|open)|don'?t want to see)\b/i,
  },
  {
    pattern: "pricing_guilt",
    re: /\b(?:feel bad charging|guilty (?:about|charging)|too much to charge|not worth that much)\b/i,
  },
  {
    pattern: "revenue_anxiety",
    re: /\b(?:this month (?:is|was) terrible|slow month|inconsistent revenue|income dropped|not making enough)\b/i,
  },
  {
    pattern: "money_avoidance_loop",
    re: /\b(?:avoiding (?:invoices|expenses|bookkeeping)|keep putting off (?:invoices|my books)|haven'?t sent (?:invoices|bills))\b/i,
  },
  {
    pattern: "pricing_confidence_gap",
    re: /\b(?:raise my rates?|need to raise|not sure (?:what|if) to charge|undercharg)\b/i,
  },
];

const NEED_BY_PATTERN: Partial<Record<MoneyAdhdPattern, ActualNeed>> = {
  financial_avoidance: "start_execution",
  pricing_guilt: "build_confidence",
  revenue_anxiety: "build_confidence",
  money_avoidance_loop: "start_execution",
  pricing_confidence_gap: "make_decision",
};

const MOVE_BY_PATTERN: Record<MoneyAdhdPattern, string> = {
  financial_avoidance:
    "Reduce emotional resistance — one tiny numbers glance or one figure, not a financial planning project.",
  pricing_guilt:
    "Explore value delivered without shame — reconnect to outcomes clients get, not guilt math.",
  revenue_anxiety:
    "Separate this month's result from identity — one controllable action, not catastrophe thinking.",
  money_avoidance_loop:
    "Smallest possible financial action — one invoice, one expense line, or open the dashboard for 60 seconds.",
  pricing_confidence_gap:
    "Help decide if a raise is justified — support the conversation, avoid complex pricing models.",
};

export function analyzeMoneyIntelligence(input: {
  userText: string;
  messages: ChatTurn[];
}): MoneyIntelligenceAnalysis | null {
  const haystack = [
    ...input.messages.filter((m) => m.role === "user").map((m) => m.content),
    input.userText,
  ].join(" ");

  if (!MONEY_CONTEXT_RE.test(haystack) && !PATTERN_RULES.some((r) => r.re.test(input.userText))) {
    return null;
  }

  const patterns = PATTERN_RULES.filter((r) => r.re.test(haystack)).map((r) => r.pattern);
  const primaryPattern = patterns[0] ?? null;
  const actualNeed = primaryPattern ? NEED_BY_PATTERN[primaryPattern] ?? "make_decision" : null;
  const signals: IntuitiveSignal[] = [];
  if (patterns.includes("financial_avoidance") || patterns.includes("money_avoidance_loop")) {
    signals.push("avoidance", "resistance");
  }
  if (patterns.includes("pricing_guilt") || patterns.includes("revenue_anxiety")) {
    signals.push("discouragement", "hesitation");
  }
  if (patterns.includes("pricing_confidence_gap")) {
    signals.push("hesitation");
  }

  const companionMove = primaryPattern
    ? MOVE_BY_PATTERN[primaryPattern]
    : "Money stress is often fear — one small, shame-free financial step.";

  return {
    inMoneyContext: MONEY_CONTEXT_RE.test(haystack),
    patterns,
    primaryPattern,
    actualNeed,
    signals,
    companionMove,
    adhdTranslation:
      "Knowledge is rarely the blocker — reduce fear, guilt, and executive friction around money.",
  };
}

export function mergeMoneyIntoIntuitive(input: {
  money: MoneyIntelligenceAnalysis;
  existingSignals: IntuitiveSignal[];
  existingActualNeed: ActualNeed | null;
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
} {
  const signals = [...new Set([...input.existingSignals, ...input.money.signals])];
  return {
    signals,
    actualNeed: input.money.actualNeed ?? input.existingActualNeed,
    companionMove: input.money.companionMove,
  };
}
