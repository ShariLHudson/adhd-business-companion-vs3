import type { StrategyWorkItem } from "../../types";
import type { DecisionReadiness } from "../../domainModel";
import { hasCurrentReality } from "../frameworks/currentReality";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import type {
  DecisionConfidence,
  DecisionReadinessAssessment,
} from "../types";
import { assessJudgmentStage } from "./assessJudgmentStage";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

/**
 * Readiness from actual evidence — never mark complete without member confirmation.
 * AI recommendation alone is never the member's decision.
 */
export function assessDecisionReadiness(
  item: StrategyWorkItem,
): DecisionReadinessAssessment {
  const analysis = identifyStrategicQuestion(item);
  const judgmentStage = assessJudgmentStage(item);
  const optionGate = assessOptionReadiness(item);
  const strategicQuestionClear =
    Boolean(item.decisionStatement?.trim()) && !analysis.needsClarification;
  const outcomeClearEnough = Boolean(
    item.desiredDirection?.trim() || item.chosenDirection?.trim(),
  );
  const constraintsKnown =
    Boolean(item.constraints?.length) || !capacityAppearsTight(item);
  const hasEvidence =
    Boolean(item.knownFacts?.length) ||
    Boolean(item.observations?.length) ||
    hasCurrentReality(item);
  const hasRealisticOption = Boolean(item.optionsConsidered?.length);
  const memberChoseDirection = Boolean(item.chosenDirection?.trim());
  const tradeoffsVisible = Boolean(
    item.tradeoffs?.length ||
      item.optionsConsidered?.some((o) => o.tradeoffs?.length),
  );
  const assumptionsVisible = Boolean(item.assumptions?.length);
  const risksReviewed = Boolean(item.risks?.length);
  const userReadyHint = Boolean(item.decisionRecordConfirmed);

  const missing: string[] = [];
  if (!strategicQuestionClear) missing.push("clear strategic question");
  if (!hasCurrentReality(item)) missing.push("current situation");
  if (!hasEvidence) missing.push("evidence");
  if (!outcomeClearEnough) missing.push("desired outcome");
  if (capacityAppearsTight(item) && !(item.constraints?.length)) {
    missing.push("capacity constraints");
  }
  if (!hasRealisticOption && optionGate.optionsReady) {
    missing.push("at least one realistic option");
  }
  if (hasRealisticOption && !tradeoffsVisible) {
    missing.push("tradeoffs");
  }
  if (hasRealisticOption && !risksReviewed) {
    missing.push("risks");
  }
  if (memberChoseDirection && !item.decisionRecordConfirmed) {
    missing.push("member confirmation");
  }

  let confidence: DecisionConfidence = "low";
  if (item.decisionRecordConfirmed && memberChoseDirection) {
    confidence = "confirmed";
  } else if (memberChoseDirection && tradeoffsVisible) {
    confidence = "strong";
  } else if (hasRealisticOption && strategicQuestionClear) {
    confidence = "moderate";
  } else if (strategicQuestionClear && hasCurrentReality(item)) {
    confidence = "emerging";
  }

  let readiness: DecisionReadiness = "problem_not_yet_clear";

  // Complete only with explicit member confirmation of their direction
  if (item.decisionRecordConfirmed && memberChoseDirection) {
    readiness = "decision_complete";
  } else if (
    memberChoseDirection &&
    item.decisionRecordConfirmed === false &&
    tradeoffsVisible &&
    risksReviewed
  ) {
    // Direction forming but not confirmed — ready to decide, not complete
    readiness = "ready_for_decision";
  } else if (
    memberChoseDirection &&
    tradeoffsVisible &&
    risksReviewed &&
    !item.decisionRecordConfirmed
  ) {
    readiness = "ready_for_decision";
  } else if (
    strategicQuestionClear &&
    hasCurrentReality(item) &&
    hasRealisticOption &&
    tradeoffsVisible &&
    risksReviewed &&
    memberChoseDirection
  ) {
    readiness = "ready_for_handoff";
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
    hasEvidence &&
    optionGate.optionsReady &&
    !hasRealisticOption
  ) {
    readiness = "more_options_needed";
  } else if (analysis.needsClarification || !strategicQuestionClear) {
    readiness = "problem_not_yet_clear";
  } else if (!hasCurrentReality(item) || !hasEvidence) {
    readiness = "reality_not_yet_understood";
  } else {
    readiness = "reality_not_yet_understood";
  }

  // Never elevate to handoff/complete without confirmation
  if (
    readiness === "ready_for_handoff" &&
    !item.decisionRecordConfirmed
  ) {
    readiness = "ready_for_decision";
  }

  return {
    readiness,
    confidence,
    judgmentStage,
    missing,
    strategicQuestionClear,
    outcomeClearEnough,
    constraintsKnown,
    hasRealisticOption: hasRealisticOption || memberChoseDirection,
    tradeoffsVisible,
    assumptionsVisible,
    risksReviewed,
    userReadyHint,
  };
}
