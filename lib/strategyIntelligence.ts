/**
 * Strategy Intelligence — discoverability, situation mapping, search, analytics.
 *
 * Transforms strategies from a hidden library into a companion-supported
 * problem-solving system.
 */

import { resolveSituation, type SituationCategory } from "./adhdEntrepreneurSituationAtlas";
import {
  STRATEGIES,
  getStrategy,
  groupForStrategy,
  resolveSubcat,
  type Strategy,
} from "./strategySystem";
import { businessBuiltinStrategyCount } from "./strategyCatalog";
import { getUserStrategies } from "./userStrategies";

export type StrategyDifficulty = "easy" | "medium" | "hard";

export type StrategyMetadata = {
  situationIds: string[];
  actualNeeds: string[];
  adhdPatterns: string[];
  difficulty: StrategyDifficulty;
  timeRequiredMin: number;
  companionGuidance: boolean;
  relatedStrategyIds: string[];
  problemPhrases: string[];
};

export type StrategySearchResult = {
  strategyId: string;
  title: string;
  subtitle: string;
  score: number;
  matchReason: string;
  group: "personal" | "business";
};

export type PopularStrategy = {
  id: string;
  label: string;
  strategyId: string;
  problem: string;
};

export type SituationStrategyRecommendation = {
  situationId: string;
  situationLabel: string;
  strategyIds: string[];
};

export type StrategyLibraryCounts = {
  adhdStrategies: number;
  businessStrategies: number;
  recommendedStrategies: number;
  savedStrategies: number;
  totalBuiltin: number;
};

export type StrategyRecommendation = {
  strategyId: string;
  title: string;
  situationId: string | null;
  situationLabel: string | null;
  confidence: "low" | "medium" | "high";
  offerMessage: string;
};

export type StrategyAnalyticsEvent = {
  strategyId: string;
  event: "viewed" | "started" | "completed" | "saved" | "recommended";
  timestamp: string;
};

export type StrategyFounderAnalytics = {
  mostViewed: { strategyId: string; title: string; count: number }[];
  mostStarted: { strategyId: string; title: string; count: number }[];
  mostCompleted: { strategyId: string; title: string; count: number }[];
  mostSaved: { strategyId: string; title: string; count: number }[];
  leastUsed: { strategyId: string; title: string }[];
  topEffective: { strategyId: string; title: string; completionRate: number }[];
  missingRequests: string[];
  situationGaps: string[];
};

const ANALYTICS_KEY = "strategy-intelligence-analytics-v1";

/** Curated popular strategies — instantly communicate value. */
export const POPULAR_STRATEGIES: PopularStrategy[] = [
  {
    id: "popular-stuck",
    label: "Getting Started When Stuck",
    strategyId: "shrink-first-step",
    problem: "When starting feels impossible",
  },
  {
    id: "popular-overwhelm",
    label: "Overwhelm Recovery",
    strategyId: "shrink-the-world",
    problem: "When everything feels like too much",
  },
  {
    id: "popular-visibility",
    label: "Visibility Confidence",
    strategyId: "borrow-belief",
    problem: "When showing up feels scary",
  },
  {
    id: "popular-sales",
    label: "Sales Call Confidence",
    strategyId: "offer-help-not-sales",
    problem: "When selling feels uncomfortable",
  },
  {
    id: "popular-pricing",
    label: "Pricing Confidence",
    strategyId: "value-first-pricing",
    problem: "When charging feels hard",
  },
  {
    id: "popular-decision",
    label: "Decision Making Fast",
    strategyId: "decision-matrix",
    problem: "When you're stuck choosing",
  },
  {
    id: "popular-content",
    label: "Content When You Have No Ideas",
    strategyId: "content-from-convos",
    problem: "When the blank page wins",
  },
  {
    id: "popular-launch",
    label: "Launch Readiness",
    strategyId: "test-before-scale",
    problem: "When you're almost ready to launch",
  },
];

