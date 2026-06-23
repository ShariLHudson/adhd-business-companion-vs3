/**
 * Launch Intelligence™ — ADHD Entrepreneur Behavioral Framework™
 */

import type { ChatTurn } from "./companionIntelligence";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";

export type LaunchAdhdPattern =
  | "launch_avoidance"
  | "launch_perfectionism"
  | "launch_panic"
  | "post_launch_crash"
  | "launch_abandonment";

export type LaunchIntelligenceAnalysis = {
  inLaunchContext: boolean;
  patterns: LaunchAdhdPattern[];
  primaryPattern: LaunchAdhdPattern | null;
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  adhdTranslation: string;
};

export const LAUNCH_SCORECARD_THRESHOLDS = {
  understanding: 85,
  trust: 85,
  confidence: 85,
  momentum: 80,
  action: 85,
  routing: 80,
  overanalysis: 90,
  adhdAlignment: 90,
} as const;

const LAUNCH_CONTEXT_RE =
  /\b(?:launch(?:ing|ed)?|ship|go live|release|open (?:cart|enrollment)|start selling|publish (?:my )?offer)\b/i;

const PATTERN_RULES: { pattern: LaunchAdhdPattern; re: RegExp }[] = [
  {
    pattern: "launch_avoidance",
    re: /\b(?:almost ready|not quite ready to launch|one more thing before|before i launch|just need to tweak)\b/i,
  },
  {
    pattern: "launch_perfectionism",
    re: /\b(?:just one more (?:thing|tweak|improvement)|has to be perfect before|not ready yet)\b/i,
  },
  {
    pattern: "launch_panic",
    re: /\b(?:what if nobody (?:buys|shows up)|scared to launch|afraid (?:to|no one will))\b/i,
  },
  {
    pattern: "post_launch_crash",
    re: /\b(?:don'?t know what to do now|after the launch|now that it'?s live|what do i do next)\b/i,
  },
  {
    pattern: "launch_abandonment",
    re: /\b(?:disappeared during (?:the )?launch|sorry i vanished|stopped mid[- ]launch|abandoned the launch)\b/i,
  },
];

const NEED_BY_PATTERN: Partial<Record<LaunchAdhdPattern, ActualNeed>> = {
  launch_avoidance: "launch_move",
  launch_perfectionism: "launch_move",
  launch_panic: "build_confidence",
  post_launch_crash: "clarify_direction",
  launch_abandonment: "start_execution",
};

const MOVE_BY_PATTERN: Record<LaunchAdhdPattern, string> = {
  launch_avoidance:
    "Test if blockers are real — move toward launch with the smallest exposed step.",
  launch_perfectionism:
    "Define launch-ready — prevent endless improvement loops.",
  launch_panic:
    "Normalize uncertainty — confidence and expectation management, then one launch action.",
  post_launch_crash:
    "Protect confidence — create a gentle re-entry path and one next step.",
  launch_abandonment:
    "No-shame re-entry — resume the launch thread where they left off.",
};

export function analyzeLaunchIntelligence(input: {
  userText: string;
  messages: ChatTurn[];
}): LaunchIntelligenceAnalysis | null {
  const haystack = [
    ...input.messages.filter((m) => m.role === "user").map((m) => m.content),
    input.userText,
  ].join(" ");

  if (
    !LAUNCH_CONTEXT_RE.test(haystack) &&
    !PATTERN_RULES.some((r) => r.re.test(input.userText))
  ) {
    return null;
  }

  const patterns = PATTERN_RULES.filter((r) => r.re.test(haystack)).map((r) => r.pattern);
  const primaryPattern = patterns[0] ?? null;
  const actualNeed = primaryPattern ? NEED_BY_PATTERN[primaryPattern] ?? "launch_move" : null;
  const signals: IntuitiveSignal[] = [];
  if (
    patterns.includes("launch_avoidance") ||
    patterns.includes("launch_perfectionism")
  ) {
    signals.push("avoidance");
  }
  if (patterns.includes("launch_panic")) {
    signals.push("resistance", "hesitation");
  }
  if (patterns.includes("post_launch_crash")) {
    signals.push("discouragement", "hesitation");
  }
  if (patterns.includes("launch_abandonment")) {
    signals.push("discouragement");
  }

  const companionMove = primaryPattern
    ? MOVE_BY_PATTERN[primaryPattern]
    : "Launch friction is usually fear of visibility — shrink the next launch step.";

  return {
    inLaunchContext: LAUNCH_CONTEXT_RE.test(haystack),
    patterns,
    primaryPattern,
    actualNeed,
    signals,
    companionMove,
    adhdTranslation:
      "Launch delays are rarely missing knowledge — fear, perfectionism, and visibility anxiety.",
  };
}

export function mergeLaunchIntoIntuitive(input: {
  launch: LaunchIntelligenceAnalysis;
  existingSignals: IntuitiveSignal[];
  existingActualNeed: ActualNeed | null;
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
} {
  const signals = [...new Set([...input.existingSignals, ...input.launch.signals])];
  return {
    signals,
    actualNeed: input.launch.actualNeed ?? input.existingActualNeed,
    companionMove: input.launch.companionMove,
  };
}
