import type { StrategyWorkItem } from "../../types";
import type { StrategicJudgmentStage } from "../../domainModel";
import { hasCurrentReality } from "../frameworks/currentReality";
import { needsFactAssumptionSplit } from "../frameworks/factsAndAssumptions";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";

/**
 * Derive where the conversation sits on the Strategy judgment backbone.
 * Not a forced wizard — reflects what is known on the work item.
 */
export function assessJudgmentStage(
  item: StrategyWorkItem,
): StrategicJudgmentStage {
  const analysis = identifyStrategicQuestion(item);

  if (item.decisionRecordConfirmed && item.chosenDirection?.trim()) {
    if (item.status === "under_review" || item.reviewDate) {
      return "review_results";
    }
    return "prepare_handoff";
  }

  if (item.chosenDirection?.trim()) {
    if (
      item.experiments?.length ||
      /\b(test|pilot|experiment)\b/i.test(item.chosenDirection)
    ) {
      return "test_confidence";
    }
    return "choose_direction";
  }

  if (item.optionsConsidered?.length) {
    const tradeoffsVisible = Boolean(
      item.tradeoffs?.length ||
        item.optionsConsidered.some((o) => o.tradeoffs?.length),
    );
    if (tradeoffsVisible || (item.risks?.length ?? 0) > 0) {
      return "evaluate_tradeoffs";
    }
    return "explore_options";
  }

  if (
    needsFactAssumptionSplit(item) ||
    ((item.memberStatements?.length ?? 0) >= 2 &&
      !(item.assumptions?.length) &&
      hasCurrentReality(item))
  ) {
    return "surface_assumptions";
  }

  if (
    hasCurrentReality(item) &&
    ((item.knownFacts?.length ?? 0) > 0 ||
      (item.observations?.length ?? 0) > 0) &&
    !item.desiredDirection?.trim()
  ) {
    return "gather_evidence";
  }

  if (
    item.decisionStatement?.trim() &&
    !analysis.needsClarification &&
    !hasCurrentReality(item)
  ) {
    return "understand_reality";
  }

  if (
    !item.decisionStatement?.trim() ||
    analysis.needsClarification
  ) {
    return "clarify_question";
  }

  if (!hasCurrentReality(item)) {
    return "understand_reality";
  }

  if (!item.desiredDirection?.trim()) {
    return "gather_evidence";
  }

  return "explore_options";
}