/** Situation Atlas → strategy mapping. */
export const SITUATION_STRATEGY_MAP: SituationStrategyRecommendation[] = [
  {
    situationId: "fear-of-being-seen",
    situationLabel: "Visibility Fear",
    strategyIds: ["borrow-belief", "one-channel", "run-your-own-race"],
  },
  {
    situationId: "launch-avoidance",
    situationLabel: "Launch Avoidance",
    strategyIds: ["test-before-scale", "good-enough-bar", "eighty-percent-ship"],
  },
  {
    situationId: "execution-friction",
    situationLabel: "Execution Friction",
    strategyIds: ["shrink-first-step", "first-tiny-step", "lower-activation-energy"],
  },
  {
    situationId: "pricing-guilt",
    situationLabel: "Pricing Anxiety",
    strategyIds: ["value-first-pricing", "raise-one-client", "simplify-the-offer"],
  },
  {
    situationId: "follow-up-avoidance",
    situationLabel: "Follow-Up Avoidance",
    strategyIds: ["follow-up-first", "check-in-cadence"],
  },
  {
    situationId: "overwhelm-spiral",
    situationLabel: "Overwhelm",
    strategyIds: ["shrink-the-world", "one-door-at-a-time", "three-task-day"],
  },
  {
    situationId: "decision-paralysis",
    situationLabel: "Decision Paralysis",
    strategyIds: ["decision-matrix", "reversible-or-permanent", "pick-then-learn"],
  },
  {
    situationId: "idea-overload",
    situationLabel: "Too Many Ideas",
    strategyIds: ["one-thing-only", "reduce-before-add", "simplify-the-offer"],
  },
  {
    situationId: "planning-addiction",
    situationLabel: "Planning Addiction",
    strategyIds: ["first-tiny-step", "scope-before-start", "good-enough-direction"],
  },
  {
    situationId: "fear-of-selling",
    situationLabel: "Sales Avoidance",
    strategyIds: ["offer-help-not-sales", "ask-directly", "talk-to-five"],
  },
];

const CATEGORY_PROBLEM_PHRASES: Record<string, string[]> = {
  overwhelm: ["too much", "overwhelmed", "can't keep up"],
  procrastination: ["can't get started", "procrastinating", "putting it off", "stuck"],
  perfectionism: ["not good enough", "one more tweak", "perfect"],
  "decision-making": ["can't decide", "stuck between", "which option"],
  sales: ["sales call", "follow up", "selling", "prospect", "objection"],
  pricing: ["pricing", "charge", "rates", "too expensive"],
  marketing: ["marketing", "visibility", "audience", "niche"],
  content: ["content", "posting", "no ideas", "writing"],
  offers: ["offer", "what am i selling"],
  planning: ["launch", "ready to ship", "go live"],
};

function readAnalytics(): StrategyAnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StrategyAnalyticsEvent[];
  } catch {
    return [];
  }
}

function writeAnalytics(events: StrategyAnalyticsEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(0, 500)));
  } catch {
    /* storage full */
  }
}

export function trackStrategyEvent(
  strategyId: string,
  event: StrategyAnalyticsEvent["event"],
): void {
  const events = readAnalytics();
  events.unshift({
    strategyId,
    event,
    timestamp: new Date().toISOString(),
  });
  writeAnalytics(events);
}

export function getStrategyLibraryCounts(): StrategyLibraryCounts {
  const adhdStrategies = STRATEGIES.filter((s) => groupForStrategy(s) === "personal").length;
  const businessStrategies = businessBuiltinStrategyCount();
  const recommendedStrategies = STRATEGIES.filter((s) => s.recommended).length;
  const savedStrategies = getUserStrategies().length;
  return {
    adhdStrategies,
    businessStrategies,
    recommendedStrategies,
    savedStrategies,
    totalBuiltin: STRATEGIES.length,
  };
}

export function buildStrategyMetadata(strategy: Strategy): StrategyMetadata {
  const situationEntry = SITUATION_STRATEGY_MAP.find((s) =>
    s.strategyIds.includes(strategy.id),
  );
  const categoryPhrases = CATEGORY_PROBLEM_PHRASES[resolveSubcat(strategy)] ?? [];

  return {
    situationIds: situationEntry ? [situationEntry.situationId] : [],
    actualNeeds: inferActualNeeds(strategy),
    adhdPatterns: inferPatterns(strategy),
    difficulty: strategy.steps.length > 5 ? "medium" : "easy",
    timeRequiredMin: strategy.timeMin ?? 10,
    companionGuidance: Boolean(strategy.coach?.length),
    relatedStrategyIds:
      situationEntry?.strategyIds.filter((id) => id !== strategy.id).slice(0, 3) ?? [],
    problemPhrases: [
      strategy.whenToUse,
      strategy.problem.slice(0, 80),
      ...(strategy.tags ?? []),
      ...categoryPhrases,
    ],
  };
}

