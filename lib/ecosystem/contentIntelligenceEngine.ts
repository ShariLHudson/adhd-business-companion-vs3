// Content Intelligence Foundation — identify content opportunities from ecosystem signals.
// Does not generate content; stores categorized topics, scores, and suggested asset types only.

import {
  userIntelligenceEngine,
  type UserQuestionType,
  type UserStruggleType,
} from "./userIntelligenceEngine";

// ---- Asset & source types -------------------------------------------------

export type ContentAssetCategory =
  | "social_posts"
  | "blogs"
  | "newsletters"
  | "workshops"
  | "lead_magnets"
  | "webinars"
  | "podcast_episodes"
  | "email_series";

export type ContentSourceSignalType =
  | "user_struggle"
  | "user_question"
  | "user_language"
  | "feature_request"
  | "product_feedback";

/** Categorized signal reference — no conversation or feedback text. */
export type ContentSourceSignal = {
  type: ContentSourceSignalType;
  key: string;
  count: number;
  lastSeen?: string;
};

export type ContentOpportunity = {
  id: string;
  topic: string;
  frequency: number;
  opportunityScore: number;
  sourceSignals: ContentSourceSignal[];
  suggestedAssets: ContentAssetCategory[];
  createdAt: string;
  updatedAt: string;
};

export type ContentSignalInput = {
  type: ContentSourceSignalType;
  key: string;
  count?: number;
  lastSeen?: string;
};

export type ContentIntelligenceInput = {
  struggles?: ContentSignalInput[];
  questions?: ContentSignalInput[];
  userLanguage?: ContentSignalInput[];
  featureRequests?: ContentSignalInput[];
  productFeedback?: ContentSignalInput[];
};

export type ContentOpportunityQuery = {
  topic?: string;
  minScore?: number;
  minFrequency?: number;
  limit?: number;
};

/** PostCraft-ready export — opportunities only, no generated copy. */
export type PostCraftOpportunityPayload = {
  generatedAt: string;
  opportunities: Array<{
    topic: string;
    mentions: number;
    opportunityScore: number;
    suggestedAssets: ContentAssetCategory[];
    sourceSignals: ContentSourceSignal[];
  }>;
};

const STORAGE_KEY = "adhd-content-intelligence-v1";
const MAX_OPPORTUNITIES = 500;

const STRUGGLE_TOPICS: Record<UserStruggleType, string> = {
  overwhelm: "Overwhelm",
  prioritization: "Prioritization",
  focus: "Focus",
  follow_through: "Follow Through",
  decision_making: "Decision Making",
  marketing: "Marketing",
  content_creation: "Content Creation",
};

const QUESTION_TOPICS: Record<UserQuestionType, string> = {
  what_should_i_work_on: "What Should I Work On",
  help_me_prioritize: "Help Me Prioritize",
  im_overwhelmed: "I'm Overwhelmed",
  dont_know_where_to_start: "Don't Know Where to Start",
};

type TopicRule = {
  topic: string;
  assets: ContentAssetCategory[];
};

const TOPIC_ASSET_RULES: TopicRule[] = [
  {
    topic: "Overwhelm",
    assets: ["blogs", "newsletters", "workshops", "social_posts"],
  },
  {
    topic: "Prioritization",
    assets: ["blogs", "newsletters", "workshops", "lead_magnets"],
  },
  {
    topic: "Focus",
    assets: ["social_posts", "blogs", "podcast_episodes", "workshops"],
  },
  {
    topic: "Follow Through",
    assets: ["email_series", "workshops", "newsletters", "lead_magnets"],
  },
  {
    topic: "Decision Making",
    assets: ["blogs", "webinars", "workshops", "podcast_episodes"],
  },
  {
    topic: "Marketing",
    assets: ["social_posts", "blogs", "newsletters", "lead_magnets"],
  },
  {
    topic: "Content Creation",
    assets: ["blogs", "newsletters", "social_posts", "workshops"],
  },
  {
    topic: "What Should I Work On",
    assets: ["social_posts", "blogs", "lead_magnets", "email_series"],
  },
  {
    topic: "Help Me Prioritize",
    assets: ["blogs", "newsletters", "workshops", "lead_magnets"],
  },
  {
    topic: "I'm Overwhelmed",
    assets: ["blogs", "newsletters", "workshops", "social_posts"],
  },
  {
    topic: "Don't Know Where to Start",
    assets: ["blogs", "lead_magnets", "email_series", "workshops"],
  },
];

