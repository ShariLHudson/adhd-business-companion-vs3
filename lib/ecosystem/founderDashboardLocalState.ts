// Founder dashboard local state — reviewed opportunities & content queue (browser only).

import type { GhlContentAssetIdea, GhlContentOpportunity } from "@/lib/ghl/types";

export type ContentQueueStatus =
  | "idea"
  | "drafting"
  | "approved"
  | "scheduled"
  | "published";

export const CONTENT_QUEUE_STATUSES: ContentQueueStatus[] = [
  "idea",
  "drafting",
  "approved",
  "scheduled",
  "published",
];

export type ContentQueueItem = {
  id: string;
  topicKey: string;
  topic: string;
  assetType: string;
  assetLabel: string;
  title: string;
  angle: string;
  opportunityScore: number;
  trend?: string;
  status: ContentQueueStatus;
  addedAt: string;
  updatedAt: string;
};

const REVIEWED_KEY = "adhd-ecosystem-reviewed-v1";
const QUEUE_KEY = "adhd-ecosystem-content-queue-v1";

const memoryReviewed = new Set<string>();
const memoryQueue: ContentQueueItem[] = [];

export function opportunityAssetKey(
  topicKey: string,
  asset: Pick<GhlContentAssetIdea, "type" | "title">,
): string {
  return `${topicKey}::${asset.type}::${asset.title}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function loadReviewedKeys(): Set<string> {
  if (typeof window === "undefined") return new Set(memoryReviewed);
  const list = readJson<string[]>(REVIEWED_KEY, []);
  return new Set(list);
}

export function saveReviewedKeys(keys: Set<string>): void {
  if (typeof window === "undefined") {
    memoryReviewed.clear();
    for (const k of keys) memoryReviewed.add(k);
    return;
  }
  writeJson(REVIEWED_KEY, [...keys]);
}

export function markOpportunityReviewed(key: string): Set<string> {
  const next = loadReviewedKeys();
  next.add(key);
  saveReviewedKeys(next);
  return next;
}

export function isOpportunityReviewed(key: string): boolean {
  return loadReviewedKeys().has(key);
}

export function loadContentQueue(): ContentQueueItem[] {
  if (typeof window === "undefined") return [...memoryQueue];
  return readJson<ContentQueueItem[]>(QUEUE_KEY, []);
}

export function saveContentQueue(items: ContentQueueItem[]): ContentQueueItem[] {
  const trimmed = items.slice(0, 200);
  if (typeof window === "undefined") {
    memoryQueue.length = 0;
    memoryQueue.push(...trimmed);
    return trimmed;
  }
  writeJson(QUEUE_KEY, trimmed);
  return trimmed;
}

export function addToContentQueue(input: {
  opportunity: GhlContentOpportunity;
  asset: GhlContentAssetIdea;
  status?: ContentQueueStatus;
}): ContentQueueItem[] {
  const now = new Date().toISOString();
  const key = opportunityAssetKey(
    input.opportunity.topicKey ?? input.opportunity.topic,
    input.asset,
  );
  const queue = loadContentQueue();
  const existing = queue.find(
    (q) =>
      opportunityAssetKey(q.topicKey, { type: q.assetType, title: q.title }) ===
      key,
  );
  if (existing) {
    const updated = queue.map((q) =>
      q.id === existing.id
        ? { ...q, updatedAt: now }
        : q,
    );
    return saveContentQueue(updated);
  }

  const item: ContentQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topicKey: input.opportunity.topicKey ?? input.opportunity.topic,
    topic: input.opportunity.topic,
    assetType: input.asset.type,
    assetLabel: input.asset.label,
    title: input.asset.title,
    angle: input.asset.angle,
    opportunityScore: input.opportunity.opportunityScore,
    trend: input.opportunity.trend,
    status: input.status ?? "idea",
    addedAt: now,
    updatedAt: now,
  };
  return saveContentQueue([item, ...queue]);
}

export function updateQueueItemStatus(
  id: string,
  status: ContentQueueStatus,
): ContentQueueItem[] {
  const now = new Date().toISOString();
  const next = loadContentQueue().map((item) =>
    item.id === id ? { ...item, status, updatedAt: now } : item,
  );
  return saveContentQueue(next);
}

export function removeQueueItem(id: string): ContentQueueItem[] {
  return saveContentQueue(loadContentQueue().filter((q) => q.id !== id));
}

export function buildAssetPostCraftJson(
  opportunity: GhlContentOpportunity,
  asset: GhlContentAssetIdea,
) {
  return {
    generatedAt: new Date().toISOString(),
    topic: opportunity.topic,
    topicKey: opportunity.topicKey,
    mentions: opportunity.mentions,
    opportunityScore: opportunity.opportunityScore,
    trend: opportunity.trend,
    whyThisMatters: opportunity.whyThisMatters,
    sourceSignals: opportunity.sourceSignals ?? [],
    asset: {
      type: asset.type,
      label: asset.label,
      title: asset.title,
      angle: asset.angle,
    },
  };
}

/** For tests */
export function resetFounderDashboardLocalState(): void {
  memoryReviewed.clear();
  memoryQueue.length = 0;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REVIEWED_KEY);
  window.localStorage.removeItem(QUEUE_KEY);
}
