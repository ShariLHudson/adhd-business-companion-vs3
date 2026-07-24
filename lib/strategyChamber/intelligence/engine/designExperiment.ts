import type { StrategyWorkItem } from "../../types";
import {
  designDefaultExperiment,
  shouldPreferExperiment,
} from "../frameworks/experiments";
import type { StrategicExperiment } from "../types";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { assessReversibility } from "../frameworks/reversibility";

export function designStrategicExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const readiness = assessDecisionReadiness(item);
  const reverse = assessReversibility(item.chosenDirection || item.decisionStatement || "");
  if (
    readiness.readiness === "ready_for_decision" ||
    readiness.judgmentStage === "test_confidence" ||
    readiness.confidence === "low" ||
    readiness.confidence === "emerging" ||
    /\b(test|pilot|experiment)\b/i.test(item.chosenDirection || "") ||
    shouldPreferExperiment(item) ||
    reverse === "difficult_to_reverse" ||
    reverse === "effectively_irreversible"
  ) {
    return designDefaultExperiment(item);
  }
  if (!item.chosenDirection?.trim() && item.optionsConsidered?.length) {
    return designDefaultExperiment(item);
  }
  return null;
}