const DEFAULT_ASSETS: ContentAssetCategory[] = [
  "blogs",
  "newsletters",
  "social_posts",
];

const FEATURE_REQUEST_ASSETS: ContentAssetCategory[] = [
  "blogs",
  "email_series",
  "lead_magnets",
  "webinars",
];

const PRODUCT_FEEDBACK_ASSETS: ContentAssetCategory[] = [
  "blogs",
  "social_posts",
  "newsletters",
  "podcast_episodes",
];

function topicKey(topic: string): string {
  return topic.toLowerCase().replace(/\s+/g, "_");
}

function newOpportunityId(topic: string): string {
  return `opp-${topicKey(topic)}-${Date.now()}`;
}

function uniqueAssets(items: ContentAssetCategory[]): ContentAssetCategory[] {
  return [...new Set(items)];
}

function normalizeInput(
  items: ContentSignalInput[] | undefined,
  type: ContentSourceSignalType,
): ContentSourceSignal[] {
  if (!items?.length) return [];
  return items
    .filter((i) => i.key.trim())
    .map((i) => ({
      type,
      key: i.key.trim(),
      count: Math.max(1, i.count ?? 1),
      lastSeen: i.lastSeen,
    }));
}

function struggleTopic(key: string): string {
  return STRUGGLE_TOPICS[key as UserStruggleType] ?? titleCase(key);
}

function questionTopic(key: string): string {
  return QUESTION_TOPICS[key as UserQuestionType] ?? titleCase(key);
}

