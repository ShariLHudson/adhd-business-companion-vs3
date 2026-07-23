import type { StrategyEntryReason } from "./types";

/** One natural opening question per entry reason — never a five-stage form. */
export const STRATEGY_ENTRY_OPENING_QUESTION: Record<StrategyEntryReason, string> =
  {
    need_direction:
      "What's the situation you're trying to get clearer about right now?",
    important_decision: "What decision are you facing?",
    rethink_current_direction:
      "What about the current direction feels like it isn't working anymore?",
    new_opportunity: "What opportunity are you considering?",
    problem_not_improving: "What keeps not improving, even after you've tried?",
    major_commitment:
      "What commitment are you thinking about making?",
    review_existing_strategy: "Which strategy or direction do you want to revisit?",
    referred_from_other_destination:
      "What would help most to continue from where you left off?",
    unsure: "What's on your mind that brought you here?",
  };

export function openingQuestionForEntry(
  entryReason: StrategyEntryReason,
): string {
  return STRATEGY_ENTRY_OPENING_QUESTION[entryReason];
}
