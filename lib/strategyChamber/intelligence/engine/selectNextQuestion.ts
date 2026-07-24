import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyWorkItem } from "../../types";
import { nextHiddenUnderlyingQuestion } from "../domainIntelligence";
import { capacityCheckQuestion } from "../frameworks/capacityFit";
import { getStrategyType } from "../registry";
import type { NextQuestionPlan, QuestionPriority } from "../types";
import { identifyStrategicQuestion } from "./identifyStrategicQuestion";
import { isIDontKnowResponse } from "./classifyStrategicInput";
import { assessOptionReadiness } from "./assessOptionReadiness";
import {
  selectNextThinkingMove,
  type StrategicThinkingMove,
} from "./selectNextThinkingMove";

function choice(
  id: string,
  label: string,
  question: string,
): NextQuestionPlan["choices"][number] {
  return { id, label, question };
}

function withElseAndSkip(
  choices: NextQuestionPlan["choices"],
  maxChoices: number,
): NextQuestionPlan["choices"] {
  const extras = [
    choice("else", "Something else", "What else feels true, even if it is incomplete?"),
    choice(
      "free",
      "I'd rather explain it",
      "Tell me in your own words what feels most important.",
    ),
    choice(
      "skip",
      "Skip for now",
      "What else would you rather talk about instead?",
    ),
  ];
  const core = choices.filter(
    (c) => !["else", "free", "skip"].includes(c.id),
  );
  const room = Math.max(1, maxChoices - 1);
  return [...core.slice(0, room), ...extras].slice(0, Math.max(3, maxChoices));
}

function plan(
  priority: QuestionPriority,
  question: string,
  reason: string,
  choices: NextQuestionPlan["choices"],
  maxChoices: number,
  reflectionInstead?: string,
): NextQuestionPlan {
  return {
    priority,
    question,
    reason,
    allowIDontKnow: true,
    choices: choices.slice(0, maxChoices),
    reflectionInstead,
  };
}

/**
 * Priority order for next question — ask only what is still needed.
 * One primary question. Reflection may replace a question.
 */
