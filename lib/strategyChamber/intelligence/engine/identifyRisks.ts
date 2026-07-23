import type { StrategyWorkItem } from "../../types";
import { buildRiskAssessments } from "../frameworks/risk";
import { suggestSecondOrderEffects } from "../frameworks/secondOrderThinking";
import type { RiskAssessment } from "../types";

export function identifyStrategicRisks(item: StrategyWorkItem): {
  risks: RiskAssessment[];
  secondOrderEffects: string[];
} {
  return {
    risks: buildRiskAssessments(item),
    secondOrderEffects: suggestSecondOrderEffects(item),
  };
}
