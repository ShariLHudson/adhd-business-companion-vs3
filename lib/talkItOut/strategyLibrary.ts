/**
 * Package 201 — Talk It Out Conversation Strategy Library.
 * Approved reflective moves — one primary purpose per turn.
 */

export type TioStrategyMoveId =
  | "clarify_why_now"
  | "clarify_desired_outcome"
  | "clarify_practical_problem"
  | "identify_what_is_known"
  | "identify_what_is_uncertain"
  | "separate_two_concerns"
  | "clarify_the_role"
  | "clarify_success"
  | "identify_constraints"
  | "meaning_based_recognition"
  | "emerging_picture"
  | "supported_tension"
  | "distinction"
  | "own_and_correct"
  | "explain_plainly"
  | "restore_topic"
  | "summarize_what_became_clear"
  | "identify_remaining_question"
  | "check_accuracy"
  | "offer_optional_continuation"
  | "name_the_clarity_reached"
  | "transition_to_action";

export type TioStrategyMove = {
  id: TioStrategyMoveId;
  family:
    | "opening"
    | "exploration"
    | "reflective"
    | "repair"
    | "synthesis"
    | "completion";
  example: string;
  avoidRepeat: boolean;
};

export const TIO_STRATEGY_MOVES: readonly TioStrategyMove[] = [
  {
    id: "clarify_why_now",
    family: "opening",
    example: "What is making you consider this now?",
    avoidRepeat: true,
  },
  {
    id: "clarify_desired_outcome",
    family: "opening",
    example: "What would you hope changes if this works well?",
    avoidRepeat: true,
  },
  {
    id: "clarify_practical_problem",
    family: "opening",
    example: "What part of this is creating the most difficulty right now?",
    avoidRepeat: true,
  },
  {
    id: "identify_what_is_known",
    family: "exploration",
    example: "What do you already know for sure about the situation?",
    avoidRepeat: true,
  },
  {
    id: "identify_what_is_uncertain",
    family: "exploration",
    example: "What part still feels hardest to judge?",
    avoidRepeat: true,
  },
  {
    id: "separate_two_concerns",
    family: "exploration",
    example:
      "It sounds like cost and trust may be separate concerns. Which one is making the decision harder?",
    avoidRepeat: true,
  },
  {
    id: "clarify_the_role",
    family: "exploration",
    example: "What would you actually want this person to take responsibility for?",
    avoidRepeat: true,
  },
  {
    id: "clarify_success",
    family: "exploration",
    example: "What would need to happen for you to feel this was working?",
    avoidRepeat: true,
  },
  {
    id: "identify_constraints",
    family: "exploration",
    example: "What limits or conditions does the decision need to fit?",
    avoidRepeat: true,
  },
  {
    id: "emerging_picture",
    family: "reflective",
    example:
      "So far, it sounds like the need is clear, but the expected return is not.",
    avoidRepeat: false,
  },
  {
    id: "own_and_correct",
    family: "repair",
    example:
      "I read more into that than you meant. Let us stay with the decision itself.",
    avoidRepeat: false,
  },
  {
    id: "explain_plainly",
    family: "repair",
    example: "I did not say that clearly. What I meant was...",
    avoidRepeat: false,
  },
  {
    id: "restore_topic",
    family: "repair",
    example: "Returning to the hiring question, what has brought it up now?",
    avoidRepeat: false,
  },
  {
    id: "summarize_what_became_clear",
    family: "synthesis",
    example:
      "You know why you want help and what tasks you would delegate. The unclear part is what results would justify the cost.",
    avoidRepeat: true,
  },
  {
    id: "offer_optional_continuation",
    family: "completion",
    example:
      "Would it help to keep talking through what a small first version of the role could look like, or do you feel clearer already?",
    avoidRepeat: true,
  },
  {
    id: "transition_to_action",
    family: "completion",
    example:
      "We can turn what became clear into a short list of questions to answer before hiring.",
    avoidRepeat: true,
  },
] as const;

export function selectStrategyMove(input: {
  phase?: string;
  priorityEvent?: string;
  turnCount: number;
  usedMoves: readonly string[];
  hireLike?: boolean;
  wantsSummary?: boolean;
  completionSignal?: boolean;
}): TioStrategyMoveId {
  if (
    input.priorityEvent === "direct_correction" ||
    input.priorityEvent === "clarification_request"
  ) {
    return input.priorityEvent === "clarification_request"
      ? "explain_plainly"
      : "own_and_correct";
  }
  if (input.wantsSummary || input.completionSignal) {
    return "summarize_what_became_clear";
  }
  if (input.phase === "repair") return "restore_topic";
  if (input.turnCount <= 1) return "clarify_why_now";
  if (input.turnCount === 2) return "clarify_desired_outcome";
  if (input.hireLike && !input.usedMoves.includes("clarify_the_role")) {
    return "clarify_the_role";
  }
  if (input.turnCount >= 6 && !input.usedMoves.includes("emerging_picture")) {
    return "emerging_picture";
  }
  if (!input.usedMoves.includes("identify_what_is_uncertain")) {
    return "identify_what_is_uncertain";
  }
  return "clarify_practical_problem";
}

export function strategyExample(id: TioStrategyMoveId): string {
  return (
    TIO_STRATEGY_MOVES.find((m) => m.id === id)?.example ??
    "What part of this feels most useful to understand first?"
  );
}
