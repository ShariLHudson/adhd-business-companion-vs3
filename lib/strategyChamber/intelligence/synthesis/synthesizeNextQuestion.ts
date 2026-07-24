/**
 * One next question contribution for the shared next-thinking-move selector.
 * Ask one question — never one per domain.
 */

import type { StrategyTypeId } from "../types";
import type { StrategySynthesisConflict } from "./types";

export function synthesizeSuggestedNextQuestion(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  conflicts: StrategySynthesisConflict[];
  needsClarification?: boolean;
  surfaceStatement: string;
}): string | undefined {
  if (input.needsClarification) {
    return "What feels like the most important decision to get clear on first?";
  }

  const { primaryId, secondaryId, conflicts, surfaceStatement } = input;
  const lower = surfaceStatement.toLowerCase();

  if (conflicts[0]?.resolutionMethod === "ask_user" || conflicts[0]?.preferClarify) {
    if (primaryId === "pricing" && secondaryId === "capacity_focus") {
      return "How much of the problem is the price, and how much is the amount of work included?";
    }
    if (primaryId === "growth" && secondaryId === "market_customer") {
      return "Are you having trouble reaching enough people, or are the people you reach not seeing the offer as a strong fit?";
    }
    if (primaryId === "hiring_delegation") {
      return "Which work is consuming your capacity but does not require you personally?";
    }
    if (primaryId === "offer" && secondaryId === "market_customer") {
      return "Who is this program for, and what change should it create for them?";
    }
  }

  if (primaryId === "pricing" && secondaryId === "capacity_focus") {
    return "How much of the problem is the price, and how much is the amount of work included?";
  }
  if (primaryId === "growth" && secondaryId === "capacity_focus") {
    return "If growth worked tomorrow, what would break first in delivery or energy?";
  }
  if (primaryId === "growth" && secondaryId === "pricing") {
    return "Would raising value or price for current customers matter more than finding new ones?";
  }
  if (
    primaryId === "growth" &&
    secondaryId === "market_customer" &&
    /posting|right customers|audience/.test(lower)
  ) {
    return "Are you having trouble reaching enough people, or are the people you reach not seeing the offer as a strong fit?";
  }

  return undefined;
}
