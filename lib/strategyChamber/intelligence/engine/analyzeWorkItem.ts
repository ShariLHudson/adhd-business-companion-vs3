import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { suggestSecondOrderEffects } from "../frameworks/secondOrderThinking";
import type { StrategyJudgmentTurn } from "../types";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { designStrategicExperiment } from "./designExperiment";
import {
  generateStrategicOptions,
  shouldOfferStrategicOptions,
} from "./generateOptions";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { identifyStrategicRisks } from "./identifyRisks";
import { recommendStrategicHandoff } from "./recommendHandoff";
import { selectNextQuestion } from "./selectNextQuestion";

/**
 * Pure judgment turn over a Strategy Work Item.
 * Does not write storage — returns patch hints for the Chamber layer.
 */
export function analyzeStrategyWorkItem(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string },
): StrategyJudgmentTurn {
  const questionAnalysis = identifyStrategicQuestion(item, opts?.lastAnswer);
  const nextQuestion = selectNextQuestion(item, presentation, opts);
  const readiness = assessDecisionReadiness(item);
  const options = generateStrategicOptions(item, presentation);
  const showOptions = shouldOfferStrategicOptions(item);
  const { risks } = identifyStrategicRisks(item);
  const experiment = designStrategicExperiment(item);
  const handoff = recommendStrategicHandoff(item);
  const secondOrder = suggestSecondOrderEffects(item);

  const workItemPatch: Partial<StrategyWorkItem> = {};
  if (questionAnalysis.strategyTypeId && !item.strategyType) {
    workItemPatch.strategyType = questionAnalysis.strategyTypeId;
  }
  if (questionAnalysis.strategyTypeId) {
    const family = questionAnalysis.strategyTypeId;
    // family mapped loosely for store; registry owns precise family
    if (!item.strategyFamily) {
      if (family === "pricing" || family === "hiring_delegation") {
        workItemPatch.strategyFamily =
          family === "pricing" ? "money_and_resources" : "people_and_leadership";
      } else if (family === "growth" || family === "market_customer") {
        workItemPatch.strategyFamily = "customer_and_market";
      } else if (family === "offer") {
        workItemPatch.strategyFamily = "offers_and_innovation";
      } else if (
        family === "capacity_focus" ||
        family === "personal_direction"
      ) {
        workItemPatch.strategyFamily = "personal_direction";
      } else {
        workItemPatch.strategyFamily = "business_direction";
      }
    }
  }
  if (secondOrder.length && !(item.secondOrderEffects?.length)) {
    workItemPatch.secondOrderEffects = secondOrder;
  }
  if (risks.length && !(item.risks?.length)) {
    workItemPatch.risks = risks.map((r) => r.whatCouldHappen);
  }
  if (handoff && item.chosenDirection?.trim()) {
    workItemPatch.recommendedNextDestination = handoff.destinationId;
  }
  if (
    experiment &&
    readiness.readiness === "ready_to_test" &&
    !(item.experiments?.length)
  ) {
    workItemPatch.experiments = [experiment.smallAction];
  }

  return {
    questionAnalysis,
    nextQuestion,
    readiness,
    options,
    showOptions,
    risks,
    experiment,
    handoff,
    workItemPatch,
  };
}
