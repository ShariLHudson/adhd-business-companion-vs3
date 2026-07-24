import type { StrategyWorkItem } from "../../types";
import { hasCurrentReality } from "../frameworks/currentReality";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

/**
 * Internal only — never surface these labels to the member.
 */
export type OptionReadiness =
  | "too_early"
  | "needs_question_clarity"
  | "needs_goal_clarity"
  | "needs_constraints"
  | "needs_evidence"
  | "ready_for_initial_options"
  | "ready_for_comparison";

export type OptionReadinessAssessment = {
  readiness: OptionReadiness;
  /** True when it is helpful to show or generate options. */
  optionsReady: boolean;
  missing: string[];
};

/**
 * Options wait until the strategic question, goal, constraints/capacity,
 * and at least some evidence or concern/opportunity are known.
 */
export function assessOptionReadiness(
  item: StrategyWorkItem,
): OptionReadinessAssessment {
  const analysis = identifyStrategicQuestion(item);
  const missing: string[] = [];

  if (!item.decisionStatement?.trim() || analysis.needsClarification) {
    missing.push("clear strategic question");
    return {
      readiness: "needs_question_clarity",
      optionsReady: false,
      missing,
    };
  }

  if (!hasCurrentReality(item) && (item.memberStatements?.length ?? 0) < 1) {
    missing.push("current situation");
    return { readiness: "too_early", optionsReady: false, missing };
  }

  if (
    !item.desiredDirection?.trim() &&
    !(item.opportunities?.length) &&
    (item.memberStatements?.length ?? 0) < 2
  ) {
    missing.push("desired result");
    return {
      readiness: "needs_goal_clarity",
      optionsReady: false,
      missing,
    };
  }

  const hasEvidence =
    Boolean(item.knownFacts?.length) ||
    Boolean(item.observations?.length) ||
    Boolean(item.currentReality?.trim());
  const hasConcernOrOpportunity =
    Boolean(item.risks?.length) ||
    Boolean(item.opportunities?.length) ||
    Boolean(item.assumptions?.length) ||
    (item.memberStatements?.length ?? 0) >= 2;

  if (!hasEvidence) {
    missing.push("evidence or present-tense context");
    return { readiness: "needs_evidence", optionsReady: false, missing };
  }

  if (
    !item.constraints?.length &&
    /\b(overwhelm|capacity|time|energy|burned? out|can't keep up)\b/i.test(
      [
        item.currentReality,
        item.decisionStatement,
        ...(item.memberStatements ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    )
  ) {
    missing.push("capacity constraints");
    return {
      readiness: "needs_constraints",
      optionsReady: false,
      missing,
    };
  }

  if (!hasConcernOrOpportunity && (item.memberStatements?.length ?? 0) < 2) {
    missing.push("main concern or opportunity");
    return { readiness: "needs_evidence", optionsReady: false, missing };
  }

  if (item.optionsConsidered && item.optionsConsidered.length >= 2) {
    return {
      readiness: "ready_for_comparison",
      optionsReady: true,
      missing: [],
    };
  }

  return {
    readiness: "ready_for_initial_options",
    optionsReady: true,
    missing: [],
  };
}
