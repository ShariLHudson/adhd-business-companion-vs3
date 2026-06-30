/**
 * Spark Alpha™ — Workspace Context Manager™
 * Intent → Context. Not navigation.
 *
 * @see docs/SPARK_ALPHA_FRAMEWORK.md
 */

import type {
  SparkAlphaContextModule,
  SparkAlphaContextSnapshot,
  SparkAlphaConversationIntent,
} from "./types";

const INTENT_MODULES: Record<
  SparkAlphaConversationIntent,
  SparkAlphaContextModule[]
> = {
  general: ["business_brain", "related_conversations"],
  marketing: [
    "marketing_planner",
    "brand_voice",
    "client_avatar",
    "business_brain",
    "previous_marketing_work",
    "spark_cards",
    "research",
    "templates",
  ],
  pricing: [
    "pricing_strategy",
    "offers",
    "positioning",
    "financial_planning",
    "business_brain",
  ],
  overwhelmed: ["emotional_support", "journaling", "business_brain"],
  idea: ["idea_capture", "decision_support", "business_brain", "spark_cards"],
  research: ["research", "business_brain", "templates"],
  celebration: ["gallery_wins", "business_brain", "related_conversations"],
  planning: [
    "marketing_planner",
    "business_brain",
    "templates",
    "related_conversations",
  ],
  draft_review: [
    "business_brain",
    "templates",
    "previous_marketing_work",
    "brand_voice",
  ],
};

const INTENT_PATTERNS: Array<{
  intent: SparkAlphaConversationIntent;
  pattern: RegExp;
}> = [
  { intent: "overwhelmed", pattern: /\b(overwhelm|stressed|too much|can't cope)\b/i },
  { intent: "pricing", pattern: /\b(pric(e|ing)|rate|cost|charge|fee)\b/i },
  { intent: "marketing", pattern: /\b(market|launch|audience|promot|ecosystem|app)\b/i },
  { intent: "idea", pattern: /\b(idea|thought|what if|been thinking)\b/i },
  { intent: "research", pattern: /\b(research|look up|what are others)\b/i },
  { intent: "celebration", pattern: /\b(signed|won|biggest client|milestone|celebrate)\b/i },
  { intent: "planning", pattern: /\b(plan|quarter|roadmap|strategy)\b/i },
  { intent: "draft_review", pattern: /\b(draft|review|revise|look at what you)\b/i },
];

export function detectConversationIntent(
  message: string,
  priorIntent: SparkAlphaConversationIntent,
): SparkAlphaConversationIntent {
  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(message)) return intent;
  }
  return priorIntent === "general" ? "general" : priorIntent;
}

export function updateWorkspaceContext(input: {
  turnId: string;
  message: string;
  priorIntent: SparkAlphaConversationIntent;
  priorModules: SparkAlphaContextModule[];
}): SparkAlphaContextSnapshot {
  const intent = detectConversationIntent(input.message, input.priorIntent);
  const nextModules = INTENT_MODULES[intent];
  const priorSet = new Set(input.priorModules);
  const nextSet = new Set(nextModules);

  const loadedModules = nextModules.filter((m) => !priorSet.has(m));
  const unloadedModules = input.priorModules.filter((m) => !nextSet.has(m));

  const reason =
    loadedModules.length > 0 || unloadedModules.length > 0
      ? `Intent shifted to "${intent}" — context adjusted silently`
      : `Intent "${intent}" — context unchanged`;

  return {
    intent,
    loadedModules: nextModules,
    unloadedModules,
    turnId: input.turnId,
    reason,
  };
}

export function modulesToBrainSummary(
  modules: SparkAlphaContextModule[],
): string[] {
  return modules.map((m) => m.replace(/_/g, " "));
}
