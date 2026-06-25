/**
 * Confidence Architecture — every inference carries confidence.
 * Patterns decay unless reinforced. User corrections outweigh inference.
 */

export type ConfidentValue<T> = {
  value: T;
  confidence: number;
  lastReinforcedAt: string;
  source: string;
};

export function confident<T>(
  value: T,
  confidence: number,
  source: string,
  now = new Date(),
): ConfidentValue<T> {
  return {
    value,
    confidence: clamp01(confidence),
    lastReinforcedAt: now.toISOString(),
    source,
  };
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Graceful forgetting — confidence weakens over time unless reinforced. */
export function decayConfidence(
  item: ConfidentValue<unknown>,
  now = new Date(),
  halfLifeDays = 21,
): number {
  const ageMs = now.getTime() - new Date(item.lastReinforcedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return item.confidence;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const decay = Math.pow(0.5, ageDays / halfLifeDays);
  return clamp01(item.confidence * decay);
}

export function reinforce<T>(
  item: ConfidentValue<T>,
  delta = 0.12,
  now = new Date(),
): ConfidentValue<T> {
  return {
    ...item,
    confidence: clamp01(item.confidence + delta),
    lastReinforcedAt: now.toISOString(),
  };
}

export function effectiveConfidence<T>(
  item: ConfidentValue<T>,
  now = new Date(),
): number {
  return decayConfidence(item, now);
}

/** High enough to influence conversation; low stays internal. */
export function isActionableConfidence(score: number, threshold = 0.55): boolean {
  return score >= threshold;
}