function inferActualNeeds(strategy: Strategy): string[] {
  const sub = resolveSubcat(strategy);
  if (["pricing", "sales", "emotional-regulation"].includes(sub)) return ["confidence"];
  if (["decision-making", "business-decisions"].includes(sub)) return ["decision"];
  if (["overwhelm", "planning"].includes(sub)) return ["prioritization"];
  if (["procrastination", "focus", "productivity"].includes(sub)) return ["action"];
  return ["clarity"];
}

function inferPatterns(strategy: Strategy): string[] {
  const sub = resolveSubcat(strategy);
  const map: Record<string, string[]> = {
    procrastination: ["avoidance"],
    perfectionism: ["perfectionism"],
    overwhelm: ["overwhelm"],
    "decision-making": ["decision_paralysis"],
    pricing: ["fear"],
    sales: ["avoidance", "fear"],
  };
  return map[sub] ?? [];
}

export function searchStrategies(query: string, limit = 12): StrategySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: StrategySearchResult[] = [];

  for (const strategy of STRATEGIES) {
    const meta = buildStrategyMetadata(strategy);
    let score = 0;
    let matchReason = "";

    if (strategy.title.toLowerCase().includes(q)) {
      score += 30;
      matchReason = "Title match";
    }
    if (strategy.whenToUse.toLowerCase().includes(q)) {
      score += 20;
      matchReason = matchReason || "When-to-use match";
    }
    if (strategy.problem.toLowerCase().includes(q)) {
      score += 18;
      matchReason = matchReason || "Problem match";
    }
    for (const phrase of meta.problemPhrases) {
      if (phrase.toLowerCase().includes(q) || q.includes(phrase.toLowerCase().slice(0, 12))) {
        score += 15;
        matchReason = matchReason || "Problem language match";
        break;
      }
    }
    for (const tag of strategy.tags ?? []) {
      if (tag.toLowerCase().includes(q) || q.includes(tag.toLowerCase())) {
        score += 12;
        matchReason = matchReason || `Tag: ${tag}`;
      }
    }
    const sub = resolveSubcat(strategy);
    if (sub.includes(q) || q.includes(sub.replace(/-/g, " "))) {
      score += 10;
      matchReason = matchReason || "Category match";
    }

    if (q.includes("sales") && sub === "sales") {
      score += 25;
      matchReason = "Sales situation";
    }
    if (/\b(can'?t get started|stuck|procrastinat)/i.test(q) && sub === "procrastination") {
      score += 25;
      matchReason = "Execution friction";
    }
    if (/\b(overwhelm|too much)/i.test(q) && sub === "overwhelm") {
      score += 25;
      matchReason = "Overwhelm situation";
    }

    if (score > 0) {
      results.push({
        strategyId: strategy.id,
        title: strategy.title,
        subtitle: strategy.whenToUse,
        score,
        matchReason,
        group: groupForStrategy(strategy),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getStrategiesForSituation(situationId: string): Strategy[] {
  const entry = SITUATION_STRATEGY_MAP.find((s) => s.situationId === situationId);
  if (!entry) return [];
  return entry.strategyIds
    .map((id) => getStrategy(id))
    .filter((s): s is Strategy => Boolean(s));
}

export function getStrategiesForWhatYoureDealingWith(
  userText?: string,
): SituationStrategyRecommendation[] {
  if (userText?.trim()) {
    const resolution = resolveSituation({ userText, messages: [] });
    if (resolution.situationId) {
      const match = SITUATION_STRATEGY_MAP.find(
        (s) => s.situationId === resolution.situationId,
      );
      if (match) return [match];
    }
  }
  return SITUATION_STRATEGY_MAP.slice(0, 6);
}

export function recommendStrategyFromUserText(userText: string): StrategyRecommendation | null {
  const resolution = resolveSituation({ userText, messages: [] });
  if (!resolution.matched || !resolution.situationId) {
    const search = searchStrategies(userText, 1)[0];
    if (!search) return null;
    return {
      strategyId: search.strategyId,
      title: search.title,
      situationId: null,
      situationLabel: null,
      confidence: "medium",
      offerMessage: `I have a strategy that may help with this: **${search.title}**. Would you like to use it?`,
    };
  }

  const strategies = getStrategiesForSituation(resolution.situationId);
  const primary = strategies[0];
  if (!primary) return null;

  const situationLabel = resolution.situationName ?? resolution.situationId;
  return {
    strategyId: primary.id,
    title: primary.title,
    situationId: resolution.situationId,
    situationLabel,
    confidence: resolution.primary?.confidence ?? "medium",
    offerMessage: `This sounds similar to a **${situationLabel}** situation. I have a strategy that may help — **${primary.title}**. Would you like to use it?`,
  };
}

export function strategyIntelligenceHintForChat(userText: string): string | undefined {
  const rec = recommendStrategyFromUserText(userText);
  if (!rec || rec.confidence === "low") return undefined;

  return [
    "STRATEGY INTELLIGENCE (situation-aware recommendations):",
    `If appropriate, offer the matching strategy conversationally — do not lecture.`,
    `Suggested offer: ${rec.offerMessage}`,
    `Strategy id (internal): ${rec.strategyId}`,
    "Let the user accept or decline. If they accept, open the strategy in the Strategies workspace.",
  ].join("\n");
}

export function buildStrategyFounderAnalytics(): StrategyFounderAnalytics {
  const events = readAnalytics();
  const countBy = (event: StrategyAnalyticsEvent["event"]) => {
    const counts = new Map<string, number>();
    for (const e of events.filter((x) => x.event === event)) {
      counts.set(e.strategyId, (counts.get(e.strategyId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([strategyId, count]) => ({
        strategyId,
        title: getStrategy(strategyId)?.title ?? strategyId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const started = new Map<string, number>();
  const completed = new Map<string, number>();
  for (const e of events) {
    if (e.event === "started") started.set(e.strategyId, (started.get(e.strategyId) ?? 0) + 1);
    if (e.event === "completed") {
      completed.set(e.strategyId, (completed.get(e.strategyId) ?? 0) + 1);
    }
  }
  const topEffective = [...started.entries()]
    .map(([strategyId, startCount]) => {
      const done = completed.get(strategyId) ?? 0;
      return {
        strategyId,
        title: getStrategy(strategyId)?.title ?? strategyId,
        completionRate: startCount ? Math.round((done / startCount) * 100) : 0,
      };
    })
    .filter((x) => x.completionRate > 0)
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);

  const usedIds = new Set(events.map((e) => e.strategyId));
  const leastUsed = STRATEGIES.filter((s) => !usedIds.has(s.id))
    .slice(0, 5)
    .map((s) => ({ strategyId: s.id, title: s.title }));

  return {
    mostViewed: countBy("viewed"),
    mostStarted: countBy("started"),
    mostCompleted: countBy("completed"),
    mostSaved: countBy("saved"),
    leastUsed,
    topEffective,
    missingRequests: [],
    situationGaps: SITUATION_STRATEGY_MAP.filter(
      (s) => getStrategiesForSituation(s.situationId).length === 0,
    ).map((s) => s.situationLabel),
  };
}

export function browseCategoriesForLibrary(): { label: string; category: SituationCategory | "all" }[] {
  return [
    { label: "Overwhelm", category: "all" },
    { label: "Procrastination", category: "adhd_core" },
    { label: "Visibility", category: "visibility" },
    { label: "Sales", category: "sales" },
    { label: "Content Creation", category: "content" },
    { label: "Launches", category: "launch" },
    { label: "Pricing", category: "money" },
    { label: "Confidence", category: "confidence" },
    { label: "Follow-Up", category: "sales" },
    { label: "Focus", category: "adhd_core" },
    { label: "Decision Making", category: "adhd_core" },
    { label: "Delegation", category: "delegation" },
  ];
}

export function resetStrategyIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANALYTICS_KEY);
}
