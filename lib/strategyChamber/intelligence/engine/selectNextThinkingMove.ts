import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import type { StrategicJudgmentStage } from "../../domainModel";
import { hasCurrentReality } from "../frameworks/currentReality";
import { needsFactAssumptionSplit } from "../frameworks/factsAndAssumptions";
import { capacityAppearsTight } from "../frameworks/capacityFit";
import { assessReversibility } from "../frameworks/reversibility";
import type { ClassifiedStrategicInput } from "../types";
import {
  classifyStrategicInput,
  isIDontKnowResponse,
  normalizeStrategicText,
} from "./classifyStrategicInput";
import { assessDecisionReadiness } from "./assessDecisionReadiness";
import { assessJudgmentStage } from "./assessJudgmentStage";
import {
  assessOptionReadiness,
  type OptionReadiness,
} from "./assessOptionReadiness";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { recommendStrategicHandoff } from "./recommendHandoff";

/**
 * Internal thinking moves — map onto existing backbone stages.
 * Never expose these names to the member.
 */
export type StrategicThinkingMove =
  | "clarify_question"
  | "reflect_understanding"
  | "identify_goal"
  | "identify_change"
  | "identify_evidence"
  | "surface_assumption"
  | "explore_concern"
  | "explore_opportunity"
  | "identify_constraint"
  | "check_capacity"
  | "identify_unknown"
  | "generate_options"
  | "compare_options"
  | "assess_tradeoffs"
  | "assess_risk"
  | "assess_reversibility"
  | "design_experiment"
  | "confirm_direction"
  | "recommend_waiting"
  | "recommend_simplifying"
  | "recommend_current_direction"
  | "recommend_handoff"
  | "review_results";

/** @deprecated Use StrategicThinkingMove — same union. */
export type NextThinkingMove = StrategicThinkingMove;

export type IdontKnowSupportMode =
  | "rephrase_simpler"
  | "offer_example"
  | "offer_choices"
  | "smaller_question"
  | "tentative_interpretation"
  | "free_explanation"
  | "allow_skip";

export type MoveConfidence = "low" | "moderate" | "high";

/**
 * One primary next thinking move for the turn (internal).
 */
