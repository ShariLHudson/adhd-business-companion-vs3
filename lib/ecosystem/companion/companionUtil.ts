// Founder Ecosystem — Phase 13 companion helpers. Pure.

import type { FounderEvent } from "../events";
import type { Level, ScoredTrait } from "./companionTypes";

export const hourOf = (ts: string) => new Date(ts).getUTCHours();

export function scoreTexts(
  texts: string[],
  res: Record<string, RegExp>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of Object.keys(res)) out[key] = 0;
  for (const t of texts) {
    if (!t) continue;
    for (const key of Object.keys(res)) if (res[key].test(t)) out[key] += 1;
  }
  return out;
}

export function confidenceFromGap(top: number, second: number): Level {
  if (top <= 0) return "low";
  const gap = top - second;
  if (top >= 4 && gap >= 3) return "high";
  if (top >= 2 && gap >= 1) return "medium";
  return "low";
}

/** Pick the highest-scoring trait, with a fallback when all scores are zero. */
export function topTrait<T extends string>(
  scores: Record<string, number>,
  fallback: T,
): ScoredTrait<T> {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = ranked[0] ?? [fallback, 0];
  const second = ranked[1]?.[1] ?? 0;
  return {
    value: (topScore > 0 ? topKey : fallback) as T,
    score: topScore,
    confidence: confidenceFromGap(topScore, second),
  };
}

/** All traits scoring above a threshold (for "multiple styles allowed"). */
export function allTraits<T extends string>(
  scores: Record<string, number>,
  min = 1,
): ScoredTrait<T>[] {
  const ranked = Object.entries(scores)
    .filter(([, v]) => v >= min)
    .sort((a, b) => b[1] - a[1]);
  const top = ranked[0]?.[1] ?? 0;
  return ranked.map(([k, v], i) => ({
    value: k as T,
    score: v,
    confidence: confidenceFromGap(v, ranked[i + 1]?.[1] ?? 0) === "high" || v === top
      ? v >= 3
        ? "high"
        : "medium"
      : v >= 2
        ? "medium"
        : "low",
  }));
}

export const countType = (events: FounderEvent[], type: FounderEvent["type"]) =>
  events.filter((e) => e.type === type).length;
