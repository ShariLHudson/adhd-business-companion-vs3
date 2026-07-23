import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { hasCurrentReality } from "../frameworks/currentReality";
import { needsFactAssumptionSplit } from "../frameworks/factsAndAssumptions";
import { capacityAppearsTight, capacityCheckQuestion } from "../frameworks/capacityFit";
import { getStrategyType } from "../registry";
import type { NextQuestionPlan, QuestionPriority } from "../types";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { isIDontKnowResponse } from "./classifyStrategicInput";

function choice(
  id: string,
  label: string,
  question: string,
): NextQuestionPlan["choices"][number] {
  return { id, label, question };
}

/**
 * Priority 1–9 question selection. One primary question. Context-specific.
 */
export function selectNextQuestion(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string },
): NextQuestionPlan {
  const analysis = identifyStrategicQuestion(item, opts?.lastAnswer);
  const type = getStrategyType(analysis.strategyTypeId);
  const maxChoices = presentation?.maxVisibleChoices ?? 3;

  if (opts?.lastAnswer && isIDontKnowResponse(opts.lastAnswer)) {
    return {
      priority: 1,
      question: "That is okay. Which feels closest right now?",
      reason: "Member needs a softer on-ramp after uncertainty.",
      allowIDontKnow: true,
      choices: [
        choice("a", "Something concrete changed recently", "What changed recently that brought this up?"),
        choice("b", "I am worried about a risk", "What are you most worried might go wrong?"),
        choice("c", "I want a better outcome", "What would a good outcome look like, even roughly?"),
        choice("else", "Something else", "What else feels true, even if it is incomplete?"),
        choice("free", "I would rather explain it", "Tell me in your own words what feels most important."),
      ].slice(0, Math.max(2, maxChoices)),
    };
  }

  // Priority 1 — clarify central question
  if (!item.decisionStatement?.trim() || analysis.needsClarification) {
    const q =
      analysis.alternateQuestions[0] ||
      type?.clarifyingQuestions[0] ||
      "What feels most important to decide here?";
    return {
      priority: 1,
      question: analysis.needsClarification
        ? "When you say that, which part feels like the real decision?"
        : q,
      reason: "The actual strategic question is still unclear.",
      allowIDontKnow: true,
      choices: (analysis.alternateQuestions.length
        ? analysis.alternateQuestions.map((aq, i) =>
            choice(`alt_${i}`, aq.slice(0, 48), aq),
          )
        : [
            choice("important", "What matters most to decide?", "What feels most important to decide here?"),
            choice("different", "What would be different if this worked?", "What would be different if this worked?"),
            choice("real", "Which part is the real decision?", "Which part of this feels like the real decision?"),
          ]
      ).slice(0, maxChoices),
    };
  }

  // Priority 2 — what changed
  if (!hasCurrentReality(item)) {
    const q =
      type?.currentStateQuestions[0] ||
      "What changed that made this question important now?";
    return {
      priority: 2,
      question: q,
      reason: "We need present-tense context before recommending.",
      allowIDontKnow: true,
      choices: [
        choice("changed", "What changed recently?", "What changed that made this question important now?"),
        choice("signal", "What signal are you noticing?", "What signal are you noticing?"),
        choice("not_working", "What is not working?", "What is not working about the current situation?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 3 — desired outcome
  if (!item.desiredDirection?.trim() && (item.memberStatements?.length ?? 0) < 3) {
    const q =
      type?.directionQuestions[0] ||
      "What would a good outcome look like?";
    return {
      priority: 3,
      question: q,
      reason: "Desired direction is not clear enough.",
      allowIDontKnow: true,
      choices: [
        choice("outcome", "What good looks like", "What would a good outcome look like?"),
        choice("protect", "What to protect", "What do you most want to protect?"),
        choice("possible", "What this makes possible", "What are you hoping this decision makes possible?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 4 — capacity / constraints
  if (
    capacityAppearsTight(item) &&
    !(item.constraints?.length) &&
    !item.optionsConsidered?.length
  ) {
    return {
      priority: 4,
      question: capacityCheckQuestion(),
      reason: "Capacity may shape which options are realistic.",
      allowIDontKnow: true,
      choices: [
        choice("limits", "What limits matter?", "What limits do we need to respect?"),
        choice("room", "Is there room?", capacityCheckQuestion()),
        choice("stop", "What would need to stop?", "What would need to stop to make room?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 5 — facts vs assumptions
  if (needsFactAssumptionSplit(item) && !(item.assumptions?.length)) {
    return {
      priority: 5,
      question: "What do you know for certain, and what are you currently assuming?",
      reason: "Certainty may be overstated.",
      allowIDontKnow: true,
      choices: [
        choice("certain", "What is certain?", "What do you know for certain?"),
        choice("assume", "What are you assuming?", "What are you currently assuming?"),
        choice("evidence", "What evidence shapes that?", "What evidence is shaping that belief?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 6 — explore options
  if (!item.optionsConsidered?.length && item.optionsOffered !== false) {
    return {
      priority: 6,
      question:
        "Would it help to look at a few possible directions, or keep talking first?",
      reason: "Enough context exists to explore meaningful options.",
      allowIDontKnow: true,
      choices: [
        choice("options", "Show a few directions", "Would it help to look at a few possible directions?"),
        choice("talk", "Keep talking first", "What else feels important before we look at options?"),
        choice("worry", "Name the biggest worry", "What worries you most if you get this wrong?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 7 — trade-offs
  if (item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    return {
      priority: 7,
      question:
        "Which direction feels strongest right now — or would you rather keep exploring?",
      reason: "Realistic alternatives exist; trade-offs need attention.",
      allowIDontKnow: true,
      choices: [
        choice("strongest", "Which feels strongest?", "Which direction feels strongest right now?"),
        choice("combine", "Combine parts?", "Would combining parts of these options feel better?"),
        choice("not_ready", "Not ready to choose", "What would help you feel ready to choose later?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 8 — confirm direction
  if (item.chosenDirection?.trim() && !item.decisionRecordConfirmed) {
    return {
      priority: 8,
      question:
        "Does this capture what you meant, or would you like to change anything before we use it?",
      reason: "Direction is forming; confirmation protects agency.",
      allowIDontKnow: true,
      choices: [
        choice("confirm", "This captures it", "Does this capture what you meant?"),
        choice("change", "I want to change something", "What would you like to change?"),
      ].slice(0, maxChoices),
    };
  }

  // Priority 9 — handoff
  if (item.chosenDirection?.trim() && item.decisionRecordConfirmed) {
    return {
      priority: 9 as QuestionPriority,
      question: "What should stay true as you take the next step?",
      reason: "Direction is clear enough to choose a next destination.",
      allowIDontKnow: true,
      choices: [
        choice("next", "What happens next?", "What should stay true as you take the next step?"),
        choice("review", "When should we review?", "When would you like to review this decision?"),
      ].slice(0, maxChoices),
    };
  }

  return {
    priority: 3,
    question: "What else feels important for me to understand?",
    reason: "Continue understanding before recommending.",
    allowIDontKnow: true,
    choices: [
      choice("else", "What else matters?", "What else feels important for me to understand?"),
    ].slice(0, maxChoices),
  };
}
