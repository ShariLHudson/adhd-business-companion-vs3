/**
 * Rich choice cards for Global Daily Companion Opening.
 * Exactly three cards — Continue / Plan or Adapt / Help Me Choose.
 * Show Me Something Helpful is a separate secondary action (not a card).
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

/** Raw chat dumps / long questions must never become card titles. */
function looksLikeRawUserDump(title: string): boolean {
  const t = title.trim();
  if (!t) return true;
  if (t.length > 52) return true;
  if (/[?]/.test(t)) return true;
  if ((t.match(/\s/g) ?? []).length >= 8) return true;
  if (
    /^(whether|if|should|can i|do i|i |what |how |why |when |where )\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

function continueCardTitle(option: CompanionContinueOption | null): string {
  if (!option) return "Start With What Matters Today";
  const title = option.title.trim();
  if (looksLikeRawUserDump(title)) {
    const typeLabel = option.homeResumeItem?.typeLabel?.trim();
    if (typeLabel) {
      if (/^continue\b/i.test(typeLabel)) return typeLabel;
      if (/^(your |my |the )/i.test(typeLabel)) return `Continue ${typeLabel}`;
      return `Continue Your ${typeLabel}`;
    }
    return "Continue Where I Left Off";
  }
  if (/^continue\b/i.test(title)) return title;
  if (/^(return to|resume)\b/i.test(title)) return title;
  if (/^(your |my |the )/i.test(title)) return `Continue ${title}`;
  return `Continue ${title}`;
}

function continueWhy(option: CompanionContinueOption | null): string {
  if (!option) {
    return "Begin with one meaningful focus when nothing specific is waiting.";
  }
  const sub = option.subtitle?.trim();
  if (sub && !/help me restart|pick up where you left off/i.test(sub)) {
    return sub;
  }
  if (option.homeResumeItem?.typeLabel) {
    return `You were in the middle of ${option.homeResumeItem.typeLabel}.`;
  }
  return "Return directly to the most meaningful thing already in progress.";
}

function continueWhere(option: CompanionContinueOption | null): string {
  if (!option) {
    return "We'll open one manageable next step — no catch-up list.";
  }
  if (option.homeResumeItem?.typeLabel) {
    return `Takes you straight back to your ${option.homeResumeItem.typeLabel}.`;
  }
  return "Takes you directly there — no extra menu.";
}

function joinExplanation(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join(" ");
}

export function buildDailyOpeningChoiceCards(
  continueOption: CompanionContinueOption | null,
): DailyOpeningChoiceCard[] {
  const recommendContinue = Boolean(continueOption);

  const continueLines = [
    continueWhy(continueOption),
    continueWhere(continueOption),
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
      title: continueCardTitle(continueOption),
      supportLines: continueLines,
      explanation: joinExplanation(continueLines),
      estimateLabel: estimateForContinue(continueOption),
      recommended: recommendContinue,
    },
    {
      id: "plan-or-adapt-my-day",
      title: "Plan or Adapt My Day",
      supportLines: planLines,
      explanation: joinExplanation(planLines),
      estimateLabel: "About 5 minutes",
      recommended: !recommendContinue,
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
