/**
 * In-memory smart cache (v1 scaffold).
 */

import type { CacheDomain } from "./types";

type CacheEntry = {
  value: unknown;
  updatedAt: number;
  ttlMs: number;
};

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL: Record<CacheDomain, number> = {
  definitions: 7 * 24 * 60 * 60 * 1000,
  frameworks: 7 * 24 * 60 * 60 * 1000,
  business_concepts: 24 * 60 * 60 * 1000,
  user_profile: 60 * 60 * 1000,
  business_profile: 60 * 60 * 1000,
  communication_preferences: 60 * 60 * 1000,
  current_projects: 30 * 60 * 1000,
  brand_voice: 60 * 60 * 1000,
  recent_context: 15 * 60 * 1000,
  templates: 24 * 60 * 60 * 1000,
};

function cacheKey(threadId: string, domain: CacheDomain, id: string): string {
  return `${threadId}:${domain}:${id}`;
}

export function cacheGet<T>(
  threadId: string,
  domain: CacheDomain,
  id: string,
): T | undefined {
  const key = cacheKey(threadId, domain, id);
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.updatedAt > entry.ttlMs) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet(
  threadId: string,
  domain: CacheDomain,
  id: string,
  value: unknown,
  ttlMs?: number,
): void {
  store.set(cacheKey(threadId, domain, id), {
    value,
    updatedAt: Date.now(),
    ttlMs: ttlMs ?? DEFAULT_TTL[domain],
  });
}

export function cacheSnapshot(
  threadId: string,
): Partial<Record<CacheDomain, boolean>> {
  const domains: CacheDomain[] = [
    "definitions",
    "frameworks",
    "business_concepts",
    "user_profile",
    "business_profile",
    "communication_preferences",
    "current_projects",
    "brand_voice",
    "recent_context",
    "templates",
  ];
  const snap: Partial<Record<CacheDomain, boolean>> = {};
  for (const d of domains) {
    snap[d] = cacheGet(threadId, d, "primary") !== undefined;
  }
  return snap;
}

export function resolveDefinition(
  threadId: string,
  term: string,
): { hit: boolean; value?: string } {
  const cached = cacheGet<string>(threadId, "definitions", term.toLowerCase());
  if (cached) return { hit: true, value: cached };

  const builtins: Record<string, string> = {
    "churn rate": "The percentage of customers who stop using a product or service in a period.",
    "value proposition": "The clear reason a customer should choose your offer over alternatives.",
  };
  const builtin = builtins[term.toLowerCase()];
  if (builtin) {
    cacheSet(threadId, "definitions", term.toLowerCase(), builtin);
    return { hit: true, value: builtin };
  }
  return { hit: false };
}

/** Test helper */
export function clearCache(): void {
  store.clear();
}
