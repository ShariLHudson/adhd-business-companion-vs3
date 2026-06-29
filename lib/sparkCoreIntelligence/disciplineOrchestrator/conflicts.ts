/**
 * Internal conflict resolution — tradeoffs resolved before member sees one voice.
 */

import type {
  DisciplineContribution,
  ExecutiveDisciplineId,
  ResolvedConflict,
} from "./types";

type ConflictRule = {
  ids: ExecutiveDisciplineId[];
  detect: (contributions: DisciplineContribution[]) => boolean;
  tension: string;
  resolution: string;
  tradeoff: string;
};

const RULES: ConflictRule[] = [
  {
    ids: ["finance", "marketing"],
    detect: (c) =>
      c.some((x) => x.disciplineId === "finance") &&
      c.some((x) => x.disciplineId === "marketing") &&
      /\bmargin\b/i.test(c.find((x) => x.disciplineId === "finance")!.internalRecommendation) &&
      /\btest\b/i.test(c.find((x) => x.disciplineId === "marketing")!.internalRecommendation),
    tension: "Margin protection vs market testing",
    resolution: "Run a small price test on your warmest segment while holding margin on the core offer.",
    tradeoff:
      "You may sacrifice a little speed for confidence — but you avoid a costly broad change.",
  },
  {
    ids: ["sales", "finance"],
    detect: (c) =>
      c.some((x) => x.disciplineId === "sales") &&
      c.some((x) => x.disciplineId === "finance"),
    tension: "Close now vs protect profitability",
    resolution: "Lead with value on the call, but know your floor price before you negotiate.",
    tradeoff: "A discount can win a deal today — or train buyers to wait for one.",
  },
  {
    ids: ["marketing", "creative-direction"],
    detect: (c) =>
      c.some((x) => x.disciplineId === "marketing") &&
      c.some((x) => x.disciplineId === "creative-direction"),
    tension: "Performance messaging vs brand expression",
    resolution: "Let brand promise set the guardrails; let campaign data pick the headline.",
    tradeoff: "Pure creativity may delight — clear messaging converts.",
  },
  {
    ids: ["operations", "business-strategy"],
    detect: (c) =>
      c.some((x) => x.disciplineId === "operations") &&
      c.some((x) => x.disciplineId === "business-strategy"),
    tension: "Launch speed vs operational readiness",
    resolution: "Launch the smallest complete experience — ops covers only what the customer touches.",
    tradeoff: "Faster launch builds learning; unprepared delivery erodes trust.",
  },
];

export function resolveConflicts(
  contributions: DisciplineContribution[],
): ResolvedConflict[] {
  const resolved: ResolvedConflict[] = [];
  for (const rule of RULES) {
    if (rule.detect(contributions)) {
      resolved.push({
        disciplines: rule.ids,
        tension: rule.tension,
        resolution: rule.resolution,
        tradeoffExplanation: rule.tradeoff,
      });
    }
  }
  return resolved;
}

export function primaryResolution(
  conflicts: ResolvedConflict[],
  contributions: DisciplineContribution[],
): string | undefined {
  if (conflicts.length > 0) return conflicts[0].resolution;
  if (contributions.length === 0) return undefined;
  return contributions[0].internalRecommendation;
}
