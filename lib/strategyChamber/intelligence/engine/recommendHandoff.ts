import type { StrategyWorkItem } from "../../types";
import { recommendHandoffDestination } from "../routing/destinationRules";
import type { HandoffRecommendation } from "../types";
import { assessDecisionReadiness } from "./assessDecisionReadiness";

export function recommendStrategicHandoff(
  item: StrategyWorkItem,
): HandoffRecommendation | null {
  const readiness = assessDecisionReadiness(item);
  return recommendHandoffDestination(item, readiness);
}
