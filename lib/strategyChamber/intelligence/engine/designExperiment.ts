import type { StrategyWorkItem } from "../../types";
import {
  designDefaultExperiment,
  evaluateExperimentTriggers,
  shouldPreferExperiment,
} from "../frameworks/experiments";
import type { StrategicExperiment } from "../types";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { assessReversibility } from "../frameworks/reversibility";

export function designStrategicExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const readiness = assessDecisionReadiness(item);
  const reverse = assessReversibility(
    item.chosenDirection || item.decisionStatement || "",
  );
  const triggers = evaluateExperimentTriggers(item);

  if (triggers.skipReason && !shouldPreferExperiment(item)) {
    // Closing-the-business style: skip casual experiment
    if (/clos(e|ing) the business/i.test(item.decisionStatement || "")) {
      return null;
    }
  }

  if (
    readiness.readiness === "ready_for_decision" ||
    readiness.judgmentStage === "test_confidence" ||
    readiness.confidence === "low" ||
    readiness.confidence === "emerging" ||
    /\b(test|pilot|experiment|weekly email)\b/i.test(
      `${item.chosenDirection || ""} ${item.decisionStatement || ""}`,
    ) ||
    triggers.prefer ||
    shouldPreferExperiment(item) ||
    reverse === "difficult_to_reverse"
  ) {
    return designDefaultExperiment(item);
  }
  if (!item.chosenDirection?.trim() && item.optionsConsidered?.length) {
    return designDefaultExperiment(item);
  }
  return null;
}
