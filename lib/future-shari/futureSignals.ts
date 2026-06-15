/**
 * Detect future-benefit opportunities from conversation and integrations.
 */

import { getBrainDumps, getDayState } from "@/lib/companionStore";
import type {
  FutureConfidence,
  FutureOpportunityType,
  FutureShariInput,
  FutureTimeframe,
} from "./types";

export type FutureCandidate = {
  opportunity: FutureOpportunityType;
  weight: number;
  futureBenefit: string;
  futureCost: string;
  timeframe: FutureTimeframe;
  suggestedAction: string;
  futureMessage: string;
  frictionPoint?: string;
};

const CANDIDATES: {
  id: string;
  re: RegExp;
  build: (text: string) => FutureCandidate | null;
}[] = [
  {
    id: "leave_tomorrow",
    re: /\b(leave (this |it )?for tomorrow|deal with (this |it )?tomorrow|tomorrow morning)\b/i,
    build: () => ({
      opportunity: "planning",
      weight: 7,
      futureBenefit: "Tomorrow starts easier.",
      futureCost: "A few minutes now to set up tomorrow.",
      timeframe: "tomorrow",
      suggestedAction: "Jot one thing Future You will need first tomorrow.",
      futureMessage:
        "You could leave some of this for tomorrow — but a tiny setup now might make tomorrow morning gentler.",
      frictionPoint: "Starting cold tomorrow",
    }),
  },
  {
    id: "capture_idea",
    re: /\b(idea|thought|remember this|don't forget|might work)\b/i,
    build: () => ({
      opportunity: "organization",
      weight: 6,
      futureBenefit: "You won't have to carry it in your head later.",
      futureCost: "One quick capture — name it and park it.",
      timeframe: "later_today",
      suggestedAction: "Capture the idea in one sentence — brain dump or note.",
      futureMessage:
        "You could capture this idea now. Future You may be glad it isn't floating around anymore.",
      frictionPoint: "Mental clutter from uncaptured ideas",
    }),
  },
  {
    id: "email_followup",
    re: /\b(email|message|follow up|reply to|get back to)\b/i,
    build: () => ({
      opportunity: "relationship",
      weight: 7,
      futureBenefit: "Future You won't keep thinking about it.",
      futureCost: "A short note now — good enough, not perfect.",
      timeframe: "later_today",
      suggestedAction: "Send a brief follow-up while it's fresh.",
      futureMessage:
        "You could send that message now. Future You might appreciate having it handled.",
      frictionPoint: "Open communication loops",
    }),
  },
  {
    id: "document_workflow",
    re: /\b(every time i|steps i take|how i do this|workflow|process)\b/i,
    build: () => ({
      opportunity: "learning",
      weight: 6,
      futureBenefit: "Next time won't start from scratch.",
      futureCost: "Rough bullet list — not a manual.",
      timeframe: "this_week",
      suggestedAction: "Document the steps in rough bullets for Future You.",
      futureMessage:
        "This is one of those tiny things that often pays off later — a rough workflow note.",
      frictionPoint: "Reinventing steps each time",
    }),
  },
  {
    id: "visible_reminder",
    re: /\b(keep forgetting|remind me|out of sight|where did i put)\b/i,
    build: () => ({
      opportunity: "home",
      weight: 6,
      futureBenefit: "Future You sees it without searching.",
      futureCost: "Put it somewhere visible or set one reminder.",
      timeframe: "later_today",
      suggestedAction: "Place it where tomorrow-you will trip over it (gently).",
      futureMessage:
        "Would it help to make this visible for Future You — so you don't have to remember again?",
      frictionPoint: "Out-of-sight tasks",
    }),
  },
  {
    id: "park_idea",
    re: /\b(too many ideas|park this|not now but|someday)\b/i,
    build: () => ({
      opportunity: "organization",
      weight: 5,
      futureBenefit: "The idea waits safely without taking mental space today.",
      futureCost: "One line in a parking lot list.",
      timeframe: "this_week",
      suggestedAction: "Park the idea with a one-line label — no action required today.",
      futureMessage:
        "You don't have to act on this now. Parking it might help Future You find it when the time is right.",
      frictionPoint: "Ideas competing for attention",
    }),
  },
];

export function detectFutureCandidates(text: string): FutureCandidate[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hits: FutureCandidate[] = [];
  for (const c of CANDIDATES) {
    if (c.re.test(trimmed)) {
      const built = c.build(trimmed);
      if (built) hits.push(built);
    }
  }
  return hits;
}

export function integrationCandidates(
  input: FutureShariInput,
): FutureCandidate[] {
  const hits: FutureCandidate[] = [];
  const text = input.text ?? "";

  if (
    input.cognitiveLoadLevel === "heavy" ||
    input.cognitiveLoadLevel === "overloaded" ||
    /\b(overwhelm|too much on my mind)\b/i.test(text)
  ) {
    hits.push({
      opportunity: "organization",
      weight: 8,
      futureBenefit: "Less mental clutter later today.",
      futureCost: "Five-minute brain dump — no sorting required.",
      timeframe: "later_today",
      suggestedAction: "Capture what's on your mind — sort later.",
      futureMessage:
        "When everything feels loud, capturing thoughts can help Future You breathe a little.",
      frictionPoint: "Overwhelm without capture",
    });
  }

  if (
    input.decisionState === "stuck" ||
    input.decisionState === "overloaded" ||
    input.decisionState === "considering"
  ) {
    hits.push({
      opportunity: "planning",
      weight: 7,
      futureBenefit: "Decision waits safely — less spinning tonight.",
      futureCost: "Name what you're deciding and park it.",
      timeframe: "tomorrow",
      suggestedAction: "Park the decision with one sentence on what it's about.",
      futureMessage:
        "You don't have to decide now. Parking this might help Future You approach it with fresher energy.",
      frictionPoint: "Decision fatigue",
    });
  }

  if (input.recoveryLevel === "strained" || input.recoveryLevel === "depleted") {
    hits.push({
      opportunity: "recovery",
      weight: 8,
      futureBenefit: "Tomorrow starts with more capacity.",
      futureCost: "Two-minute tomorrow setup — then rest.",
      timeframe: "tomorrow",
      suggestedAction: "Choose one gentle priority for tomorrow, then protect rest tonight.",
      futureMessage:
        "Would it help to make tomorrow a little easier — one small setup, then recovery?",
      frictionPoint: "Low recovery buffer",
    });
  }

  if (input.dayEnergyLow && input.recoveryLevel !== "burnout_risk") {
    hits.push({
      opportunity: "planning",
      weight: 6,
      futureBenefit: "Tomorrow morning has a softer landing.",
      futureCost: "Note one thing to start with tomorrow.",
      timeframe: "tomorrow",
      suggestedAction: "Write tomorrow's first tiny step where you'll see it.",
      futureMessage:
        "With low energy today, a small gift to Future You might be naming tomorrow's first step.",
      frictionPoint: "Low energy without tomorrow anchor",
    });
  }

  if (input.relationshipMention) {
    hits.push({
      opportunity: "relationship",
      weight: 7,
      futureBenefit: "The connection stays warm without lingering worry.",
      futureCost: "A quick check-in message.",
      timeframe: "later_today",
      suggestedAction: "Send a brief follow-up while it's on your mind.",
      futureMessage:
        "Future You might appreciate a quick follow-up — short and human, not polished.",
      frictionPoint: "Relationship follow-up delay",
    });
  }

  if (input.hasOpenBrainDumps) {
    hits.push({
      opportunity: "organization",
      weight: 4,
      futureBenefit: "Open loops get lighter when one item closes.",
      futureCost: "Pick one brain-dump item to handle or delete.",
      timeframe: "later_today",
      suggestedAction: "Close or release one open captured thought.",
      futureMessage:
        "You have some captured thoughts waiting. Future You might appreciate clearing just one.",
      frictionPoint: "Open brain-dump items",
    });
  }

  return hits;
}

export function gatherFutureInput(
  partial: FutureShariInput = {},
): FutureShariInput {
  const day = getDayState();
  return {
    ...partial,
    dayEnergyLow: partial.dayEnergyLow ?? day?.energy === "low",
    hasOpenBrainDumps:
      partial.hasOpenBrainDumps ??
      getBrainDumps().some((e) => !e.done),
  };
}

export function pickFutureCandidate(
  candidates: FutureCandidate[],
): FutureCandidate | null {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => b.weight - a.weight)[0]!;
}

export function confidenceFromWeight(weight: number): FutureConfidence {
  if (weight >= 8) return "high";
  if (weight >= 5) return "medium";
  return "low";
}
