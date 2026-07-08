import type { SparkNoteCatalogEntry } from "./types";
import { getCategoryAffinity } from "./persistence";

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Weight catalog entries by learned category/tag affinity. */
export function scoreEntryAffinity(entry: SparkNoteCatalogEntry): number {
  const affinity = getCategoryAffinity();
  let score = 10;
  score += affinity[entry.category] ?? 0;
  for (const tag of entry.tags ?? []) {
    score += (affinity[`tag:${tag}`] ?? 0) * 0.5;
  }
  return score;
}

/** Pick from pool weighted by user affinity signals. */
export function pickAffinityWeightedFromPool(
  pool: readonly SparkNoteCatalogEntry[],
  seed: string,
): SparkNoteCatalogEntry | null {
  if (pool.length === 0) return null;
  const weights = pool.map((entry) => scoreEntryAffinity(entry));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) {
    return pool[hashSeed(seed) % pool.length] ?? null;
  }
  let roll = hashSeed(seed) % total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i]!;
    if (roll < 0) return pool[i]!;
  }
  return pool[pool.length - 1] ?? null;
}

export function topAffinityTopics(limit = 3): string[] {
  const affinity = getCategoryAffinity();
  return Object.entries(affinity)
    .filter(([key]) => !key.startsWith("tag:"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key.replace(/_/g, " "));
}