function titleCase(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function languageTopic(key: string): string {
  if (STRUGGLE_TOPICS[key as UserStruggleType]) {
    return `${STRUGGLE_TOPICS[key as UserStruggleType]} Language`;
  }
  if (QUESTION_TOPICS[key as UserQuestionType]) {
    return `${QUESTION_TOPICS[key as UserQuestionType]} Language`;
  }
  return `${titleCase(key)} Language`;
}

function resolveTopic(signal: ContentSourceSignal): string {
  switch (signal.type) {
    case "user_struggle":
      return struggleTopic(signal.key);
    case "user_question":
      return questionTopic(signal.key);
    case "user_language":
      return languageTopic(signal.key);
    case "feature_request":
      return titleCase(signal.key);
    case "product_feedback":
      return titleCase(signal.key);
    default:
      return titleCase(signal.key);
  }
}

function suggestAssets(
  topic: string,
  signals: ContentSourceSignal[],
): ContentAssetCategory[] {
  const rule = TOPIC_ASSET_RULES.find(
    (r) => topicKey(r.topic) === topicKey(topic),
  );
  if (rule) return rule.assets;

  const types = new Set(signals.map((s) => s.type));
  if (types.has("feature_request")) return FEATURE_REQUEST_ASSETS;
  if (types.has("product_feedback")) return PRODUCT_FEEDBACK_ASSETS;
  return DEFAULT_ASSETS;
}

function isRecent(lastSeen: string | undefined, days = 7): boolean {
  if (!lastSeen) return false;
  const ms = Date.now() - new Date(lastSeen).getTime();
  return ms >= 0 && ms <= days * 86_400_000;
}

/** Score 0–100 from frequency and signal diversity (no content generation). */
export function calculateOpportunityScore(input: {
  frequency: number;
  sourceSignals: ContentSourceSignal[];
}): number {
  const { frequency, sourceSignals } = input;
  const uniqueTypes = new Set(sourceSignals.map((s) => s.type)).size;
  const recent = sourceSignals.some((s) => isRecent(s.lastSeen));
  const dominant = sourceSignals.reduce((max, s) => Math.max(max, s.count), 0);
  const trendUp = frequency > 0 && dominant / frequency >= 0.4 && frequency >= 3;

  const raw =
    frequency * 0.2 +
    uniqueTypes * 6 +
    (recent ? 5 : 0) +
    (trendUp ? 8 : 0);

  return Math.min(100, Math.max(0, Math.round(raw)));
}

function mergeSignals(
  existing: ContentSourceSignal[],
  incoming: ContentSourceSignal[],
): ContentSourceSignal[] {
  const map = new Map<string, ContentSourceSignal>();
  for (const s of [...existing, ...incoming]) {
    const key = `${s.type}:${s.key}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...s });
      continue;
    }
    prev.count += s.count;
    if (s.lastSeen && (!prev.lastSeen || s.lastSeen > prev.lastSeen)) {
      prev.lastSeen = s.lastSeen;
    }
  }
  return [...map.values()];
}

function buildOpportunity(
  topic: string,
  signals: ContentSourceSignal[],
  existing?: ContentOpportunity,
): ContentOpportunity {
  const frequency = signals.reduce((sum, s) => sum + s.count, 0);
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? newOpportunityId(topic),
    topic,
    frequency,
    opportunityScore: calculateOpportunityScore({ frequency, sourceSignals: signals }),
    sourceSignals: signals,
    suggestedAssets: suggestAssets(topic, signals),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function flattenInput(input: ContentIntelligenceInput): ContentSourceSignal[] {
  return [
    ...normalizeInput(input.struggles, "user_struggle"),
    ...normalizeInput(input.questions, "user_question"),
    ...normalizeInput(input.userLanguage, "user_language"),
    ...normalizeInput(input.featureRequests, "feature_request"),
    ...normalizeInput(input.productFeedback, "product_feedback"),
  ];
}

function groupByTopic(signals: ContentSourceSignal[]): Map<string, ContentSourceSignal[]> {
  const map = new Map<string, ContentSourceSignal[]>();
  for (const signal of signals) {
    const topic = resolveTopic(signal);
    const list = map.get(topic) ?? [];
    list.push(signal);
    map.set(topic, list);
  }
  return map;
}

// ---- Persistence ----------------------------------------------------------

export interface ContentOpportunitySink {
  all(): ContentOpportunity[];
  save(opportunities: ContentOpportunity[]): void;
}

export class MemoryContentOpportunitySink implements ContentOpportunitySink {
  private records: ContentOpportunity[] = [];

  all() {
    return this.records.slice();
  }

  save(opportunities: ContentOpportunity[]) {
    this.records = opportunities.slice(-MAX_OPPORTUNITIES);
  }
}

export class LocalStorageContentOpportunitySink implements ContentOpportunitySink {
  constructor(private key = STORAGE_KEY) {}

  all(): ContentOpportunity[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as ContentOpportunity[]) : [];
    } catch {
      return [];
    }
  }

  save(opportunities: ContentOpportunity[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        this.key,
        JSON.stringify(opportunities.slice(-MAX_OPPORTUNITIES)),
      );
    } catch {
      /* best-effort */
    }
  }
}

// ---- Engine ---------------------------------------------------------------

export class ContentIntelligenceEngine {
  constructor(
    private sink: ContentOpportunitySink = new MemoryContentOpportunitySink(),
  ) {}

  /** Merge categorized signals and rebuild ranked opportunities. */
  ingest(input: ContentIntelligenceInput): ContentOpportunity[] {
    const incoming = flattenInput(input);
    if (!incoming.length) return this.getOpportunities();

    const existing = this.sink.all();
    const byTopic = new Map<string, ContentOpportunity>();
    for (const opp of existing) {
      byTopic.set(topicKey(opp.topic), opp);
    }

    const grouped = groupByTopic(incoming);
    for (const [topic, signals] of grouped) {
      const key = topicKey(topic);
      const prev = byTopic.get(key);
      const merged = mergeSignals(prev?.sourceSignals ?? [], signals);
      byTopic.set(key, buildOpportunity(topic, merged, prev));
    }

    const ranked = [...byTopic.values()].sort(
      (a, b) => b.opportunityScore - a.opportunityScore || b.frequency - a.frequency,
    );
    this.sink.save(ranked);
    return ranked;
  }

  /** Pull struggles, questions, and language themes from user intelligence. */
  syncFromUserIntelligence(userId?: string): ContentOpportunity[] {
    const counts = userId
      ? userIntelligenceEngine.getCounts(userId)
      : userIntelligenceEngine.getCounts();

    const struggles: ContentSignalInput[] = [];
    const questions: ContentSignalInput[] = [];
    const userLanguage: ContentSignalInput[] = [];

    for (const row of counts) {
      const base = {
        key: row.category,
        count: row.count,
        lastSeen: row.lastSeen,
      };
      if (row.kind === "struggle") {
        struggles.push({ ...base, type: "user_struggle" });
        userLanguage.push({
          type: "user_language",
          key: row.category,
          count: row.count,
          lastSeen: row.lastSeen,
        });
      } else if (row.kind === "question") {
        questions.push({ ...base, type: "user_question" });
        userLanguage.push({
          type: "user_language",
          key: row.category,
          count: row.count,
          lastSeen: row.lastSeen,
        });
      }
    }

    return this.ingest({ struggles, questions, userLanguage });
  }

  getOpportunities(query: ContentOpportunityQuery = {}): ContentOpportunity[] {
    let out = this.sink.all();
    if (query.topic) {
      const key = topicKey(query.topic);
      out = out.filter((o) => topicKey(o.topic) === key);
    }
    if (query.minScore != null) {
      out = out.filter((o) => o.opportunityScore >= query.minScore!);
    }
    if (query.minFrequency != null) {
      out = out.filter((o) => o.frequency >= query.minFrequency!);
    }
    out = [...out].sort(
      (a, b) => b.opportunityScore - a.opportunityScore || b.frequency - a.frequency,
    );
    if (query.limit && out.length > query.limit) {
      out = out.slice(0, query.limit);
    }
    return out;
  }

  getRankedOpportunities(limit = 20): ContentOpportunity[] {
    return this.getOpportunities({ limit });
  }

  getOpportunityByTopic(topic: string): ContentOpportunity | undefined {
    return this.getOpportunities({ topic, limit: 1 })[0];
  }

  /** Export for PostCraft — topics, scores, and asset suggestions only. */
  toPostCraftPayload(limit = 50): PostCraftOpportunityPayload {
    return {
      generatedAt: new Date().toISOString(),
      opportunities: this.getOpportunities({ limit }).map((o) => ({
        topic: o.topic,
        mentions: o.frequency,
        opportunityScore: o.opportunityScore,
        suggestedAssets: o.suggestedAssets,
        sourceSignals: o.sourceSignals,
      })),
    };
  }

  /** Verify storage holds opportunity metadata only (no generated content). */
  storageIsOpportunityOnly(): boolean {
    const forbidden = [
      "body",
      "draft",
      "copy",
      "content",
      "text",
      "message",
      "conversation",
      "transcript",
      "generatedContent",
    ];
    for (const o of this.sink.all()) {
      const keys = Object.keys(o as unknown as Record<string, unknown>);
      if (forbidden.some((k) => keys.includes(k))) return false;
      for (const s of o.sourceSignals) {
        const sKeys = Object.keys(s as unknown as Record<string, unknown>);
        if (forbidden.some((k) => sKeys.includes(k))) return false;
      }
    }
    return true;
  }
}

export const contentIntelligenceEngine = new ContentIntelligenceEngine(
  typeof window === "undefined"
    ? new MemoryContentOpportunitySink()
    : new LocalStorageContentOpportunitySink(),
);

export function ingestContentSignals(
  input: ContentIntelligenceInput,
): ContentOpportunity[] {
  return contentIntelligenceEngine.ingest(input);
}

export function syncContentOpportunitiesFromUserIntelligence(
  userId?: string,
): ContentOpportunity[] {
  return contentIntelligenceEngine.syncFromUserIntelligence(userId);
}

export function getPostCraftOpportunities(
  limit = 50,
): PostCraftOpportunityPayload {
  return contentIntelligenceEngine.toPostCraftPayload(limit);
}
