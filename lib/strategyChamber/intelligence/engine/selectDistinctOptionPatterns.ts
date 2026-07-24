/**
 * Choose ≤3 strategically distinct option patterns.
 * Prefer different axes so paths are not cosmetic variants of the same idea.
 */

import { shouldPreferStabilizeOrTest } from "../frameworks/capacityFit";
import { axisForPattern } from "../frameworks/optionCatalog";
import type { OptionPatternId, StrategyTypeId } from "../types";
import type { StrategyWorkItem } from "../../types";

const NON_GROWTH_AXES = new Set(["protect", "wait", "reduce", "stop", "test", "narrow"]);

/** Patterns that count as valid “not expanding” paths. */
export const CONSERVATIVE_PATTERNS: readonly OptionPatternId[] = [
  "stabilize",
  "simplify",
  "delay",
  "test",
  "stop",
  "continue",
  "protect_base",
];

export function selectDistinctOptionPatterns(
  candidatePatterns: readonly OptionPatternId[],
  item: StrategyWorkItem,
  opts?: {
    strategyTypeId?: StrategyTypeId | null;
    max?: number;
  },
): OptionPatternId[] {
  const max = Math.min(3, Math.max(1, opts?.max ?? 3));
  const capacityTight = shouldPreferStabilizeOrTest(item);
  const text = [
    item.decisionStatement,
    item.desiredDirection,
    item.currentReality,
    ...(item.constraints ?? []),
    ...(item.risks ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const preferred: OptionPatternId[] = [];
  const pushUnique = (p: OptionPatternId | undefined) => {
    if (!p) return;
    if (!candidatePatterns.includes(p) && !CONSERVATIVE_PATTERNS.includes(p)) {
      // allow stabilize/test even if not on type list when capacity is tight
      if (!(capacityTight && (p === "stabilize" || p === "test" || p === "simplify"))) {
        return;
      }
    }
    if (!preferred.includes(p)) preferred.push(p);
  };

  if (capacityTight) {
    pushUnique(
      candidatePatterns.find((p) => p === "stabilize") ||
        candidatePatterns.find((p) => p === "simplify") ||
        "stabilize",
    );
    pushUnique(candidatePatterns.find((p) => p === "test") || "test");
  }

  if (/\b(wait|not sure|unclear|don'?t know yet)\b/.test(text)) {
    pushUnique(candidatePatterns.find((p) => p === "delay") || "delay");
  }
  if (/\b(stop|sunset|quit|walk away|end this)\b/.test(text)) {
    pushUnique(candidatePatterns.find((p) => p === "stop") || "stop");
  }
  if (/\b(keep|stay|current direction|as is)\b/.test(text)) {
    pushUnique(candidatePatterns.find((p) => p === "continue"));
  }

  // Prefer type-listed patterns next, diversifying by axis
  const selected: OptionPatternId[] = [];
  const usedAxes = new Set<string>();

  const consider = (pattern: OptionPatternId) => {
    if (selected.length >= max) return;
    if (selected.includes(pattern)) return;
    const axis = axisForPattern(pattern);
    if (usedAxes.has(axis) && selected.length > 0) return;
    // Avoid defaulting the whole set to expansion when capacity is tight
    if (
      capacityTight &&
      axis === "expand" &&
      selected.some((p) => NON_GROWTH_AXES.has(axisForPattern(p)))
    ) {
      return;
    }
    selected.push(pattern);
    usedAxes.add(axis);
  };

  for (const p of preferred) consider(p);

  const orderedCandidates = [...candidatePatterns].sort((a, b) => {
    const score = (p: OptionPatternId) => {
      let s = 0;
      if (capacityTight && CONSERVATIVE_PATTERNS.includes(p)) s += 3;
      if (!capacityTight && (p === "expand" || p === "raise_price")) s += 1;
      if (opts?.strategyTypeId === "growth" && p === "expand") s -= 1; // still not default-only
      return s;
    };
    return score(b) - score(a);
  });

  for (const p of orderedCandidates) consider(p);

  // Fill remaining slots allowing a second pattern on a new axis from conservatives
  if (selected.length < max) {
    for (const p of CONSERVATIVE_PATTERNS) {
      if (selected.length >= max) break;
      if (!candidatePatterns.includes(p) && p !== "stabilize" && p !== "test") {
        continue;
      }
      consider(p);
    }
  }

  // Last resort: ensure at least two axes when possible
  if (selected.length === 1 && candidatePatterns.length > 1) {
    const alt = candidatePatterns.find(
      (p) => axisForPattern(p) !== axisForPattern(selected[0]!),
    );
    if (alt) selected.push(alt);
  }

  return selected.slice(0, max);
}
