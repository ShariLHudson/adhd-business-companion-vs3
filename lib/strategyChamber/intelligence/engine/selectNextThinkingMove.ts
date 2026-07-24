import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import type { StrategicJudgmentStage } from "../../domainModel";
import { hasCurrentReality } from "../frameworks/currentReality";
import { needsFactAssumptionSplit } from "../frameworks/factsAndAssumptions";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import { assessReversibility } from "../frameworks/reversibility";
import type { StrategicStatementAnalysis } from "../statementAnalysis";
import { analyzeStrategicStatement } from "./analyzeStrategicStatement";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { assessJudgmentStage } from "./assessJudgmentStage";
import { assessOptionReadiness } from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import {
  isIDontKnowResponse,
  normalizeStrategicText,
} from "./classifyStrategicInput";

/**
 * Internal next thinking move — maps onto existing backbone stages.
 * Not a second stage system.
 */
export type NextThinkingMove =
  | "clarify_question"
  | "reflect_understanding"
  | "identify_goal"
  | "identify_evidence"
  | "surface_assumption"
  | "explore_concern"
  | "explore_opportunity"
  | "identify_constraint"
  | "check_capacity"
  | "generate_options"
  | "compare_options"
  | "assess_risk"
  | "assess_reversibility"
  | "design_experiment"
  | "confirm_direction"
  | "recommend_handoff"
  | "review_results"
  | "soften_after_uncertainty";

export type NextThinkingMovePlan = {
  move: NextThinkingMove;
  stage: StrategicJudgmentStage;
  reason: string;
  /** When true, prefer a short reflection over another question. */
  preferReflection: boolean;
  lastStatement: StrategicStatementAnalysis | null;
};

