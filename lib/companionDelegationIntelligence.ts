/**
 * Delegation Intelligence — ADHD Entrepreneur Behavioral Framework
 */

import type { ChatTurn } from "./companionIntelligence";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";

export type DelegationAdhdPattern =
  | "control_bias"
  | "delegation_resistance"
  | "perfectionism_control"
  | "trust_resistance"
  | "team_communication_avoidance";

export type DelegationIntelligenceAnalysis = {
  inDelegationContext: boolean;
  patterns: DelegationAdhdPattern[];
  primaryPattern: DelegationAdhdPattern | null;
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  adhdTranslation: string;
};

export const DELEGATION_SCORECARD_THRESHOLDS = {
  understanding: 85,
  trust: 85,
  confidence: 85,
  momentum: 80,
  action: 85,
  routing: 80,
  overanalysis: 90,
  adhdAlignment: 90,
} as const;

const DELEGATION_CONTEXT_RE =
  /\b(?:delegat|va\b|virtual assistant|team|hire|hand off|handoff|outsource|contractor|employee|explain it to)\b/i;

const PATTERN_RULES: { pattern: DelegationAdhdPattern; re: RegExp }[] = [
  {
    pattern: "delegation_resistance",
    re: /\b(?:takes longer to explain|easier to (?:just )?do it myself|faster if i do it|not worth explaining)\b/i,
  },
  {
    pattern: "control_bias",
    re: /\b(?:need to control|can'?t let go|only i can|have to do it myself)\b/i,
  },
  {
    pattern: "perfectionism_control",
    re: /\b(?:no one does it right|not done right|redo it|fix their work|micromanage)\b/i,
  },
  {
    pattern: "trust_resistance",
    re: /\b(?:delegated and it went badly|they messed up|bad experience delegating|won'?t trust)\b/i,
  },
  {
    pattern: "team_communication_avoidance",
    re: /\b(?:don'?t know how to tell them|hard to explain what i want|avoiding (?:the )?conversation with|unclear expectations)\b/i,
  },
];

const NEED_BY_PATTERN: Partial<Record<DelegationAdhdPattern, ActualNeed>> = {
  delegation_resistance: "make_decision",
  control_bias: "make_decision",
  perfectionism_control: "reduce_complexity",
  trust_resistance: "build_confidence",
  team_communication_avoidance: "start_execution",
};

const MOVE_BY_PATTERN: Record<DelegationAdhdPattern, string> = {
  delegation_resistance:
    "Identify one low-risk task to delegate — do not push full delegation or hiring systems.",
  control_bias:
    "Challenge the assumption gently — find one task that truly does not need you.",
  perfectionism_control:
    "Define acceptable outcomes, not perfect outcomes — good enough delegation counts.",
  trust_resistance:
    "Diagnose what failed without abandoning delegation — one smaller retry with clearer brief.",
  team_communication_avoidance:
    "Help draft simple expectations — reduce emotional resistance to the conversation.",
};

export function analyzeDelegationIntelligence(input: {
  userText: string;
  messages: ChatTurn[];
}): DelegationIntelligenceAnalysis | null {
  const haystack = [
    ...input.messages.filter((m) => m.role === "user").map((m) => m.content),
    input.userText,
  ].join(" ");

  if (
    !DELEGATION_CONTEXT_RE.test(haystack) &&
    !PATTERN_RULES.some((r) => r.re.test(input.userText))
  ) {
    return null;
  }

  const patterns = PATTERN_RULES.filter((r) => r.re.test(haystack)).map((r) => r.pattern);
  const primaryPattern = patterns[0] ?? null;
  const actualNeed = primaryPattern ? NEED_BY_PATTERN[primaryPattern] ?? "make_decision" : null;
  const signals: IntuitiveSignal[] = [];
  if (
    patterns.includes("delegation_resistance") ||
    patterns.includes("control_bias")
  ) {
    signals.push("resistance");
  }
  if (patterns.includes("perfectionism_control")) signals.push("resistance", "avoidance");
  if (patterns.includes("trust_resistance")) signals.push("discouragement");
  if (patterns.includes("team_communication_avoidance")) {
    signals.push("hesitation", "resistance");
  }

  const companionMove = primaryPattern
    ? MOVE_BY_PATTERN[primaryPattern]
    : "Delegation friction is usually trust and control — one low-risk handoff.";

  return {
    inDelegationContext: DELEGATION_CONTEXT_RE.test(haystack),
    patterns,
    primaryPattern,
    actualNeed,
    signals,
    companionMove,
    adhdTranslation:
      "Delegation blocks are emotional — perfectionism, control, trust — not missing SOPs.",
  };
}

export function mergeDelegationIntoIntuitive(input: {
  delegation: DelegationIntelligenceAnalysis;
  existingSignals: IntuitiveSignal[];
  existingActualNeed: ActualNeed | null;
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
} {
  const signals = [...new Set([...input.existingSignals, ...input.delegation.signals])];
  return {
    signals,
    actualNeed: input.delegation.actualNeed ?? input.existingActualNeed,
    companionMove: input.delegation.companionMove,
  };
}
