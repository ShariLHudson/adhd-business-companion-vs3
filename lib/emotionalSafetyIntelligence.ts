/**
 * P0.60 — Emotional Safety Layer™ + Intelligence Guardrails
 *
 * Ensures all intelligence systems remain supportive, calm, non-judgmental,
 * and trust-building — even when delivering honest insights.
 */

import { sanitizeUserFacingMessage } from "./trustSafeCommunication";

export type IntelligenceSystemId =
  | "memory"
  | "growth"
  | "future_impact"
  | "pattern"
  | "resilience";

export type EmotionalSafetyViolationId =
  | "shame"
  | "blame"
  | "failure_framing"
  | "comparison"
  | "pressure"
  | "should_have"
  | "always_never"
  | "inadequacy"
  | "wrong_behavior";

export type EmotionalSafetyCheckResult = {
  safe: boolean;
  violations: EmotionalSafetyViolationId[];
  rewritten: boolean;
  message: string;
};

/** Core filter question — insights must pass before display. */
export const EMOTIONAL_SAFETY_FILTER_QUESTION =
  "Does this help the user feel capable, supported, and safe to continue?";

export const EMOTIONAL_SAFETY_CORE_RULE = `EMOTIONAL SAFETY LAYER™ (P0.60 — non-negotiable):
Never shame, blame, criticize behavior, imply failure or inadequacy, compare to others, create guilt or urgency pressure, use "should have" language, or frame behavior as wrong — even when data suggests difficult patterns.
Filter: "${EMOTIONAL_SAFETY_FILTER_QUESTION}" If NO → rewrite or suppress.
Preserve agency: "Would you like…", "If helpful…", "We can…", "You might find it useful…"`;

