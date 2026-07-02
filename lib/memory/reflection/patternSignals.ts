/**
 * Pattern signal lexicon — deterministic keyword matching, no LLM.
 */

export type SignalBucket = {
  id: string;
  label: string;
  pattern: RegExp;
};

export const THEME_SIGNALS: SignalBucket[] = [
  {
    id: "decision-fatigue",
    label: "decision fatigue",
    pattern:
      /\b(?:decision|decide|choos(?:e|ing)|unclear|unsure what|too many options)\b/i,
  },
  {
    id: "task-avoidance",
    label: "task avoidance before high-pressure work",
    pattern:
      /\b(?:avoid|procrastinat|put off|delay(?:ed|ing)?|kept putting|didn't start)\b/i,
  },
  {
    id: "recovery",
    label: "recovery after completion",
    pattern:
      /\b(?:relief|calmer|recovered|rested|felt better|easier after)\b/i,
  },
  {
    id: "external-pressure",
    label: "pressure from deadlines or commitments",
    pattern:
      /\b(?:deadline|due date|meeting|call|commitment|client|launch)\b/i,
  },
  {
    id: "growth-learning",
    label: "learning and capability growth",
    pattern:
      /\b(?:learned|lesson|grew|growth|improved|practice|skill)\b/i,
  },
  {
    id: "overwhelm-load",
    label: "cognitive overload",
    pattern:
      /\b(?:overwhelm|too much|scattered|brain fog|can't focus|spinning)\b/i,
  },
];

export const EMOTIONAL_SIGNALS: SignalBucket[] = [
  {
    id: "anxiety-before-action",
    label: "anxiety before action",
    pattern:
      /\b(?:anxious|nervous|worried|dread|stomach|before (?:the )?(?:call|meeting|launch))\b/i,
  },
  {
    id: "overwhelm",
    label: "overwhelm",
    pattern: /\b(?:overwhelm|overwhelmed|too much|frazzled|burned out)\b/i,
  },
  {
    id: "avoidance",
    label: "avoidance",
    pattern: /\b(?:avoid|procrastinat|put off|didn't want to|kept delaying)\b/i,
  },
  {
    id: "confidence",
    label: "confidence",
    pattern: /\b(?:confident|capable|ready|sure|trust myself)\b/i,
  },
  {
    id: "pride",
    label: "pride",
    pattern: /\b(?:proud|accomplished|satisfied|good about)\b/i,
  },
  {
    id: "uncertainty",
    label: "uncertainty",
    pattern:
      /\b(?:unsure|uncertain|don't know|not sure|unclear|second.?guess)\b/i,
  },
  {
    id: "relief-after-completion",
    label: "relief after completion",
    pattern:
      /\b(?:relief|relieved|done|finished|completed|shipped|finally)\b/i,
  },
];

export const BEHAVIOR_CYCLE_SIGNALS: {
  id: string;
  label: string;
  requires: RegExp[];
}[] = [
  {
    id: "delay-pressure-action-relief",
    label: "delay → pressure → action → relief cycle",
    requires: [
      /\b(?:delay(?:ed|ing)?|avoid(?:ed|ing)?|procrastinat(?:e|ed|ing)?|put(?:ting)? off)\b/i,
      /\b(?:deadline|pressure|due|urgent|last minute|tomorrow)\b/i,
      /\b(?:finished|completed|done|shipped|sent|launched|prep(?:ared)?)\b/i,
      /\b(?:relief|relieved|calmer|better)\b/i,
    ],
  },
  {
    id: "small-action-reduces-avoidance",
    label: "small action precedes momentum",
    requires: [
      /\b(?:small step|one thing|tiny|just started|15 min|five min)\b/i,
      /\b(?:momentum|easier|kept going|finished|completed)\b/i,
    ],
  },
  {
    id: "external-commitment-drives-action",
    label: "external commitment precedes action",
    requires: [
      /\b(?:meeting|call|client|deadline|appointment|promised)\b/i,
      /\b(?:prepared|ready|completed|showed up|delivered)\b/i,
    ],
  },
];

export const CHALLENGE_SIGNALS: SignalBucket[] = [
  {
    id: "stress",
    label: "elevated stress",
    pattern: /\b(?:stress|stressed|pressure|anxious|overwhelm)\b/i,
  },
  {
    id: "stuck",
    label: "feeling stuck",
    pattern: /\b(?:stuck|paralyz|frozen|can't move|spinning)\b/i,
  },
  {
    id: "self-doubt",
    label: "self-doubt",
    pattern: /\b(?:doubt|imposter|not enough|who am i)\b/i,
  },
];

export const WIN_SIGNAL =
  /\b(?:win|won|helped|launched|finished|completed|shipped|proud|grateful|breakthrough|milestone|success|grew|learned|delivered|impact)\b/i;

export const INSIGHT_RULES: {
  id: string;
  label: string;
  when: (ctx: InsightContext) => boolean;
}[] = [
  {
    id: "relief-after-completion",
    label: "completion is frequently followed by relief in stored entries",
    when: (c) =>
      c.emotionalIds.has("relief-after-completion") &&
      c.emotionalIds.has("anxiety-before-action"),
  },
  {
    id: "external-commitment",
    label: "action often appears after external commitment or deadline language",
    when: (c) => c.behaviorIds.has("external-commitment-drives-action"),
  },
  {
    id: "small-steps",
    label: "small actions correlate with reduced avoidance in entries",
    when: (c) => c.behaviorIds.has("small-action-reduces-avoidance"),
  },
  {
    id: "cross-category-wins",
    label: "wins appear across journal, portfolio, and evidence stores",
    when: (c) => c.winTypes.size >= 2,
  },
  {
    id: "recurring-overwhelm",
    label: "overwhelm language recurs across multiple entries",
    when: (c) => (c.emotionCounts.get("overwhelm") ?? 0) >= 2,
  },
  {
    id: "decision-theme",
    label: "decision-related language clusters in multiple entries",
    when: (c) => (c.themeCounts.get("decision-fatigue") ?? 0) >= 2,
  },
];

export type InsightContext = {
  emotionalIds: Set<string>;
  behaviorIds: Set<string>;
  themeCounts: Map<string, number>;
  emotionCounts: Map<string, number>;
  winTypes: Set<string>;
};

const STOPWORDS = new Set([
  "about",
  "after",
  "been",
  "before",
  "could",
  "from",
  "have",
  "just",
  "like",
  "more",
  "really",
  "that",
  "this",
  "today",
  "want",
  "what",
  "when",
  "with",
  "would",
  "your",
]);

export function entryText(entry: { content: string; title?: string }): string {
  return `${entry.title ?? ""} ${entry.content}`.trim();
}

export function tokenizeForCluster(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export function matchBuckets(
  text: string,
  buckets: SignalBucket[],
): SignalBucket[] {
  return buckets.filter((b) => b.pattern.test(text));
}