export function selectNextQuestion(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { lastAnswer?: string },
): NextQuestionPlan {
  const analysis = identifyStrategicQuestion(item, opts?.lastAnswer);
  const type = getStrategyType(analysis.strategyTypeId);
  const maxChoices = presentation?.maxVisibleChoices ?? 3;
  const movePlan = selectNextThinkingMove(item, presentation, opts);
  const optionReady = assessOptionReadiness(item);
  const move = movePlan.move;

  if (
    (opts?.lastAnswer && isIDontKnowResponse(opts.lastAnswer)) ||
    movePlan.idontKnowSupport
  ) {
    const support = movePlan.idontKnowSupport ?? "offer_choices";
    if (support === "smaller_question" || maxChoices <= 1) {
      return plan(
        1,
        "What feels like the smallest true piece of this?",
        "I don’t know support — smaller question; do not repeat the prior question.",
        [
          choice(
            "smaller",
            "A smaller piece",
            "What feels like the smallest true piece of this?",
          ),
        ],
        1,
        "It is fine not to have a clear answer yet. We can take a smaller step.",
      );
    }
    return plan(
      1,
      "That is okay. Which feels closest right now?",
      "I don’t know support — choices and skip; do not repeat the prior question.",
      withElseAndSkip(
        [
          choice(
            "a",
            "Something concrete changed recently",
            "What changed recently that brought this up?",
          ),
          choice(
            "b",
            "I am worried about a risk",
            "What are you most worried might go wrong?",
          ),
          choice(
            "c",
            "I want a better outcome",
            "What would a good outcome look like, even roughly?",
          ),
        ],
        maxChoices,
      ),
      Math.max(3, maxChoices),
      "It is fine not to have a clear answer yet. We can take a smaller step.",
    );
  }

  if (move === "reflect_understanding") {
    return plan(
      3,
      "What results or signals are shaping how this feels?",
      movePlan.reason,
      [
        choice(
          "results",
          "What results I'm seeing",
          "What results or signals are shaping how this feels?",
        ),
        choice(
          "else",
          "Something else",
          "What else feels important for me to understand?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
      "I'm with you in what you shared — we can separate the feeling from what the numbers show.",
    );
  }

  if (move === "clarify_question") {
    const hidden = nextHiddenUnderlyingQuestion(
      type,
      [
        item.decisionStatement,
        item.currentReality,
        item.desiredDirection,
        ...(item.memberStatements ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const q =
      analysis.alternateQuestions[0] ||
      hidden ||
      type?.clarifyingQuestions[0] ||
      "What feels most important to decide here?";
    return plan(
      1,
      analysis.needsClarification
        ? "When you say that, which part feels like the real decision?"
        : q,
      "Clarify the real strategic question before solving.",
      (analysis.alternateQuestions.length
        ? analysis.alternateQuestions.map((aq, i) =>
            choice(`alt_${i}`, aq.slice(0, 52), aq),
          )
        : [
            choice(
              "important",
              "What matters most to decide?",
              "What feels most important to decide here?",
            ),
            choice(
              "different",
              "What would be different if this worked?",
              "What would be different if this worked?",
            ),
            choice(
              "real",
              "Which part is the real decision?",
              "Which part of this feels like the real decision?",
            ),
          ]
      ).slice(0, maxChoices),
      maxChoices,
    );
  }

  if (
    move === "identify_change" ||
    move === "identify_evidence" ||
    move === "identify_unknown"
  ) {
    const q =
      move === "identify_unknown"
        ? "What feels most important that we still do not know?"
        : type?.currentStateQuestions[0] ||
          "What changed that made this question important now?";
    return plan(
      2,
      q,
      movePlan.reason || "Understand what changed before recommending.",
      [
        choice(
          "changed",
          "What changed recently?",
          "What changed that made this question important now?",
        ),
        choice(
          "signal",
          "What signal are you noticing?",
          "What signal are you noticing?",
        ),
        choice(
          "unknown",
          "What is still unclear?",
          "What feels most important that we still do not know?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "explore_concern") {
    return plan(
      8,
      movePlan.preferReflection
        ? "It sounds like something about this feels heavy. What worries you most?"
        : "What are you most concerned about if you get this wrong?",
      "Explore concern before jumping to solutions.",
      [
        choice(
          "worry",
          "The biggest worry",
          "What are you most worried might go wrong?",
        ),
        choice(
          "protect",
          "What to protect",
          "What do you most want to protect?",
        ),
        choice(
          "happen",
          "What is happening",
          "What is happening that makes this feel urgent?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
      movePlan.preferReflection
        ? "It makes sense this feels weighty. We can go slowly."
        : undefined,
    );
  }

  if (move === "identify_goal") {
    const q =
      type?.directionQuestions[0] || "What would a good outcome look like?";
    return plan(
      3,
      q,
      "Clarify the desired result.",
      [
        choice(
          "outcome",
          "What good looks like",
          "What would a good outcome look like?",
        ),
        choice(
          "protect",
          "What to protect",
          "What do you most want to protect?",
        ),
        choice(
          "possible",
          "What this makes possible",
          "What are you hoping this decision makes possible?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "check_capacity" || move === "identify_constraint") {
    return plan(
      move === "check_capacity" ? 6 : 5,
      move === "check_capacity"
        ? capacityCheckQuestion()
        : "What limits do we need to respect?",
      move === "check_capacity"
        ? "Capacity may shape which options are realistic."
        : "Identify meaningful constraints before options.",
      [
        choice("limits", "What limits matter?", "What limits do we need to respect?"),
        choice("room", "Is there room?", capacityCheckQuestion()),
        choice(
          "stop",
          "What would need to stop?",
          "What would need to stop to make room?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "surface_assumption") {
    return plan(
      7,
      "What do you know for certain, and what are you currently assuming?",
      "Separate evidence from assumption.",
      [
        choice("certain", "What is certain?", "What do you know for certain?"),
        choice(
          "assume",
          "What are you assuming?",
          "What are you currently assuming?",
        ),
        choice(
          "evidence",
          "What evidence shapes that?",
          "What evidence is shaping that belief?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "explore_opportunity") {
    return plan(
      8,
      "What opportunity do you see if this goes well?",
      "Explore opportunity before locking a path.",
      [
        choice(
          "opp",
          "The opportunity",
          "What opportunity do you see if this goes well?",
        ),
        choice(
          "protect",
          "What to protect",
          "What do you most want to protect while you pursue it?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "assess_reversibility") {
    return plan(
      11,
      "What would be hardest to undo if you moved forward?",
      "Hard-to-reverse decisions need deeper care.",
      [
        choice(
          "undo",
          "What is hard to undo?",
          "What would be hardest to undo if you moved forward?",
        ),
        choice(
          "smaller",
          "Is there a smaller step?",
          "Is there a smaller step that would teach you something first?",
        ),
        choice(
          "protect",
          "What must stay protected?",
          "What must stay protected no matter what you decide?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
      "This kind of decision deserves care. We do not need to rush.",
    );
  }

  if (move === "generate_options" && optionReady.optionsReady) {
    return plan(
      9,
      "Would it help to look at a few possible directions, or keep talking first?",
      "Enough context exists to explore meaningfully different options.",
      [
        choice(
          "options",
          "Show a few directions",
          "Would it help to look at a few possible directions?",
        ),
        choice(
          "talk",
          "Keep talking first",
          "What else feels important before we look at options?",
        ),
        choice(
          "worry",
          "Name the biggest worry",
          "What worries you most if you get this wrong?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (
    move === "compare_options" ||
    move === "assess_risk" ||
    move === "assess_tradeoffs"
  ) {
    return plan(
      move === "assess_risk" ? 11 : 10,
      move === "assess_risk"
        ? "What could go wrong with the direction that feels strongest?"
        : move === "assess_tradeoffs"
          ? "What would each direction ask you to give up?"
          : "Which direction feels strongest right now — or would you rather keep exploring?",
      movePlan.reason,
      [
        choice(
          "strongest",
          "Which feels strongest?",
          "Which direction feels strongest right now?",
        ),
        choice(
          "tradeoff",
          "What would I give up?",
          "What would each direction ask you to give up?",
        ),
        choice(
          "not_ready",
          "Not ready to choose",
          "What would help you feel ready to choose later?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (
    move === "recommend_simplifying" ||
    move === "recommend_waiting" ||
    move === "recommend_current_direction"
  ) {
    return plan(
      12,
      move === "recommend_waiting"
        ? "Would waiting a little serve you better than deciding today?"
        : move === "recommend_current_direction"
          ? "Does staying with what you are already doing feel like the wiser move for now?"
          : "Would it help to simplify this to one smaller decision?",
      movePlan.reason,
      [
        choice(
          "yes",
          "That feels right",
          "Does that direction feel true for you?",
        ),
        choice(
          "else",
          "Something else",
          "What else feels important before we decide?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
      movePlan.shouldReflectFirst
        ? "We can keep this smaller. You do not have to solve everything at once."
        : undefined,
    );
  }

  if (move === "design_experiment") {
    return plan(
      12,
      "Would a small test teach you enough before a bigger commitment?",
      "This may be testable without extended analysis.",
      [
        choice(
          "test",
          "Try a small test",
          "What is the smallest useful test you could run?",
        ),
        choice(
          "decide",
          "I am ready to decide",
          "Which direction are you leaning toward?",
        ),
        choice(
          "wait",
          "Wait a bit",
          "What would need to change before you decide?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "confirm_direction") {
    return plan(
      12,
      "Does this capture what you meant, or would you like to change anything before we use it?",
      "Confirmation protects agency — AI preference is not the decision.",
      [
        choice("confirm", "This captures it", "Does this capture what you meant?"),
        choice(
          "change",
          "I want to change something",
          "What would you like to change?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "recommend_handoff") {
    return plan(
      13,
      "What should stay true as you take the next step?",
      "Prepare handoff only after a confirmed direction.",
      [
        choice(
          "next",
          "What happens next?",
          "What should stay true as you take the next step?",
        ),
        choice(
          "review",
          "When should we review?",
          "When would you like to review this decision?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (move === "review_results") {
    return plan(
      14,
      "What are you noticing since you made this decision?",
      "Review results without reopening the whole case unless needed.",
      [
        choice(
          "noticing",
          "What I am noticing",
          "What are you noticing since you made this decision?",
        ),
        choice(
          "adjust",
          "Something needs adjusting",
          "What would you adjust if you could?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  if (movePlan.preferReflection || move === "reflect_understanding") {
    return plan(
      3,
      "What else feels important for me to understand?",
      "A reflection may help more than another intake question.",
      [
        choice(
          "else",
          "What else matters?",
          "What else feels important for me to understand?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
      "Here is what I am holding so far — tell me what I have wrong.",
    );
  }

  // Options premature — keep gathering without inventing a field to fill
  if (!optionReady.optionsReady) {
    return plan(
      4,
      "What do you most want to protect as we think this through?",
      `Options wait until ready (${optionReady.readiness}).`,
      [
        choice(
          "protect",
          "What to protect",
          "What do you most want to protect?",
        ),
        choice(
          "happen",
          "What is happening",
          "What is happening in the current situation?",
        ),
        choice(
          "outcome",
          "What good looks like",
          "What would a good outcome look like?",
        ),
      ].slice(0, maxChoices),
      maxChoices,
    );
  }

  return plan(
    3,
    "What else feels important for me to understand?",
    "Continue understanding before recommending.",
    [
      choice(
        "else",
        "What else matters?",
        "What else feels important for me to understand?",
      ),
    ].slice(0, maxChoices),
    maxChoices,
  );
}

/** Map move → whether a new question should be asked this turn. */
export function shouldAskAnotherQuestion(
  move: StrategicThinkingMove,
  item: StrategyWorkItem,
): boolean {
  if (move === "recommend_handoff" && item.decisionRecordConfirmed) {
    return true;
  }
  if (
    move === "generate_options" &&
    !assessOptionReadiness(item).optionsReady
  ) {
    return false;
  }
  return true;
}
