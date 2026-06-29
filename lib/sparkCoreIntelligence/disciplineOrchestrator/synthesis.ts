/**
 * Unified recommendation synthesis — one Spark voice.
 */

import type {
  DisciplineContribution,
  OrchestrationScenario,
  ResolvedConflict,
  SupportMode,
  UnifiedRecommendation,
} from "./types";
import { aggregateConfidence, rankContributions } from "./weighting";

const SUPPORT_COPY: Record<SupportMode, string> = {
  conversation:
    "Let's take one small piece at a time — what feels heaviest right now?",
  focus_support:
    "We can narrow to a single next step. No need to solve everything today.",
};

export function synthesizeUnifiedRecommendation(input: {
  scenario: OrchestrationScenario;
  contributions: DisciplineContribution[];
  conflicts: ResolvedConflict[];
  supportModes: SupportMode[];
  exposeDisciplines: boolean;
}): UnifiedRecommendation {
  const { scenario, contributions, conflicts, supportModes, exposeDisciplines } =
    input;

  if (supportModes.length > 0 && contributions.length === 0) {
    const text =
      supportModes.map((m) => SUPPORT_COPY[m]).join(" ") ||
      SUPPORT_COPY.conversation;
    return {
      text,
      certaintyKind: "recommendation",
      exposeDisciplines: false,
    };
  }

  if (scenario === "simple_question" || contributions.length === 0) {
    return {
      text: "Answer directly from established knowledge — no expert stack needed.",
      certaintyKind: "fact",
      exposeDisciplines: false,
    };
  }

  if (conflicts.length > 0) {
    const primary = conflicts[0];
    return {
      text: primary.resolution,
      tradeoffNote: primary.tradeoffExplanation,
      certaintyKind: "recommendation",
      exposeDisciplines,
    };
  }

  const ranked = rankContributions(contributions);
  const primary = ranked[0];
  const secondary = ranked[1];

  let text = primary.internalRecommendation;
  if (secondary && ranked.length >= 3) {
    text = `${primary.internalRecommendation} Also: ${secondary.internalRecommendation}`;
  }

  if (scenario === "launch") {
    text = `For launch: ${primary.internalRecommendation}`;
  }

  if (scenario === "research") {
    text = `Start in Research — ${primary.internalRecommendation}`;
  }

  return {
    text,
    certaintyKind:
      aggregateConfidence(contributions) === "high" ? "recommendation" : "opinion",
    exposeDisciplines,
  };
}
