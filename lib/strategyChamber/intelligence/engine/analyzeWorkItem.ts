import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import {
  familyForStrategyTypeId,
  getDomainIntelligence,
  matchProblemDistinction,
} from "../domainIntelligence";
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
import {
  compareStrategicOptions,
  type OptionComparisonResult,
} from "./compareOptions";
import { designStrategicExperiment } from "./designExperiment";
import {
  generateFullStrategicOptions,
  generateStrategicOptions,
  shouldOfferStrategicOptions,
} from "./generateOptions";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { identifyStrategicRisks } from "./identifyRisks";
import { recommendStrategicOption } from "./recommendOption";
import { recommendStrategicHandoff } from "./recommendHandoff";
import { selectNextQuestion } from "./selectNextQuestion";
import { selectNextThinkingMove } from "./selectNextThinkingMove";
import { reversibilityDepth } from "../frameworks/reversibilityDepth";

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
  const showOptions = shouldOfferStrategicOptions(item);
  const fullOptions = showOptions
    ? generateFullStrategicOptions(item, presentation)
    : [];
  const options = showOptions
    ? generateStrategicOptions(item, presentation)
    : [];
  const lastStatementAnalysis = opts?.lastAnswer?.trim()
    ? analyzeStrategicStatement(opts.lastAnswer)
    : null;
  const { risks } = identifyStrategicRisks(item);
  const experiment = designStrategicExperiment(item);
  const handoffRecommendation = recommendStrategicHandoff(item);
  const secondOrder = suggestSecondOrderEffects(item);

  const comparisonMoves = new Set([
    "generate_options",
    "compare_options",
    "assess_tradeoffs",
    "assess_risk",
    "assess_reversibility",
    "design_experiment",
  ]);
  const optionComparison: OptionComparisonResult | null =
    showOptions || comparisonMoves.has(nextMove.move)
      ? compareStrategicOptions(options, presentation)
      : null;

  const handoff: HandoffContext = {
    recommendation: handoffRecommendation,
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
  if (strategicQuestion.strategyTypeId && !item.strategyFamily) {
    workItemPatch.strategyFamily = familyForStrategyTypeId(
      strategicQuestion.strategyTypeId,
    );
  }

  const activeDomain = getDomainIntelligence(
    strategicQuestion.strategyTypeId ?? item.strategyType,
  );
  const matchedProblemDistinction = matchProblemDistinction(
    activeDomain,
    [
      item.decisionStatement,
      item.currentReality,
      item.desiredDirection,
      opts?.lastAnswer,
    ]
      .filter(Boolean)
      .join(" "),
  );
  if (secondOrder.length && !(item.secondOrderEffects?.length)) {
    workItemPatch.secondOrderEffects = secondOrder;
  }
  if (risks.length && !(item.risks?.length)) {
    workItemPatch.risks = risks.map((r) => r.whatCouldHappen);
  }
  // Phase 3 — surface salient trade-offs when comparison is active
  if (
    optionComparison?.lines.length &&
    !(item.tradeoffs?.length) &&
    (showOptions || nextMove.move === "compare_options" || nextMove.move === "assess_tradeoffs")
  ) {
    workItemPatch.tradeoffs = optionComparison.lines.slice(0, 3);
  }
  if (handoffRecommendation && item.chosenDirection?.trim()) {
    workItemPatch.recommendedNextDestination = handoffRecommendation.destinationId;
  }
  if (
    experiment &&
    (readiness.readiness === "ready_for_decision" ||
      judgmentStage === "test_confidence") &&
    !(item.experiments?.length)
  ) {
    workItemPatch.experiments = [experiment.smallAction];
  }

  const optionRecommendation =
    showOptions && !item.chosenDirection?.trim()
      ? recommendStrategicOption(item, presentation)
      : null;
  const depth = reversibilityDepth(
    assessReversibility(item.chosenDirection || item.decisionStatement || ""),
  );

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
    fullOptions,
    optionComparison,
    recommendation: optionRecommendation || undefined,
    reversibilityDepth: depth,
    activeDomain,
    matchedProblemDistinction,
  };
}
