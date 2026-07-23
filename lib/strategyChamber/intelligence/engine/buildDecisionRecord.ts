import type { StrategyDecisionRecordView, StrategyWorkItem } from "../../types";
import { buildStrategyDecisionRecord } from "../../decisionRecord";
import { identifyStrategicRisks } from "./identifyRisks";
import { designStrategicExperiment } from "./designExperiment";
import { assessDecisionReadiness } from "./assessDecisionReadiness";

/**
 * Enrich the Chamber Decision Record from conversation — no empty padding.
 */
export function buildIntelligentDecisionRecord(
  item: StrategyWorkItem,
): StrategyDecisionRecordView {
  const base = buildStrategyDecisionRecord(item);
  const { risks, secondOrderEffects } = identifyStrategicRisks(item);
  const experiment = designStrategicExperiment(item);
  const readiness = assessDecisionReadiness(item);

  const riskLines = [
    ...base.risksToWatch,
    ...risks.map((r) => r.whatCouldHappen),
  ].filter(Boolean);
  const uniqueRisks = Array.from(new Set(riskLines)).slice(0, 4);

  const assumptions = [...base.assumptionsToTest];
  if (experiment?.assumptionBeingTested) {
    assumptions.push(experiment.assumptionBeingTested);
  }
  const uniqueAssumptions = Array.from(new Set(assumptions.filter(Boolean))).slice(
    0,
    4,
  );

  let why = base.whyThisDirectionFits;
  if (!why.trim() && secondOrderEffects[0]) {
    why = secondOrderEffects[0];
  }
  if (
    !why.trim() &&
    readiness.readiness === "ready_to_test" &&
    experiment
  ) {
    why = `A small test can reduce uncertainty: ${experiment.smallAction}`;
  }

  return {
    ...base,
    whyThisDirectionFits: why,
    assumptionsToTest: uniqueAssumptions,
    risksToWatch: uniqueRisks,
  };
}
