/**
 * Rich choice cards for Global Daily Companion Opening.
 * Exactly three cards — Continue / Plan or Adapt / Help Me Choose.
 * When Active Workspace exists, the first card is current work only
 * (never a list of document cards). Show Me Something Helpful stays secondary.
 */

import { hasActivePlanForToday } from "@/lib/dailyAdaptation/hasActivePlanToday";
import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type { WelcomeActiveWorkCard } from "@/lib/welcomeHome/resolveWelcomeActiveWork";
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
  activeWork?: WelcomeActiveWorkCard | null,
): DailyOpeningChoiceCard[] {
  const hasPlan = hasActivePlanForToday();

  const firstCard: DailyOpeningChoiceCard = activeWork
    ? {
        id: "continue-meaningful-work",
        title: "Continue Where You Left Off",
        supportLines: [
          activeWork.title,
          activeWork.statusLabel,
          "Continue →",
        ].filter(Boolean),
        explanation: joinExplanation([
          activeWork.title,
          activeWork.statusLabel,
          "Continue →",
        ]),
        estimateLabel: null,
        recommended: true,
      }
    : {
        id: "continue-meaningful-work",
        title: DAILY_OPENING_CHOICE_LABELS_CONTINUE_FALLBACK,
        supportLines: [
          "One meaningful next step — not a full day plan.",
          "We’ll recommend a small starting point you can begin right away.",
        ],
        explanation: joinExplanation([
          "One meaningful next step — not a full day plan.",
          "We’ll recommend a small starting point you can begin right away.",
        ]),
        estimateLabel: "About 2 minutes",
        recommended: !hasPlan,
      };

  const planLines = [
    "Build today's plan or adjust it around what has changed.",
    "Uses your real day plan — Plan when empty, Adapt when one already exists.",
  ];
  const helpLines = [
    "Tell me what kind of support you need right now.",
    "I'll offer a few need-based options — not another copy of these cards.",
  ];

  return [
    firstCard,
    {
      id: "plan-or-adapt-my-day",
      title: "Plan or Adapt My Day",
      supportLines: planLines,
      explanation: joinExplanation(planLines),
      estimateLabel: "About 5 minutes",
      recommended: activeWork ? false : hasPlan,
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