function blob(item: StrategyWorkItem): string {
  return normalizeStrategicText(
    [
      item.decisionStatement,
      item.currentReality,
      item.desiredDirection,
      ...(item.memberStatements ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * One primary next thinking move for the turn.
 */
export function selectNextThinkingMove(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string },
): NextThinkingMovePlan {
  const stage = assessJudgmentStage(item);
  const analysis = identifyStrategicQuestion(item, opts?.lastAnswer);
  const readiness = assessDecisionReadiness(item);
  const optionReady = assessOptionReadiness(item);
  const lastStatement = opts?.lastAnswer?.trim()
    ? analyzeStrategicStatement(opts.lastAnswer)
    : null;

  void presentation; // presentation shapes questions, not which move is due

  if (opts?.lastAnswer && isIDontKnowResponse(opts.lastAnswer)) {
    return {
      move: "soften_after_uncertainty",
      stage,
      reason: "Member signaled uncertainty — simplify rather than repeat.",
      preferReflection: true,
      lastStatement,
    };
  }

  // Small, easily reversible experiments — do not force deep analysis first
  const easyExperiment =
    /\b(weekly email|try|pilot|test|small experiment|send a)\b/i.test(
      blob(item),
    ) &&
    !/\b(clos(e|ing)|shut down|fire|sell the business)\b/i.test(blob(item));
  if (
    easyExperiment &&
    item.decisionStatement?.trim() &&
    !analysis.needsClarification &&
    !item.chosenDirection?.trim() &&
    (hasCurrentReality(item) || (item.memberStatements?.length ?? 0) >= 0)
  ) {
    // Prefer a small test path over deep option generation
    if (
      hasCurrentReality(item) ||
      /\b(weekly email|small experiment|pilot)\b/i.test(
        item.decisionStatement || "",
      )
    ) {
      return {
        move: "design_experiment",
        stage: "test_confidence",
        reason: "This looks testable without extended strategic analysis.",
        preferReflection: false,
        lastStatement,
      };
    }
  }

  if (!item.decisionStatement?.trim() || analysis.needsClarification) {
    return {
      move: "clarify_question",
      stage: "clarify_question",
      reason: "The real strategic question is still unclear.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    lastStatement?.nature === "feeling" &&
    !item.risks?.length &&
    !hasCurrentReality(item)
  ) {
    return {
      move: "explore_concern",
      stage: "understand_reality",
      reason: "A feeling arrived before situation context — stay with it gently.",
      preferReflection: true,
      lastStatement,
    };
  }

  if (!hasCurrentReality(item)) {
    return {
      move: "identify_evidence",
      stage: "understand_reality",
      reason: "We do not yet know what changed or what is happening now.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    !item.desiredDirection?.trim() &&
    (item.memberStatements?.length ?? 0) < 3 &&
    readiness.readiness === "reality_not_yet_understood"
  ) {
    return {
      move: "identify_goal",
      stage: "gather_evidence",
      reason: "Desired result is not clear enough.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    capacityAppearsTight(item) &&
    !(item.constraints?.length) &&
    !item.optionsConsidered?.length
  ) {
    return {
      move: "check_capacity",
      stage: "gather_evidence",
      reason: "Capacity may limit which options are realistic.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    (needsFactAssumptionSplit(item) ||
      lastStatement?.nature === "assumption" ||
      lastStatement?.nature === "interpretation") &&
    !(item.assumptions?.length)
  ) {
    return {
      move: "surface_assumption",
      stage: "surface_assumptions",
      reason: "Assumptions may be standing in for evidence.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    /\b(opportunity|chance|opening|could grow)\b/i.test(blob(item)) &&
    !(item.opportunities?.length) &&
    !item.optionsConsidered?.length
  ) {
    return {
      move: "explore_opportunity",
      stage: "gather_evidence",
      reason: "An opportunity is present but not yet named clearly.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    /\b(worried|afraid|risk|clos(e|ing)|shut down|fire|permanent)\b/i.test(
      blob(item),
    ) &&
    !(item.risks?.length) &&
    !item.chosenDirection?.trim()
  ) {
    const rev = assessReversibility(blob(item));
    if (
      rev === "difficult_to_reverse" ||
      rev === "effectively_irreversible" ||
      /\bclos(e|ing) (my |the )?business\b/i.test(blob(item))
    ) {
      return {
        move: "assess_reversibility",
        stage: "evaluate_tradeoffs",
        reason: "This may be hard to reverse — deepen care before options.",
        preferReflection: true,
        lastStatement,
      };
    }
    return {
      move: "explore_concern",
      stage: "gather_evidence",
      reason: "A concern is present and should be named before choosing.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    optionReady.optionsReady &&
    !item.optionsConsidered?.length &&
    item.optionsOffered !== false
  ) {
    return {
      move: "generate_options",
      stage: "explore_options",
      reason: "Enough is known to explore meaningfully different directions.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (!optionReady.optionsReady && !item.optionsConsidered?.length) {
    if (optionReady.readiness === "needs_constraints") {
      return {
        move: "identify_constraint",
        stage: "gather_evidence",
        reason: optionReady.missing.join("; ") || "Constraints still missing.",
        preferReflection: false,
        lastStatement,
      };
    }
    if (optionReady.readiness === "needs_goal_clarity") {
      return {
        move: "identify_goal",
        stage: "gather_evidence",
        reason: "Goal clarity before options.",
        preferReflection: false,
        lastStatement,
      };
    }
    if (optionReady.readiness === "needs_evidence") {
      return {
        move: "identify_evidence",
        stage: "gather_evidence",
        reason: "More evidence before options.",
        preferReflection: false,
        lastStatement,
      };
    }
  }

  if (item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    if (!(item.tradeoffs?.length) && !(item.risks?.length)) {
      return {
        move: "assess_risk",
        stage: "evaluate_tradeoffs",
        reason: "Options exist; trade-offs and risks need attention.",
        preferReflection: false,
        lastStatement,
      };
    }
    return {
      move: "compare_options",
      stage: "evaluate_tradeoffs",
      reason: "Options are ready for comparison.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (
    item.chosenDirection?.trim() &&
    !item.decisionRecordConfirmed &&
    /\b(test|pilot|experiment|weekly|try)\b/i.test(item.chosenDirection)
  ) {
    return {
      move: "design_experiment",
      stage: "test_confidence",
      reason: "Direction looks testable with a small experiment.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (item.chosenDirection?.trim() && !item.decisionRecordConfirmed) {
    return {
      move: "confirm_direction",
      stage: "choose_direction",
      reason: "Direction is forming — confirmation protects agency.",
      preferReflection: false,
      lastStatement,
    };
  }

  if (item.decisionRecordConfirmed && item.chosenDirection?.trim()) {
    if (item.status === "under_review" || item.reviewDate) {
      return {
        move: "review_results",
        stage: "review_results",
        reason: "Decision is complete and ready for review.",
        preferReflection: true,
        lastStatement,
      };
    }
    return {
      move: "recommend_handoff",
      stage: "prepare_handoff",
      reason: "Confirmed direction — prepare a helpful next place.",
      preferReflection: false,
      lastStatement,
    };
  }

  return {
    move: "reflect_understanding",
    stage,
    reason: "Continue understanding before recommending.",
    preferReflection: true,
    lastStatement,
  };
}
