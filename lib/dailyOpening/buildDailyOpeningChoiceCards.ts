/**
 * Rich choice cards for Global Daily Companion Opening.
 * Exactly three cards — Meaningful Start / Plan or Adapt / Help Me Choose.
 * Show Me Something Helpful is a separate secondary action (not a card).
 */

import { hasActivePlanForToday } from "@/lib/dailyAdaptation/hasActivePlanToday";
import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type {
  DailyOpeningChoiceCard,
  DailyOpeningChoiceId,
} from "./types";
import { DAILY_OPENING_CHOICE_LABELS_CONTINUE_FALLBACK } from "./types";

function joinExplanation(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join(" ");
}

export function buildDailyOpeningChoiceCards(
  _continueOption: CompanionContinueOption | null,
): DailyOpeningChoiceCard[] {
  const hasPlan = hasActivePlanForToday();

  const meaningfulLines = [
    "One meaningful next step — not a full day plan.",
    "We’ll recommend a small starting point you can begin right away.",
  ];
  const planLines = [
    "Build today's plan or adjust it around what has changed.",
    "Uses your real day plan — Plan when empty, Adapt when one already exists.",
  ];
  const helpLines = [
    "Tell me what kind of support you need right now.",
    "I'll offer a few need-based options — not another copy of these cards.",
  ];

  return [
    {
      id: "continue-meaningful-work",
      title: DAILY_OPENING_CHOICE_LABELS_CONTINUE_FALLBACK,
      supportLines: meaningfulLines,
      explanation: joinExplanation(meaningfulLines),
      estimateLabel: "About 2 minutes",
      recommended: !hasPlan,
    },
    {
      id: "plan-or-adapt-my-day",
      title: "Plan or Adapt My Day",
      supportLines: planLines,
      explanation: joinExplanation(planLines),
      estimateLabel: "About 5 minutes",
      recommended: hasPlan,
    },
    {
      id: "help-me-choose",
      title: "Help Me Choose",
      supportLines: helpLines,
      explanation: joinExplanation(helpLines),
      estimateLabel: null,
      recommended: false,
    },
  ];
}

export function choiceCardById(
  cards: DailyOpeningChoiceCard[],
  id: DailyOpeningChoiceId,
): DailyOpeningChoiceCard | undefined {
  return cards.find((c) => c.id === id);
}