export type NextThinkingMovePlan = {
  move: StrategicThinkingMove;
  reason: string;
  stage: StrategicJudgmentStage;
  targetGap?: string;
  questionKey?: string;
  shouldAskQuestion: boolean;
  shouldReflectFirst?: boolean;
  /** Alias used by existing callers. */
  preferReflection: boolean;
  optionReadiness?: OptionReadiness;
  recommendedDestination?: string;
  confidence: MoveConfidence;
  idontKnowSupport?: IdontKnowSupportMode;
  lastClassified: ClassifiedStrategicInput | null;
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

function isIdeaSprawl(text: string): boolean {
  return /\b(too many ideas|ten things|many ideas|don'?t know what to work on|scattered|everything at once)\b/i.test(
    text,
  );
}

function isClosingBusiness(text: string): boolean {
  return /\bclos(e|ing) (my |the )?business\b|\bshut (down|it)\b/i.test(text);
}

function isEasyExperiment(text: string): boolean {
  return (
    /\b(weekly email|try|pilot|test|small experiment|send a)\b/i.test(text) &&
    !isClosingBusiness(text)
  );
}

function goalAlreadyClear(item: StrategyWorkItem): boolean {
  return Boolean(item.desiredDirection?.trim());
}

function substantialAnswer(text: string | undefined): boolean {
  if (!text?.trim()) return false;
  const words = text.trim().split(/\s+/).length;
  return words >= 18 || (text.includes(".") && words >= 10);
}

function result(
  partial: Omit<NextThinkingMovePlan, "preferReflection" | "lastClassified"> & {
    preferReflection?: boolean;
    lastClassified: ClassifiedStrategicInput | null;
  },
): NextThinkingMovePlan {
  const shouldReflectFirst = partial.shouldReflectFirst ?? false;
  return {
    ...partial,
    shouldReflectFirst,
    preferReflection: partial.preferReflection ?? shouldReflectFirst,
    shouldAskQuestion: partial.shouldAskQuestion,
  };
}

/**
 * Context-aware selector — one primary move per turn.
 * Adaptive presentation must not change which move is due.
 */
export function selectNextThinkingMove(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string; previousMove?: StrategicThinkingMove },
): NextThinkingMovePlan {
  void presentation;

  const stage = assessJudgmentStage(item);
  const analysis = identifyStrategicQuestion(item, opts?.lastAnswer);
  const decisionReadiness = assessDecisionReadiness(item);
  const optionGate = assessOptionReadiness(item);
  const lastClassified = opts?.lastAnswer?.trim()
    ? classifyStrategicInput(opts.lastAnswer)
    : null;
  const stance = lastClassified?.stance;
  const text = blob(item);
  const rev = assessReversibility(text);

  const base = {
    stage,
    optionReadiness: optionGate.readiness,
    lastClassified,
  };

  // —— “I don’t know” — never repeat; choose support mode ——
  if (opts?.lastAnswer && isIDontKnowResponse(opts.lastAnswer)) {
    const prior = opts.previousMove ?? "identify_change";
    return result({
      ...base,
      move: prior,
      reason:
        "Member signaled uncertainty — simplify, offer choices, or skip rather than repeat.",
      targetGap: "answer_support",
      questionKey: "idont_know_soft_path",
      shouldAskQuestion: true,
      shouldReflectFirst: true,
      confidence: "moderate",
      idontKnowSupport:
        presentation && (presentation.maxVisibleChoices ?? 3) <= 1
          ? "smaller_question"
          : "offer_choices",
    });
  }

  // —— Confirmed decision → handoff or review ——
  if (item.decisionRecordConfirmed && item.chosenDirection?.trim()) {
    if (item.status === "under_review" || item.reviewDate) {
      return result({
        ...base,
        move: "review_results",
        stage: "review_results",
        reason: "Confirmed decision is ready for review of results.",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "high",
        questionKey: "review_results",
      });
    }
    const handoff = recommendStrategicHandoff(item);
    return result({
      ...base,
      move: "recommend_handoff",
      stage: "prepare_handoff",
      reason: "Direction confirmed — implementation belongs in the next place.",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
      recommendedDestination: handoff?.destinationId,
      questionKey: "handoff",
      targetGap: "implementation",
    });
  }

  // —— Feeling: reflect; never treat as evidence ——
  if (stance === "feeling") {
    return result({
      ...base,
      move: "reflect_understanding",
      stage: "understand_reality",
      reason:
        "Latest input is a feeling — reflect first; separate feeling from results.",
      targetGap: "feeling_vs_results",
      questionKey: "feeling_results",
      shouldAskQuestion: true,
      shouldReflectFirst: true,
      confidence: "moderate",
      recommendedDestination:
        /\b(overwhelm|failing|scared|tangled|hurt)\b/i.test(
          lastClassified?.originalText || "",
        ) && !hasCurrentReality(item)
          ? "talk_it_out"
          : undefined,
    });
  }

  // —— Assumption / interpretation: evidence discipline ——
  if (
    stance === "assumption" ||
    (stance === "interpretation" && !lastClassified?.safeToTreatAsFact)
  ) {
    return result({
      ...base,
      move: stance === "assumption" ? "surface_assumption" : "identify_evidence",
      stage: "surface_assumptions",
      reason:
        stance === "assumption"
          ? "Assumption must not stand as fact — surface and test."
          : "Interpretation is tentative — check what evidence supports it.",
      targetGap: "evidence_vs_assumption",
      questionKey: "surface_assumption",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // —— Easy reversible experiment: light path ——
  if (
    isEasyExperiment(item.decisionStatement || text) &&
    !analysis.needsClarification &&
    !item.chosenDirection?.trim() &&
    (optionGate.lightPathAllowed ||
      /\b(weekly email|pilot|small experiment)\b/i.test(
        item.decisionStatement || "",
      ))
  ) {
    return result({
      ...base,
      move: "design_experiment",
      stage: "test_confidence",
      reason:
        "Easily reversible — move toward a small experiment without extended analysis.",
      targetGap: "small_test",
      questionKey: "design_experiment",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // —— Closing / hard-to-reverse: deepen; do not rush action ——
  if (isClosingBusiness(text)) {
    if (!item.decisionStatement?.trim() || analysis.needsClarification) {
      return result({
        ...base,
        move: "clarify_question",
        stage: "clarify_question",
        reason: "Hard-to-reverse decision — clarify the real question before any action.",
        targetGap: "strategic_question",
        questionKey: "clarify_closing",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "high",
      });
    }
    if (!(item.optionsConsidered?.length)) {
      if (!hasCurrentReality(item)) {
        return result({
          ...base,
          move: "identify_change",
          stage: "understand_reality",
          reason: "Closing deserves present-tense clarity before options.",
          targetGap: "what_changed",
          questionKey: "identify_change",
          shouldAskQuestion: true,
          shouldReflectFirst: true,
          confidence: "high",
        });
      }
      return result({
        ...base,
        move: "assess_reversibility",
        stage: "evaluate_tradeoffs",
        reason: "Closing is hard to reverse — deepen care before recommending action.",
        targetGap: "reversibility",
        questionKey: "assess_reversibility",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "high",
      });
    }
  }

  // —— Idea sprawl: goal or capacity, not ranking everything ——
  if (isIdeaSprawl(text) && !item.optionsConsidered?.length) {
    if (!goalAlreadyClear(item)) {
      return result({
        ...base,
        move: "identify_goal",
        stage: "clarify_question",
        reason: "Many ideas — clarify the main goal before ranking.",
        targetGap: "desired_result",
        questionKey: "identify_goal",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    return result({
      ...base,
      move: "check_capacity",
      stage: "gather_evidence",
      reason: "Goal known — check capacity before choosing among many ideas.",
      targetGap: "capacity",
      questionKey: "check_capacity",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // —— Priority 1: clarify strategic question ——
  if (!item.decisionStatement?.trim() || analysis.needsClarification) {
    return result({
      ...base,
      move: "clarify_question",
      stage: "clarify_question",
      reason: "The actual strategic question is still unclear.",
      targetGap: "strategic_question",
      questionKey: "clarify_question",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: analysis.needsClarification ? "high" : "moderate",
    });
  }

  // —— Observation: meaning/cause unknown — not proof ——
  if (stance === "observation") {
    return result({
      ...base,
      move: hasCurrentReality(item) ? "identify_unknown" : "identify_change",
      stage: "understand_reality",
      reason:
        "Observation noted — explore what changed or what is still unknown; do not conclude cause.",
      targetGap: "cause_unknown",
      questionKey: "observation_followup",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "moderate",
    });
  }

  // —— Unknown stance: only if material ——
  if (stance === "unknown") {
    return result({
      ...base,
      move: "identify_unknown",
      stage: "gather_evidence",
      reason: "Material unknown that could change direction — pursue gently.",
      targetGap: "material_unknown",
      questionKey: "identify_unknown",
      shouldAskQuestion: true,
      shouldReflectFirst: true,
      confidence: "moderate",
    });
  }

  // —— Priority 2: what changed ——
  if (!hasCurrentReality(item)) {
    return result({
      ...base,
      move: "identify_change",
      stage: "understand_reality",
      reason: "We do not yet know what changed that made this important now.",
      targetGap: "what_changed",
      questionKey: "identify_change",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // Reflection bridge when a substantial answer just arrived
  if (
    substantialAnswer(opts?.lastAnswer) &&
    !item.chosenDirection?.trim() &&
    (item.memberStatements?.length ?? 0) >= 2
  ) {
    return result({
      ...base,
      move: "reflect_understanding",
      stage,
      reason:
        "Substantial answer — brief reflection before the next question.",
      shouldAskQuestion: true,
      shouldReflectFirst: true,
      confidence: "moderate",
      questionKey: "reflect_then_continue",
      targetGap: "shared_understanding",
    });
  }

  // —— Priority 3: desired result (skip if already clear) ——
  if (!goalAlreadyClear(item) && (item.memberStatements?.length ?? 0) < 3) {
    return result({
      ...base,
      move: "identify_goal",
      stage: "gather_evidence",
      reason: "Desired result is not clear enough.",
      targetGap: "desired_result",
      questionKey: "identify_goal",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // —— Priority 5–6: constraints / capacity ——
  if (capacityAppearsTight(item) && !(item.constraints?.length)) {
    return result({
      ...base,
      move: "check_capacity",
      stage: "gather_evidence",
      reason: "Capacity may limit which directions are realistic.",
      targetGap: "capacity",
      questionKey: "check_capacity",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  if (
    optionGate.readiness === "needs_constraints" &&
    !item.optionsConsidered?.length
  ) {
    return result({
      ...base,
      move: "identify_constraint",
      stage: "gather_evidence",
      reason: "Important constraints are still missing.",
      targetGap: "constraints",
      questionKey: "identify_constraint",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "moderate",
    });
  }

  // —— Priority 7: evidence vs assumption ——
  if (
    !(item.assumptions?.length) &&
    !item.optionsConsidered?.length &&
    (needsFactAssumptionSplit(item) ||
      /\b(i think|assume|probably|everyone|always|never|will leave)\b/i.test(
        text,
      ))
  ) {
    return result({
      ...base,
      move: "surface_assumption",
      stage: "surface_assumptions",
      reason: "Separate evidence from assumption before options.",
      targetGap: "evidence_vs_assumption",
      questionKey: "surface_assumption",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "moderate",
    });
  }

  // —— Priority 8–9: concern / opportunity ——
  if (
    /\b(opportunity|chance|opening|could grow)\b/i.test(text) &&
    !(item.opportunities?.length) &&
    !item.optionsConsidered?.length
  ) {
    return result({
      ...base,
      move: "explore_opportunity",
      stage: "gather_evidence",
      reason: "An opportunity is present but not yet named clearly.",
      targetGap: "opportunity",
      questionKey: "explore_opportunity",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "moderate",
    });
  }

  if (
    /\b(worried|afraid|risk|permanent)\b/i.test(text) &&
    !(item.risks?.length) &&
    !item.chosenDirection?.trim()
  ) {
    if (
      rev === "difficult_to_reverse" ||
      rev === "effectively_irreversible"
    ) {
      return result({
        ...base,
        move: "assess_reversibility",
        stage: "evaluate_tradeoffs",
        reason: "Hard-to-reverse concern — check reversibility before committing.",
        targetGap: "reversibility",
        questionKey: "assess_reversibility",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "high",
      });
    }
    return result({
      ...base,
      move: "explore_concern",
      stage: "gather_evidence",
      reason: "A concern should be named before choosing a direction.",
      targetGap: "concern",
      questionKey: "explore_concern",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "moderate",
    });
  }

  // —— Overwhelm → simplify / wait ——
  if (
    /\b(overwhelm|too much|cannot keep up|burned? out)\b/i.test(text) &&
    !item.chosenDirection?.trim()
  ) {
    return result({
      ...base,
      move: "recommend_simplifying",
      stage: "gather_evidence",
      reason: "Cognitive load is high — simplify before expanding options.",
      targetGap: "cognitive_load",
      questionKey: "simplify",
      shouldAskQuestion: true,
      shouldReflectFirst: true,
      confidence: "moderate",
      recommendedDestination: "talk_it_out",
    });
  }

  // —— Options (gated) ——
  if (
    optionGate.optionsReady &&
    !item.optionsConsidered?.length &&
    item.optionsOffered !== false
  ) {
    return result({
      ...base,
      move: "generate_options",
      stage: "explore_options",
      reason: "Enough is known for meaningfully different directions.",
      targetGap: "options",
      questionKey: "generate_options",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  if (!optionGate.optionsReady && !item.optionsConsidered?.length) {
    if (optionGate.readiness === "needs_capacity") {
      return result({
        ...base,
        move: "check_capacity",
        stage: "gather_evidence",
        reason: "Capacity clarity before options.",
        targetGap: "capacity",
        questionKey: "check_capacity",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    if (optionGate.readiness === "needs_goal_clarity") {
      return result({
        ...base,
        move: "identify_goal",
        stage: "gather_evidence",
        reason: "Goal clarity before options.",
        targetGap: "desired_result",
        questionKey: "identify_goal",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    if (optionGate.readiness === "needs_evidence") {
      return result({
        ...base,
        move: "identify_evidence",
        stage: "gather_evidence",
        reason: "More evidence before options.",
        targetGap: "evidence",
        questionKey: "identify_evidence",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "moderate",
      });
    }
  }

  // —— Compare / tradeoffs / risk ——
  if (item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    if (!(item.tradeoffs?.length)) {
      return result({
        ...base,
        move: "assess_tradeoffs",
        stage: "evaluate_tradeoffs",
        reason: "Options exist; trade-offs need attention before choosing.",
        targetGap: "tradeoffs",
        questionKey: "assess_tradeoffs",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    if (!(item.risks?.length)) {
      return result({
        ...base,
        move: "assess_risk",
        stage: "evaluate_tradeoffs",
        reason: "Proportionate risk review before treating a preference as a decision.",
        targetGap: "risk",
        questionKey: "assess_risk",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    return result({
      ...base,
      move: "compare_options",
      stage: "evaluate_tradeoffs",
      reason: "Options and trade-offs are ready for comparison.",
      targetGap: "comparison",
      questionKey: "compare_options",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  // —— Direction forming ——
  if (item.chosenDirection?.trim() && !item.decisionRecordConfirmed) {
    if (/\b(test|pilot|experiment|weekly|try)\b/i.test(item.chosenDirection)) {
      return result({
        ...base,
        move: "design_experiment",
        stage: "test_confidence",
        reason: "Direction looks testable with a small experiment.",
        targetGap: "small_test",
        questionKey: "design_experiment",
        shouldAskQuestion: true,
        shouldReflectFirst: false,
        confidence: "high",
      });
    }
    if (
      decisionReadiness.readiness === "ready_for_decision" &&
      /\b(wait|not yet|later)\b/i.test(item.chosenDirection)
    ) {
      return result({
        ...base,
        move: "recommend_waiting",
        stage: "choose_direction",
        reason: "Waiting may be the wisest move — confirm that posture.",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "moderate",
        questionKey: "recommend_waiting",
      });
    }
    if (/\b(keep|continue|stay with|current)\b/i.test(item.chosenDirection)) {
      return result({
        ...base,
        move: "recommend_current_direction",
        stage: "choose_direction",
        reason: "Member may be affirming the current direction — confirm.",
        shouldAskQuestion: true,
        shouldReflectFirst: true,
        confidence: "moderate",
        questionKey: "recommend_current",
      });
    }
    return result({
      ...base,
      move: "confirm_direction",
      stage: "choose_direction",
      reason: "Direction is forming — confirmation protects agency.",
      targetGap: "confirmation",
      questionKey: "confirm_direction",
      shouldAskQuestion: true,
      shouldReflectFirst: false,
      confidence: "high",
    });
  }

  return result({
    ...base,
    move: "reflect_understanding",
    stage,
    reason: "Continue understanding before recommending.",
    shouldAskQuestion: true,
    shouldReflectFirst: true,
    confidence: "low",
    questionKey: "continue_understanding",
  });
}
