import type { StrategyWorkItem } from "../../types";
import { designDefaultExperiment } from "../frameworks/experiments";
import type { StrategicExperiment } from "../types";
import { assessDecisionReadiness } from "./assessDecisionReadiness";

export function designStrategicExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const readiness = assessDecisionReadiness(item);
  if (
    readiness.readiness === "ready_for_decision" ||
    readiness.judgmentStage === "test_confidence" ||
    readiness.confidence === "low" ||
    readiness.confidence === "emerging" ||
    /\b(test|pilot|experiment)\b/i.test(item.chosenDirection || "")
  ) {
    return designDefaultExperiment(item);
  }
  if (!item.chosenDirection?.trim() && item.optionsConsidered?.length) {
    return designDefaultExperiment(item);
  }
  return null;
}
