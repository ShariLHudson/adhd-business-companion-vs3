import type { StrategyWorkItem } from "../../types";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import { hasCurrentReality } from "../frameworks/currentReality";
import { assessReversibility } from "../frameworks/reversibility";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

/**
 * Internal only — never surface these labels to the member.
 */
export type OptionReadiness =
  | "too_early"
  | "needs_question_clarity"
  | "needs_goal_clarity"
  | "needs_constraints"
  | "needs_capacity"
  | "needs_evidence"
  | "ready_for_initial_options"
  | "ready_for_comparison";

export type OptionReadinessAssessment = {
  readiness: OptionReadiness;
  /** True when it is helpful to show or generate options. */
  optionsReady: boolean;
  missing: string[];
  /** Easy reversible experiments may proceed with lighter readiness. */
  lightPathAllowed: boolean;
};

function textBlob(item: StrategyWorkItem): string {
  return [
    item.decisionStatement,
    item.currentReality,
    item.desiredDirection,
    ...(item.memberStatements ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Options wait until the strategic question and desired result are clear enough.
 * A reversible, low-risk experiment may require less information than a
 * difficult-to-reverse decision.
 */
export function assessOptionReadiness(
  item: StrategyWorkItem,
): OptionReadinessAssessment {
  const analysis = identifyStrategicQuestion(item);
  const missing: string[] = [];
  const blob = textBlob(item);
  const reversibility = assessReversibility(blob);
  const lightPathAllowed =
    reversibility === "easily_reversible" ||
    /\b(weekly email|pilot|small experiment|try a|test)\b/i.test(blob);

  if (!item.decisionStatement?.trim() || analysis.needsClarification) {
    missing.push("clear strategic question");
    return {
      readiness: "needs_question_clarity",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  if (!hasCurrentReality(item) && (item.memberStatements?.length ?? 0) < 1) {
    missing.push("current situation");
    return {
      readiness: "too_early",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  if (
    !item.desiredDirection?.trim() &&
    !(item.opportunities?.length) &&
    (item.memberStatements?.length ?? 0) < 2 &&
    !lightPathAllowed
  ) {
    missing.push("desired result");
    return {
      readiness: "needs_goal_clarity",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  const hasEvidence =
    Boolean(item.knownFacts?.length) ||
    Boolean(item.observations?.length) ||
    Boolean(item.currentReality?.trim());

  if (!hasEvidence && !lightPathAllowed) {
    missing.push("evidence or present-tense context");
    return {
      readiness: "needs_evidence",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  if (capacityAppearsTight(item) && !(item.constraints?.length)) {
    missing.push("capacity");
    return {
      readiness: "needs_capacity",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  if (
    !item.constraints?.length &&
    /\b(budget|cash|must keep|cannot afford|deadline)\b/i.test(blob) &&
    !lightPathAllowed
  ) {
    missing.push("important constraints");
    return {
      readiness: "needs_constraints",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  const hasConcernOrOpportunity =
    Boolean(item.risks?.length) ||
    Boolean(item.opportunities?.length) ||
    Boolean(item.assumptions?.length) ||
    (item.memberStatements?.length ?? 0) >= 2 ||
    lightPathAllowed;

  if (!hasConcernOrOpportunity) {
    missing.push("main concern or opportunity");
    return {
      readiness: "needs_evidence",
      optionsReady: false,
      missing,
      lightPathAllowed,
    };
  }

  if (item.optionsConsidered && item.optionsConsidered.length >= 2) {
    return {
      readiness: "ready_for_comparison",
      optionsReady: true,
      missing: [],
      lightPathAllowed,
    };
  }

  return {
    readiness: "ready_for_initial_options",
    optionsReady: true,
    missing: [],
    lightPathAllowed,
  };
}
