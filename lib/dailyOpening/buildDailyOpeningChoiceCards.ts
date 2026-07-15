/**
 * Rich choice cards for Global Daily Companion Opening.
 * Exactly three cards — title, explanation, optional time estimate, one Recommended.
 */

import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import type {
  DailyOpeningChoiceCard,
  DailyOpeningChoiceId,
} from "./types";

function estimateForContinue(
  option: CompanionContinueOption | null,
): string | null {
  if (!option) return null;
  switch (option.kind) {
    case "conversation":
      return "About 3 minutes";
    case "plan-my-day":
      return "About 5 minutes";
    case "project":
    case "document":
      return "About 4 minutes";
    case "visual-thinking":
      return "About 6 minutes";
    default:
      return "About 4 minutes";
  }
}

function continueCardTitle(option: CompanionContinueOption | null): string {
  if (!option) return "Review Where You Left Off";
  const title = option.title.trim();
  if (/^continue\b/i.test(title)) return title;
  // Avoid vague wrappers when the title is already specific.
  if (/^(your |my |the )/i.test(title)) return `Continue ${title}`;
  return `Continue Your ${title}`;
}

function continueExplanation(option: CompanionContinueOption | null): string {
  if (!option) {
    return "We'll open one manageable place to begin — no catch-up list.";
  }
  const sub = option.subtitle?.trim();
  if (sub && !/help me restart|pick up where you left off/i.test(sub)) {
    return sub;
  }
  if (option.homeResumeItem?.typeLabel) {
    return `Pick up where you stopped in ${option.homeResumeItem.typeLabel}.`;
  }
  return "Pick up where you stopped.";
}

export function buildDailyOpeningChoiceCards(
  continueOption: CompanionContinueOption | null,
): DailyOpeningChoiceCard[] {
  const recommendContinue = Boolean(continueOption);

  return [
    {
      id: "continue-meaningful-work",
      title: continueCardTitle(continueOption),
      explanation: continueExplanation(continueOption),
      estimateLabel: estimateForContinue(continueOption),
      recommended: recommendContinue,
    },
    {
      id: "plan-or-adapt-my-day",
      title: "Plan or Adapt My Day",
      explanation:
        "Build today's plan or adjust it to fit your time, energy, calendar, and priorities.",
      estimateLabel: "About 5 minutes",
      recommended: !recommendContinue,
    },
    {
      id: "help-me-choose",
      title: "Help Me Choose",
      explanation:
        "I'll suggest three useful next steps based on where you are today.",
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
