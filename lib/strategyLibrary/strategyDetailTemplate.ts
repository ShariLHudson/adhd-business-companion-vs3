/**
 * Standardized strategy-detail sections (128–132).
 * Derived from existing Strategy records — does not rewrite the catalog.
 */

import type { Strategy } from "@/lib/strategySystem";

export type ChamberContributionSummary = {
  roleLabel: string;
  guidance: string;
};

export type StrategyDetailViewModel = {
  helpsWith: string;
  whenToUse: string;
  whenNotToUse: string;
  whyItWorks: string;
  adhdWhy: string;
  situationApplication: string;
  firstStep: string;
  steps: string[];
  commonProblems: string;
  howToAdapt: string;
  howToKnowWorking: string;
  chamber: ChamberContributionSummary[];
  example: string;
};

const WHEN_NOT_BY_CATEGORY: Record<string, string> = {
  overwhelm:
    "Skip this when you need emergency rest or medical care more than a planning strategy.",
  procrastination:
    "Skip this when the real block is missing information or waiting on someone else — clarify that first.",
  focus:
    "Skip this when you are already deep in useful hyperfocus and interrupting would cost more than it helps.",
  perfectionism:
    "Skip this when the work is already good enough to ship and you are only polishing to avoid judgment.",
  burnout:
    "Skip this when you need recovery first — strategies cannot replace rest.",
  marketing:
    "Skip this when you do not yet know who you help — clarify audience before tactics.",
  sales:
    "Skip this when there is no offer or price yet — finish the foundation first.",
  pricing:
    "Skip this when you have no clarity on costs or outcomes — gather that before changing rates.",
};

function chamberForCategory(categoryId: string): ChamberContributionSummary[] {
  if (
    ["marketing", "content", "visibility"].includes(categoryId)
  ) {
    return [
      {
        roleLabel: "Content & Visibility",
        guidance:
          "Keep the message simple enough that a tired brain can still send it. One clear offer beats five clever ones.",
      },
    ];
  }
  if (["sales", "pricing", "offers"].includes(categoryId)) {
    return [
      {
        roleLabel: "Finance & Sales",
        guidance:
          "Protect cash and clarity — price and ask in language that matches the value you already deliver.",
      },
    ];
  }
  if (["customer-relations", "systems"].includes(categoryId)) {
    return [
      {
        roleLabel: "Client Relationships & Operations",
        guidance:
          "Boundaries and simple follow-up beats heroic rescue. Document the next touch once.",
      },
    ];
  }
  if (
    ["overwhelm", "procrastination", "focus", "burnout", "emotional-regulation"].includes(
      categoryId,
    )
  ) {
    return [
      {
        roleLabel: "ADHD Support",
        guidance:
          "Shrink the first move until it fits the energy you have now. Progress counts even when it is tiny.",
      },
    ];
  }
  return [
    {
      roleLabel: "Specialist guidance",
      guidance:
        "Use this strategy as a scaffold — adapt language and timing to your real week.",
    },
  ];
}

export function buildStrategyDetailViewModel(
  s: Strategy,
): StrategyDetailViewModel {
  const firstStep = s.steps[0]?.trim() || "Choose the smallest next action and begin.";
  return {
    helpsWith: s.problem,
    whenToUse: s.whenToUse,
    whenNotToUse:
      WHEN_NOT_BY_CATEGORY[s.categoryId] ??
      "Skip this when a simpler conversation or rest would help more than a full strategy.",
    whyItWorks: s.whyWorks,
    adhdWhy: s.whyBrain,
    situationApplication: `For your situation, begin by naming the real friction in one sentence, then use “${firstStep}” as the first move — not the whole plan.`,
    firstStep,
    steps: s.steps,
    commonProblems:
      "Common friction: starting too big, skipping the first step, or treating every item as urgent. If that happens, return to the first step only.",
    howToAdapt:
      "If energy drops, keep the first step and park the rest. If motivation is high, protect one focus block and defer shiny extras.",
    howToKnowWorking:
      "You will know it is working when the next action is obvious, shame drops a little, and you can name one completed move.",
    chamber: chamberForCategory(s.categoryId),
    example: s.example,
  };
}

export function shouldOfferBoardReview(s: Strategy): boolean {
  return ["pricing", "offers", "sales", "systems", "marketing"].includes(
    s.categoryId,
  );
}

export function shouldOfferVisualThinking(s: Strategy): boolean {
  return s.steps.length >= 4 || ["systems", "offers", "marketing"].includes(s.categoryId);
}
