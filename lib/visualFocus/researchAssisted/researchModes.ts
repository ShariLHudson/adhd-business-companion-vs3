/**
 * Research Modes — three plain-language depth levels the member chooses from.
 *
 * The copy adapts per map type so the member sees what a "detailed" version
 * means for *their* map, not one generic template.
 */

import type { VisualFocusMode } from "../types";
import type { MapDetailLevel } from "./types";

export type ResearchModeOption = {
  level: MapDetailLevel;
  label: string;
  /** One-line "best for" summary. */
  bestFor: string;
  /** What the result typically contains. */
  yields: string;
};

/** Base descriptions — the universal shape of each mode. */
export const RESEARCH_MODES: readonly ResearchModeOption[] = [
  {
    level: "overview",
    label: "Simple overview",
    bestFor: "Getting oriented without overwhelm.",
    yields: "A handful of major stages in plain language.",
  },
  {
    level: "working",
    label: "Practical working map",
    bestFor: "Actually following and planning the work.",
    yields: "Stages, action steps, decisions, and useful notes.",
  },
  {
    level: "detailed",
    label: "Detailed map",
    bestFor: "Training, delegation, SOPs, or complex planning.",
    yields: "Substeps, tools, checks, warnings, and source notes.",
  },
] as const;

/** Rough node budget per level, so builders adapt depth consistently. */
export const DETAIL_NODE_BUDGET: Record<
  MapDetailLevel,
  { primary: number; childrenPerPrimary: number }
> = {
  overview: { primary: 6, childrenPerPrimary: 0 },
  working: { primary: 8, childrenPerPrimary: 2 },
  detailed: { primary: 10, childrenPerPrimary: 4 },
};

/**
 * The "yields" line phrased for a specific map type. Keeps the member oriented
 * — a detailed Process Map and a detailed Decision Map promise different things.
 */
export function describeDetailedYieldForMap(mode: VisualFocusMode): string {
  switch (mode) {
    case "process-map":
      return "Steps, substeps, tools, quality checks, and troubleshooting.";
    case "decision-tree":
      return "Options, criteria, tradeoffs, risks, and a suggested next step.";
    case "relationship-map":
      return "People, roles, dependencies, and communication paths.";
    case "journey-map":
      return "Stages, actions, emotions, friction, and moments that matter.";
    case "timeline-map":
      return "Milestones, sequence, durations, and dependencies.";
    case "strategy-map":
      return "Pillars, initiatives, measures, assumptions, and risks.";
    case "opportunity-map":
      return "Needs, gaps, potential offers, and validation questions.";
    case "system-map":
      return "Components, flows, feedback loops, and bottlenecks.";
    case "priority-map":
      return "Items, criteria, and how each score was formed.";
    case "mind-map":
    default:
      return "Major concepts, subtopics, examples, and related questions.";
  }
}

/**
 * Full mode options for a given map type, with the detailed yield specialized.
 */
export function researchModesForMap(
  mode: VisualFocusMode,
): ResearchModeOption[] {
  return RESEARCH_MODES.map((m) =>
    m.level === "detailed"
      ? { ...m, yields: describeDetailedYieldForMap(mode) }
      : { ...m },
  );
}

/** Normalize a free-text mode choice ("simple", "detailed one") to a level. */
export function resolveDetailLevel(
  input: string | null | undefined,
  fallback: MapDetailLevel = "working",
): MapDetailLevel {
  const t = (input ?? "").toLowerCase();
  if (!t) return fallback;
  if (/\b(overview|simple|simplest|light|quick|basic|high[- ]?level)\b/.test(t)) {
    return "overview";
  }
  if (/\b(detailed|detail|deep|thorough|expert|full|sop|training|complete)\b/.test(t)) {
    return "detailed";
  }
  if (/\b(working|practical|step[- ]?by[- ]?step|standard|normal|medium)\b/.test(t)) {
    return "working";
  }
  return fallback;
}
