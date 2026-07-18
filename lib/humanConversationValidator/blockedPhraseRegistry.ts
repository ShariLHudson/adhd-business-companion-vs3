/**
 * Package 209 — versioned blocked phrase registry.
 */

export type BlockedPhraseSeverity = "critical" | "high" | "medium";

export type BlockedPhraseEntry = {
  id: string;
  version: string;
  pattern: RegExp;
  severity: BlockedPhraseSeverity;
  applicableModes: readonly string[];
  replacementGuidance: string;
  sourceFailure: string;
  testCoverage: string;
};

export const BLOCKED_PHRASE_REGISTRY_VERSION = "209.1.0";

export const BLOCKED_PHRASE_REGISTRY: readonly BlockedPhraseEntry[] = [
  {
    id: "lets-stay-with",
    version: "209.1.0",
    pattern: /\blet'?s stay with\b/i,
    severity: "critical",
    applicableModes: ["*"],
    replacementGuidance: "Name the real question in plain language",
    sourceFailure: "coaching shell fallback",
    testCoverage: "package209.test.ts",
  },
  {
    id: "what-part-feels-most-useful",
    version: "209.1.0",
    pattern: /\bwhat part feels most useful\b/i,
    severity: "critical",
    applicableModes: ["*"],
    replacementGuidance: "Ask a concrete, topic-grounded question",
    sourceFailure: "generic template",
    testCoverage: "package209.test.ts",
  },
  {
    id: "tell-me-more",
    version: "209.1.0",
    pattern: /^tell me more\.?$/i,
    severity: "high",
    applicableModes: ["*"],
    replacementGuidance: "Reference the specific detail they shared",
    sourceFailure: "empty continue prompt",
    testCoverage: "package209.test.ts",
  },
  {
    id: "what-matters-most",
    version: "209.1.0",
    pattern: /\bwhat matters most\b/i,
    severity: "high",
    applicableModes: ["*"],
    replacementGuidance: "Name the actual tradeoff or concern",
    sourceFailure: "abstract coaching",
    testCoverage: "package209.test.ts",
  },
  {
    id: "take-your-time",
    version: "209.1.0",
    pattern: /\btake your time(?: with that)?\b/i,
    severity: "critical",
    applicableModes: ["*"],
    replacementGuidance: "Stay with the topic; do not pause-shell",
    sourceFailure: "permanent ban 206",
    testCoverage: "permanentFailureRegressions.test.ts",
  },
  {
    id: "underneath",
    version: "209.1.0",
    pattern: /\b(?:quieter question|something) underneath\b/i,
    severity: "critical",
    applicableModes: ["*"],
    replacementGuidance: "Stay with stated meaning",
    sourceFailure: "hidden meaning",
    testCoverage: "package209.test.ts",
  },
  {
    id: "malformed-token-topic",
    version: "209.1.0",
    pattern:
      /\bdesigning new adhd business platform need\b|\b(?:working through|stay with) [a-z]+(?: [a-z]+){4,} need\b/i,
    severity: "critical",
    applicableModes: ["*"],
    replacementGuidance: "Use a human topic phrase, not token dumps",
    sourceFailure: "malformed topic extraction echo",
    testCoverage: "package209.test.ts",
  },
  {
    id: "that-seems-important",
    version: "209.1.0",
    pattern: /^that seems important\.?/i,
    severity: "high",
    applicableModes: ["*"],
    replacementGuidance: "Name what specifically matters in their words",
    sourceFailure: "empty empathy",
    testCoverage: "package209.test.ts",
  },
];

export function matchBlockedPhrases(text: string): BlockedPhraseEntry[] {
  return BLOCKED_PHRASE_REGISTRY.filter((e) => e.pattern.test(text));
}
