import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { suggestSecondOrderEffects } from "../frameworks/secondOrderThinking";
import { assessReversibility } from "../frameworks/reversibility";
import type {
  HandoffContext,
  StrategicDecision,
  StrategyJudgmentTurn,
} from "../types";
import { analyzeStrategicStatement } from "./analyzeStrategicStatement";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { assessJudgmentStage } from "./assessJudgmentStage";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { designStrategicExperiment } from "./designExperiment";
import {
  generateStrategicOptions,
  shouldOfferStrategicOptions,
} from "./generateOptions";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { identifyStrategicRisks } from "./identifyRisks";
import { recommendStrategicHandoff } from "./recommendHandoff";
import { selectNextQuestion } from "./selectNextQuestion";
import { selectNextThinkingMove } from "./selectNextThinkingMove";

/**
 * Pure judgment turn over a Strategy Work Item.
 * Does not write storage — returns patch hints for the Chamber layer.
 */
export function analyzeStrategyWorkItem(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string },
): StrategyJudgmentTurn {
  const strategicQuestion = identifyStrategicQuestion(item, opts?.lastAnswer);
  const judgmentStage = assessJudgmentStage(item);
  const nextMove = selectNextThinkingMove(item, presentation, opts);
  const nextQuestion = selectNextQuestion(item, presentation, opts);
  const readiness = assessDecisionReadiness(item);
  const optionReadiness = assessOptionReadiness(item);
  const options = generateStrategicOptions(item, presentation);
  const showOptions = shouldOfferStrategicOptions(item);
  const lastStatementAnalysis = opts?.lastAnswer?.trim()
    ? analyzeStrategicStatement(opts.lastAnswer)
    : null;
  const { risks } = identifyStrategicRisks(item);
  const experiment = designStrategicExperiment(item);
  const recommendation = recommendStrategicHandoff(item);
  const secondOrder = suggestSecondOrderEffects(item);

  const handoff: HandoffContext = {
    recommendation,
    fromStage: judgmentStage,
    readiness: readiness.readiness,
  };

  const decision: StrategicDecision | null = item.chosenDirection?.trim()
    ? {
        direction: item.chosenDirection.trim(),
        rationale:
          item.decisionRationale?.trim() ||
          "Chosen after exploring options in the Strategy Chamber.",
        notChosen: item.notChosen ?? [],
        assumptionsToTest: item.assumptions ?? [],
        risksToWatch: item.risks ?? [],
        confidence: readiness.confidence,
        readiness: readiness.readiness,
        reversibility: assessReversibility(item.chosenDirection),
      }
    : null;

  const workItemPatch: Partial<StrategyWorkItem> = {
    currentStage: judgmentStage,
  };
  if (strategicQuestion.strategyTypeId && !item.strategyType) {
    workItemPatch.strategyType = strategicQuestion.strategyTypeId;
  }
  if (strategicQuestion.strategyTypeId) {
    const family = strategicQuestion.strategyTypeId;
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
  if (recommendation && item.chosenDirection?.trim()) {
    workItemPatch.recommendedNextDestination = recommendation.destinationId;
  }
  if (
    experiment &&
    (readiness.readiness === "ready_for_decision" ||
      judgmentStage === "test_confidence") &&
    !(item.experiments?.length)
  ) {
    workItemPatch.experiments = [experiment.smallAction];
  }

  return {
    strategicQuestion,
    judgmentStage,
    nextQuestion,
    readiness,
    options,
    showOptions,
    risks,
    experiment,
    handoff,
    decision,
    workItemPatch,
    nextMove,
    optionReadiness,
    lastStatementAnalysis,
  };
}
