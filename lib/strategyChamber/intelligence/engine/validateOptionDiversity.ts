/**
 * Option diversity validator — reject cosmetic variants and near-duplicates.
 */

import {
  normalizeOptionPattern,
  strategicRangeCategory,
} from "../patternLabels";
import type { StrategicOption } from "../optionContract";
import { axisForPattern } from "../frameworks/optionCatalog";

export type DiversityDimension =
  | "strategic_direction"
  | "primary_mechanism"
  | "resource_demand"
  | "risk"
  | "reversibility"
  | "expected_outcome"
  | "timing"
  | "capacity_burden"
  | "customer_impact"
  | "protects"
  | "gives_up";

export type OptionDiversityIssue = {
  code:
    | "cosmetic_variant"
    | "same_axis"
    | "same_mechanism"
    | "duplicate_pattern"
    | "execution_step"
    | "growth_assumed"
    | "capacity_ignored"
    | "not_materially_different";
  optionIds: string[];
  detail: string;
};

export type OptionDiversityResult = {
  ok: boolean;
  issues: OptionDiversityIssue[];
  /** Options kept after merging/rejecting cosmetic duplicates. */
  kept: StrategicOption[];
};

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter += 1;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function looksLikeExecutionStep(option: StrategicOption): boolean {
  const t = `${option.title} ${option.summary}`.toLowerCase();
  return (
    /\b(write|draft|schedule|post|send|update the spreadsheet|make a graphic)\b/.test(
      t,
    ) && !/\b(test|pilot|decide|direction|strategy|whether)\b/.test(t)
  );
}

function pairSimilarity(a: StrategicOption, b: StrategicOption): number {
  const titleSim = jaccard(tokenize(a.title), tokenize(b.title));
  const summarySim = jaccard(tokenize(a.summary), tokenize(b.summary));
  return Math.max(titleSim, summarySim);
}

/**
 * Validate that options are genuinely distinct across material dimensions.
 * Merges/rejects cosmetic variants (e.g. raise 10% vs 15% vs 20%).
 */
export function validateOptionDiversity(
  options: StrategicOption[],
): OptionDiversityResult {
  const issues: OptionDiversityIssue[] = [];
  const kept: StrategicOption[] = [];
  const seenPatterns = new Set<string>();
  const seenCategories = new Set<string>();

  for (const option of options) {
    const pattern = normalizeOptionPattern(option.optionPattern);
    const category = strategicRangeCategory(pattern);

    if (looksLikeExecutionStep(option)) {
      issues.push({
        code: "execution_step",
        optionIds: [option.id],
        detail: "Looks like an execution step, not a strategic direction.",
      });
      continue;
    }

    if (seenPatterns.has(pattern)) {
      issues.push({
        code: "duplicate_pattern",
        optionIds: [option.id],
        detail: `Duplicate pattern ${pattern}`,
      });
      continue;
    }

    let cosmetic = false;
    for (const prior of kept) {
      const sim = pairSimilarity(option, prior);
      const sameAxis =
        axisForPattern(pattern) ===
        axisForPattern(normalizeOptionPattern(prior.optionPattern));
      const sameRev = option.reversibility === prior.reversibility;
      const sameProtect =
        (option.protects || option.protectsList?.[0] || "") ===
        (prior.protects || prior.protectsList?.[0] || "");

      if (sim >= 0.72 && sameAxis) {
        issues.push({
          code: "cosmetic_variant",
          optionIds: [prior.id, option.id],
          detail: "Titles/summaries are too similar on the same strategic axis.",
        });
        cosmetic = true;
        break;
      }

      if (
        sameAxis &&
        sameRev &&
        sameProtect &&
        (option.mainTradeoff || "") === (prior.mainTradeoff || "")
      ) {
        issues.push({
          code: "not_materially_different",
          optionIds: [prior.id, option.id],
          detail: "Same axis, protection, trade-off, and reversibility.",
        });
        cosmetic = true;
        break;
      }

      // Explicit anti-pattern: percentage price variants
      if (
        /\braise (the )?price\b/i.test(option.title) &&
        /\braise (the )?price\b/i.test(prior.title) &&
        /\d+\s*%/.test(option.title + option.summary) &&
        /\d+\s*%/.test(prior.title + prior.summary)
      ) {
        issues.push({
          code: "cosmetic_variant",
          optionIds: [prior.id, option.id],
          detail: "Percentage price variants are not strategically distinct.",
        });
        cosmetic = true;
        break;
      }
    }

    if (cosmetic) continue;

    if (
      kept.length >= 1 &&
      seenCategories.has(category) &&
      kept.length >= 2
    ) {
      // Prefer different range categories when we already have two
      issues.push({
        code: "same_axis",
        optionIds: [option.id],
        detail: `Category ${category} already represented — prefer a different strategic range.`,
      });
      // Still allow if under 3 and no better option yet — keep for fill
    }

    seenPatterns.add(pattern);
    seenCategories.add(category);
    kept.push(option);
    if (kept.length >= 3) break;
  }

  // Growth-assumed set: all expand
  if (
    kept.length >= 2 &&
    kept.every((o) => strategicRangeCategory(o.optionPattern) === "expand")
  ) {
    issues.push({
      code: "growth_assumed",
      optionIds: kept.map((o) => o.id),
      detail: "Every option assumes expansion — add a non-growth path.",
    });
  }

  return {
    ok: issues.filter((i) =>
      ["cosmetic_variant", "duplicate_pattern", "not_materially_different", "growth_assumed"].includes(
        i.code,
      ),
    ).length === 0 && kept.length > 0,
    issues,
    kept: kept.slice(0, 3),
  };
}

export function diversityDimensionsCompared(): DiversityDimension[] {
  return [
    "strategic_direction",
    "primary_mechanism",
    "resource_demand",
    "risk",
    "reversibility",
    "expected_outcome",
    "timing",
    "capacity_burden",
    "customer_impact",
    "protects",
    "gives_up",
  ];
}
