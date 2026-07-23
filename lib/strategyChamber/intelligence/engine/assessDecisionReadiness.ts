import type { StrategyWorkItem } from "../../types";
import { hasCurrentReality } from "../frameworks/currentReality";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import type {
  DecisionConfidence,
  DecisionReadiness,
  DecisionReadinessAssessment,
} from "../types";

export function assessDecisionReadiness(
  item: StrategyWorkItem,
): DecisionReadinessAssessment {
  const analysis = identifyStrategicQuestion(item);
  const strategicQuestionClear =
    Boolean(item.decisionStatement?.trim()) && !analysis.needsClarification;
  const outcomeClearEnough = Boolean(
    item.desiredDirection?.trim() || item.chosenDirection?.trim(),
  );
  const constraintsKnown =
    Boolean(item.constraints?.length) || !capacityAppearsTight(item);
  const hasRealisticOption = Boolean(
    item.optionsConsidered?.length || item.chosenDirection?.trim(),
  );
  const tradeoffsVisible = Boolean(
    item.tradeoffs?.length ||
      item.optionsConsidered?.some((o) => o.tradeoffs?.length),
  );
  const assumptionsVisible = Boolean(item.assumptions?.length);
  const userReadyHint = Boolean(
    item.chosenDirection?.trim() || item.decisionRecordConfirmed,
  );

  const missing: string[] = [];
  if (!strategicQuestionClear) missing.push("clear strategic question");
  if (!hasCurrentReality(item)) missing.push("current situation");
  if (!outcomeClearEnough) missing.push("desired outcome");
  if (capacityAppearsTight(item) && !(item.constraints?.length)) {
    missing.push("capacity constraints");
  }
  if (!hasRealisticOption) missing.push("at least one realistic option");

  let confidence: DecisionConfidence = "low";
  if (item.decisionRecordConfirmed) confidence = "confirmed";
  else if (item.chosenDirection?.trim() && tradeoffsVisible) confidence = "strong";
  else if (hasRealisticOption && strategicQuestionClear) confidence = "moderate";
  else if (strategicQuestionClear && hasCurrentReality(item)) {
    confidence = "emerging";
  }

  let readiness: DecisionReadiness = "not_ready";
  if (item.chosenDirection?.trim() && item.decisionRecordConfirmed) {
    readiness = "ready_to_choose";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    hasRealisticOption &&
    confidence !== "low" &&
    /\b(test|pilot|experiment|new members)\b/i.test(
      item.optionsConsidered?.map((o) => o.title).join(" ") || "",
    )
  ) {
    readiness = "ready_to_test";
  } else if (
    analysis.needsClarification ||
    missing.includes("clear strategic question")
  ) {
    readiness = "needs_more_evidence";
  } else if (capacityAppearsTight(item) && !constraintsKnown) {
    readiness = "needs_capacity_review";
  } else if (
    item.entryReason === "rethink_current_direction" &&
    !item.optionsConsidered?.length
  ) {
    readiness = "needs_another_perspective";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    outcomeClearEnough &&
    hasRealisticOption &&
    tradeoffsVisible
  ) {
    readiness = "ready_to_choose";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    !hasRealisticOption
  ) {
    readiness = "needs_more_evidence";
  } else if (!userReadyHint && missing.length <= 1) {
    readiness = "needs_reflection";
  }

  return {
    readiness,
    confidence,
    missing,
    strategicQuestionClear,
    outcomeClearEnough,
    constraintsKnown,
    hasRealisticOption,
    tradeoffsVisible,
    assumptionsVisible,
    userReadyHint,
  };
}
