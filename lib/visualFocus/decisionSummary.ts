/**
 * Decision Summary — a calm one-page synthesis after mapping.
 *
 * Members map to think; when they pause, Spark can pull the map together
 * into five plain lines: what you're deciding, what matters most, the
 * strongest opportunity, the biggest risk, and a suggested next step.
 * This is generated only with permission (see DecisionSummarySheet) so it
 * never feels like an auto-produced report.
 *
 * Pure derivation from the map's existing analysis — no new intelligence
 * pass, no persistence, no side effects.
 */

import type { VisualFocusAnalysis, VisualFocusMap } from "./types";

export type DecisionSummary = {
  /** Warm, plain heading — the member's own topic. */
  deciding: string;
  /** What matters most — the clearest pattern or key relationship. */
  mattersMost: string | null;
  /** Strongest opportunity Spark noticed. */
  strongestOpportunity: string | null;
  /** Biggest risk worth holding in mind. */
  biggestRisk: string | null;
  /** One suggested next step — never a demand. */
  nextStep: string | null;
};

function firstMeaningful(list: string[] | undefined): string | null {
  if (!list) return null;
  for (const entry of list) {
    const trimmed = entry?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/**
 * Pick the analysis a summary should read from. Business Canvas maps that
 * have explored a change carry a dedicated impact analysis; everything
 * else uses the map's primary analysis.
 */
function analysisForSummary(map: VisualFocusMap): VisualFocusAnalysis | null {
  if (
    map.mode === "business-canvas" &&
    map.businessCanvasImpactAnalysis &&
    map.businessCanvasWorkflow === "generatedImpact"
  ) {
    return map.businessCanvasImpactAnalysis;
  }
  return map.analysis ?? null;
}

export function buildDecisionSummary(map: VisualFocusMap): DecisionSummary {
  const analysis = analysisForSummary(map);
  const title = map.title?.trim();
  const deciding =
    title && title.toLowerCase() !== "untitled map"
      ? title
      : firstMeaningful(analysis?.summary ? [analysis.summary] : []) ??
        "The idea you've been mapping";

  if (!analysis) {
    return {
      deciding,
      mattersMost: null,
      strongestOpportunity: null,
      biggestRisk: null,
      nextStep: null,
    };
  }

  const mattersMost =
    firstMeaningful(analysis.patterns) ??
    firstMeaningful(analysis.keyRelationships) ??
    (analysis.summary?.trim() || null);

  return {
    deciding,
    mattersMost,
    strongestOpportunity: firstMeaningful(analysis.opportunities),
    biggestRisk: firstMeaningful(analysis.risks),
    nextStep:
      firstMeaningful(analysis.nextSteps) ??
      firstMeaningful(analysis.recommendations),
  };
}

/** Is there enough to synthesize a worthwhile summary yet? */
export function canBuildDecisionSummary(map: VisualFocusMap): boolean {
  return Boolean(analysisForSummary(map));
}
