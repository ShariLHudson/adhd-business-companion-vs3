import type { StrategyWorkItem } from "../../types";
import type { DecisionReadiness } from "../../domainModel";
import { hasCurrentReality } from "../frameworks/currentReality";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import type {
  DecisionConfidence,
  DecisionReadinessAssessment,
} from "../types";
import { assessJudgmentStage } from "./assessJudgmentStage";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

export function assessDecisionReadiness(
  item: StrategyWorkItem,
): DecisionReadinessAssessment {
  const analysis = identifyStrategicQuestion(item);
  const judgmentStage = assessJudgmentStage(item);
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
  const risksReviewed = Boolean(item.risks?.length);
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
  if (hasRealisticOption && !tradeoffsVisible) {
    missing.push("tradeoffs");
  }
  if (hasRealisticOption && !risksReviewed) {
    missing.push("risks");
  }

  let confidence: DecisionConfidence = "low";
  if (item.decisionRecordConfirmed) confidence = "confirmed";
  else if (item.chosenDirection?.trim() && tradeoffsVisible) confidence = "strong";
  else if (hasRealisticOption && strategicQuestionClear) confidence = "moderate";
  else if (strategicQuestionClear && hasCurrentReality(item)) {
    confidence = "emerging";
  }

  let readiness: DecisionReadiness = "problem_not_yet_clear";

  if (item.decisionRecordConfirmed && item.chosenDirection?.trim()) {
    readiness = "decision_complete";
  } else if (
    item.chosenDirection?.trim() &&
    tradeoffsVisible &&
    risksReviewed
  ) {
    readiness = "ready_for_handoff";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    hasRealisticOption &&
    tradeoffsVisible &&
    risksReviewed &&
    confidence !== "low"
  ) {
    readiness = "ready_for_decision";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    hasRealisticOption &&
    tradeoffsVisible &&
    !risksReviewed
  ) {
    readiness = "risks_not_reviewed";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    hasRealisticOption &&
    !tradeoffsVisible
  ) {
    readiness = "tradeoffs_not_evaluated";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    !hasRealisticOption
  ) {
    readiness = "more_options_needed";
  } else if (
    analysis.needsClarification ||
    !strategicQuestionClear
  ) {
    readiness = "problem_not_yet_clear";
  } else if (!hasCurrentReality(item)) {
    readiness = "reality_not_yet_understood";
  } else {
    readiness = "reality_not_yet_understood";
  }

  return {
    readiness,
    confidence,
    judgmentStage,
    missing,
    strategicQuestionClear,
    outcomeClearEnough,
    constraintsKnown,
    hasRealisticOption,
    tradeoffsVisible,
    assumptionsVisible,
    risksReviewed,
    userReadyHint,
  };
}