const VIOLATION_PATTERNS: {
  id: EmotionalSafetyViolationId;
  patterns: RegExp[];
}[] = [
  {
    id: "shame",
    patterns: [
      /\byou(?:'re| are) behind\b/i,
      /\byou(?:'re| are) (?:inconsistent|lazy|unproductive|failing)\b/i,
      /\byou(?:'re| are) not doing enough\b/i,
      /\bnot good enough\b/i,
      /\byou should have more by now\b/i,
    ],
  },
  {
    id: "blame",
    patterns: [
      /\byou failed to\b/i,
      /\byou didn'?t complete\b/i,
      /\byou never follow through\b/i,
      /\bbecause you didn'?t\b/i,
      /\byour fault\b/i,
    ],
  },
  {
    id: "failure_framing",
    patterns: [
      /\byou failed\b/i,
      /\byou(?:'re| are) failing\b/i,
      /\blikely to fail\b/i,
      /\byou(?:'ve| have) given up\b/i,
      /\bstreak lost\b/i,
      /\bfalling behind\b/i,
    ],
  },
  {
    id: "comparison",
    patterns: [
      /\bother people\b/i,
      /\bmost (?:people|founders|entrepreneurs)\b/i,
      /\beveryone else\b/i,
      /\bcompared to others\b/i,
      /\bothers seem to\b/i,
    ],
  },
  {
    id: "pressure",
    patterns: [
      /\byou must\b/i,
      /\byou need to (?:immediately|right now|urgently)\b/i,
      /\bbefore it'?s too late\b/i,
      /\brunning out of time\b/i,
      /\bor you will\b/i,
    ],
  },
  {
    id: "should_have",
    patterns: [/\byou should have\b/i, /\byou could have done\b/i],
  },
  {
    id: "always_never",
    patterns: [
      /\byou always\b/i,
      /\byou never\b/i,
      /\bevery time you\b/i,
    ],
  },
  {
    id: "inadequacy",
    patterns: [
      /\byou(?:'re| are) not trying\b/i,
      /\byou(?:'re| are) avoiding\b/i,
      /\bthis is wrong\b/i,
      /\bwrong approach\b/i,
    ],
  },
];

const REPLACEMENT_RULES: [RegExp, string][] = [
  [/\byou(?:'re| are) behind\b/gi, "this area has been quieter than usual"],
  [/\byou failed to\b/gi, "this hasn't had activity recently"],
  [/\byou didn'?t complete\b/gi, "this hasn't been updated in a while"],
  [/\byou(?:'re| are) inconsistent\b/gi, "this pattern tends to vary"],
  [/\byou always\b/gi, "this often happens"],
  [/\byou never\b/gi, "this tends not to happen yet"],
  [/\byou should have\b/gi, "if helpful, you might"],
  [/\byou must\b/gi, "you might find it useful to"],
  [/\byou need to (?:immediately|right now)\b/gi, "when you're ready, you could"],
  [/\bnot doing enough\b/gi, "there may be room to add more when it feels right"],
  [/\blikely to fail\b/gi, "may take longer at the current pace"],
  [/\bfalling behind\b/gi, "moving at a slower pace than planned"],
  [/\bstalled\b/gi, "quieter than usual"],
  [
    /\bneeds a small supporting action\b/gi,
    "may be a good place to refocus if it feels important",
  ],
  [/\bStalled —/gi, "Quieter lately —"],
];

const SYSTEM_GUARDRAILS: Record<IntelligenceSystemId, string> = {
  memory:
    "MEMORY INTELLIGENCE™: Store facts neutrally. Never interpret negatively. Never label user behavior as failure.",
  growth:
    'GROWTH INTELLIGENCE™: Focus on movement and change — not expectations or lagging. Example: "You\'ve added 12 new assets this month" — never "You should have more by now."',
  future_impact:
    'FUTURE IMPACT INTELLIGENCE™: Never predict failure as certainty. Never urgency threats. Present multiple paths. Example: "At the current pace, this may take longer unless priorities shift."',
  pattern:
    'PATTERN INTELLIGENCE™: Avoid "always" or "never". Use neutral language. Example: "This tends to happen when multiple projects are active."',
  resilience:
    "RESILIENCE INTELLIGENCE™: Acknowledge emotion first. Offer choice — never force. Ask permission before sharing past perspective.",
};

export const PERMISSION_FIRST_SENSITIVE_INSIGHT =
  "Would it help if I shared something I've noticed from your past that might give you perspective?";

export const PERMISSION_FIRST_RESILIENCE_CHOICE =
  "Would you like perspective from your past, or help simplifying what's in front of you?";

export function detectEmotionalSafetyViolations(
  text: string,
): EmotionalSafetyViolationId[] {
  const found = new Set<EmotionalSafetyViolationId>();
  for (const group of VIOLATION_PATTERNS) {
    if (group.patterns.some((re) => re.test(text))) {
      found.add(group.id);
    }
  }
  return [...found];
}

export function passesEmotionalSafetyFilter(text: string): boolean {
  return detectEmotionalSafetyViolations(text).length === 0;
}

export function applyEmotionalSafetyRewrites(text: string): string {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENT_RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Full pipeline: trust-safe sanitization + emotional safety rewrites + violation check.
 */
export function filterEmotionalSafety(text: string): EmotionalSafetyCheckResult {
  const sanitized = sanitizeUserFacingMessage(text);
  const rewritten = applyEmotionalSafetyRewrites(sanitized);
  const violations = detectEmotionalSafetyViolations(rewritten);
  return {
    safe: violations.length === 0,
    violations,
    rewritten: rewritten !== text,
    message: rewritten,
  };
}

/** Use for deterministic intelligence copy (insights, dashboards, hints). */
export function sanitizeIntelligenceInsight(text: string): string {
  return filterEmotionalSafety(text).message;
}

export function buildEmotionalSafetyPromptBlock(): string {
  return [
    EMOTIONAL_SAFETY_CORE_RULE,
    'Forbidden: "You are behind", "You failed to", "You are inconsistent", "You should have", "This is wrong", "You\'re not doing enough", comparisons to others.',
    "Use: neutral observation, supportive framing, future-oriented options, permission-first offers.",
    "Insight without emotional safety is noise. Insight WITH emotional safety becomes trust.",
  ].join("\n");
}

export function buildIntelligenceSystemGuardrail(
  system: IntelligenceSystemId,
): string {
  return `${EMOTIONAL_SAFETY_CORE_RULE}\n${SYSTEM_GUARDRAILS[system]}`;
}

export function buildPermissionFirstOffer(topic: string): string {
  return `Would it help if I shared something about ${topic}? You can always say no.`;
}

export function buildResilienceDistressAcknowledgment(): string {
  return "I hear that this feels overwhelming right now.";
}

export function buildGrowthProgressFraming(
  movement: string,
  period = "recently",
): string {
  return sanitizeIntelligenceInsight(`You've ${movement} over ${period}.`);
}

export function buildFutureImpactFraming(
  observation: string,
  option?: string,
): string {
  const base = sanitizeIntelligenceInsight(observation);
  if (!option) return base;
  return `${base} ${sanitizeIntelligenceInsight(option)}`;
}

export function buildPatternObservationFraming(context: string): string {
  return sanitizeIntelligenceInsight(`This tends to happen when ${context}.`);
}

export function buildNeutralQuietObservation(subject: string): string {
  return sanitizeIntelligenceInsight(
    `${subject} hasn't had activity recently — would you like to pick this back up?`,
  );
}

export function buildSupportiveForwardOffer(): string {
  return "There are a few ways to move this forward if you want.";
}

export function buildSimplifyOffer(): string {
  return "We can simplify this if it feels like too much right now.";
}
