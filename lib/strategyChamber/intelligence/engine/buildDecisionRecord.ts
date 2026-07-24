import type { StrategyDecisionRecordView, StrategyWorkItem } from "../../types";
import {
  buildStrategyDecisionRecord,
  decisionRecordSectionHasContent,
} from "../../decisionRecord";
import { identifyStrategicRisks } from "./identifyRisks";
import { designStrategicExperiment } from "./designExperiment";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import {
  generateFullStrategicOptions,
  shouldOfferStrategicOptions,
} from "./generateOptions";
import { compareFullStrategicOptions } from "./compareOptions";
import { recommendStrategicOption } from "./recommendOption";
import { memberFacingOptionName } from "../optionContract";

/**
 * Enrich the Chamber Decision Record from conversation — no empty padding.
 * Recommendation is never treated as the member’s confirmed decision.
 */
export function buildIntelligentDecisionRecord(
  item: StrategyWorkItem,
): StrategyDecisionRecordView {
  const base = buildStrategyDecisionRecord(item);
  const { risks, secondOrderEffects } = identifyStrategicRisks(item);
  const experiment = designStrategicExperiment(item);
  const readiness = assessDecisionReadiness(item);
  const confirmed = Boolean(item.chosenDirection?.trim() || item.decisionRecordConfirmed);

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
  if (!why.trim() && confirmed && secondOrderEffects[0]) {
    why = secondOrderEffects[0];
  }
  if (
    !why.trim() &&
    confirmed &&
    (readiness.readiness === "ready_for_decision" ||
      readiness.judgmentStage === "test_confidence") &&
    experiment
  ) {
    why = `A small test can reduce uncertainty: ${experiment.smallAction}`;
  }

  const record: StrategyDecisionRecordView = {
    ...base,
    whyThisDirectionFits: why,
    assumptionsToTest: uniqueAssumptions,
    risksToWatch: uniqueRisks,
  };

  // Phase 3 enrichment — only when options are ready or already considered
  if (shouldOfferStrategicOptions(item) || item.optionsConsidered?.length) {
    const full = generateFullStrategicOptions(item);
    if (full.length) {
      const comparison = compareFullStrategicOptions(full);
      record.optionsConsideredSummary = full.map(
        (o) => memberFacingOptionName(o),
      );
      record.whyOptionsDiffered = [comparison.distinctnessNote].filter(Boolean);
      record.tradeoffsSummary = comparison.lines.slice(0, 3);
      if (comparison.opportunityCostLines.length) {
        record.opportunityCostsSummary = comparison.opportunityCostLines.slice(
          0,
          2,
        );
      }
      const rev = full.map((o) => o.reversibility);
      if (rev.length) {
        const hardest = rev.includes("effectively_irreversible")
          ? "effectively_irreversible"
          : rev.includes("difficult_to_reverse")
            ? "difficult_to_reverse"
            : rev.includes("moderately_reversible")
              ? "moderately_reversible"
              : "easily_reversible";
        record.reversibilityNote = `Reversibility across options ranges; leading care level: ${hardest.replace(/_/g, " ")}.`;
      }
    }
  }

  if (experiment?.smallAction) {
    record.experimentsConsidered = [
      experiment.name
        ? `${experiment.name}: ${experiment.smallAction}`
        : experiment.smallAction,
    ];
  }

  if (!confirmed) {
    const rec = recommendStrategicOption(item);
    if (rec) {
      record.companionRecommendation = rec.memberCopy;
      // Never copy recommendation into directionYouChose
      record.directionYouChose = base.directionYouChose;
    }
  }

  if (item.unknowns?.[0] || experiment?.assumptionBeingTested) {
    record.whatWouldChangeTheDecision =
      item.unknowns?.[0] ||
      `If this assumption does not hold: ${experiment?.assumptionBeingTested}`;
  }

  // Strip empty optional Phase 3 fields so UI hide rules stay clean
  const optionalKeys: Array<keyof StrategyDecisionRecordView> = [
    "optionsConsideredSummary",
    "whyOptionsDiffered",
    "tradeoffsSummary",
    "opportunityCostsSummary",
    "reversibilityNote",
    "experimentsConsidered",
    "whatWouldChangeTheDecision",
    "companionRecommendation",
  ];
  for (const key of optionalKeys) {
    const value = record[key];
    if (Array.isArray(value) && value.length === 0) {
      delete record[key];
    }
    if (typeof value === "string" && !value.trim()) {
      delete record[key];
    }
  }

  void decisionRecordSectionHasContent;
  return record;
}
