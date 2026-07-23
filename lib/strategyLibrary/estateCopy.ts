/**
 * Strategy Chamber — Spark Estate destination copy (guided entrance).
 * Destination id remains `strategy-library`; section id remains `playbook`.
 */

import type { StrategyEntryReason } from "@/lib/strategyChamber/types";

export const STRATEGY_LIBRARY_ROOM_BG =
  "/backgrounds/strategy-conference-room.png";

/** Member-facing destination name */
export const STRATEGY_LIBRARY_TITLE = "Strategy Chamber";

/** @deprecated alias — prefer STRATEGY_LIBRARY_TITLE */
export const STRATEGY_CHAMBER_TITLE = STRATEGY_LIBRARY_TITLE;

export const STRATEGY_LIBRARY_SUBTITLE =
  "A calm place to understand what is happening, explore options, and choose a direction — then hand work to the right part of Spark Estate.";

export const STRATEGY_CHAMBER_HOW_THIS_HELPS = {
  whatIsThis:
    "The Strategy Chamber helps you understand what is happening, explore your options, make important decisions, and choose a direction that fits your goals, capacity, and situation.\n\nYou do not need to arrive with the right answer or know what kind of strategy you need. Shari will help you find the most useful place to begin.",
  whyUseIt: [
    "Need direction",
    "Have an important decision",
    "Are considering several possible paths",
    "Need to rethink something",
    "Want to understand why something is not working",
    "Are about to invest meaningful time, energy, or money",
    "Need to decide what to pursue — or what not to pursue",
  ],
  whatHappensAfter: [
    "Talk it through",
    "Consult a Chamber member",
    "Take the decision to the Board",
    "Create something",
    "Start or update a project",
    "Develop an execution plan",
    "Add important dates to the calendar",
    "Include work in Plan My Day",
    "Create reminders or Rhythms",
    "Update your Business Estate",
    "Save learning to the Journal or Evidence Vault",
    "Recognize progress and celebrate accomplishments",
  ],
} as const;

/** Collapsible help body (plain text for existing How Do I surface) */
export const STRATEGY_LIBRARY_HOW_DO_I = [
  "What is the Strategy Chamber?",
  STRATEGY_CHAMBER_HOW_THIS_HELPS.whatIsThis,
  "Why would I use it?",
  STRATEGY_CHAMBER_HOW_THIS_HELPS.whyUseIt.map((line) => `• ${line}`).join("\n"),
  "What happens afterward?",
  "Once you choose a direction, Spark Estate can help you continue — Talk It Out, Chamber, Board, Create, Projects, Plan My Day, and more — only when you choose.",
].join("\n\n");

export type StrategyChamberEntryId =
  | "need_direction"
  | "important_decision"
  | "rethink"
  | "help_me_choose";

export const STRATEGY_CHAMBER_PRIMARY_ENTRIES = [
  {
    id: "need_direction" as const,
    label: "I Need Direction",
    description:
      "Help me understand where I am and decide where to go.",
    entryReason: "need_direction" as StrategyEntryReason,
  },
  {
    id: "important_decision" as const,
    label: "I Have a Decision",
    description:
      "Help me compare options and think through an important choice.",
    entryReason: "important_decision" as StrategyEntryReason,
  },
  {
    id: "rethink" as const,
    label: "I Need to Rethink Something",
    description:
      "Help me understand what changed or why the current direction is not working.",
    entryReason: "rethink_current_direction" as StrategyEntryReason,
  },
] as const;

export const STRATEGY_CHAMBER_HELP_ME_CHOOSE = {
  id: "help_me_choose" as const,
  label: "Help Me Choose",
  description: "Shari will help me find the best place to begin.",
  entryReason: "unsure" as StrategyEntryReason,
};

/**
 * Legacy mode ids — still used by workspace presentation and resume mapping.
 * Estate opening uses STRATEGY_CHAMBER_PRIMARY_ENTRIES instead.
 */
export const STRATEGY_LIBRARY_MODE_CHOICES = [
  {
    id: "apply" as const,
    label: "I Need Direction",
    description:
      "Help me understand where I am and decide where to go.",
  },
  {
    id: "browse" as const,
    label: "I Want to Explore Ideas",
    description:
      "Browse strategies by topic or challenge when you already know you want the library.",
  },
  {
    id: "create" as const,
    label: "I Have a Decision",
    description:
      "Compare options and think through an important choice.",
  },
  {
    id: "resume" as const,
    label: "Continue Where I Left Off",
    description:
      "Return to saved strategy work with your previous progress intact.",
  },
] as const;

export type StrategyLibraryModeId =
  (typeof STRATEGY_LIBRARY_MODE_CHOICES)[number]["id"];

export type StrategyEntranceHint = {
  recommendedMode: StrategyLibraryModeId;
  recommendedEntry: StrategyChamberEntryId;
  reason: string;
};

export function chamberEntryToLibraryMode(
  entry: StrategyChamberEntryId,
): StrategyLibraryModeId {
  if (entry === "important_decision") return "create";
  if (entry === "help_me_choose") return "apply";
  if (entry === "rethink") return "apply";
  return "apply";
}

/**
 * Recommend one entrance path from optional search / member wording.
 */
export function recommendStrategyLibraryMode(
  hint?: string | null,
): StrategyEntranceHint {
  const t = (hint ?? "").trim().toLowerCase();
  if (!t) {
    return {
      recommendedMode: "apply",
      recommendedEntry: "need_direction",
      reason: "Most helpful when you want calm clarity before choosing a path.",
    };
  }
  if (/\b(resume|continue|left off|saved|where i left|pick up)\b/.test(t)) {
    return {
      recommendedMode: "resume",
      recommendedEntry: "need_direction",
      reason: "Your words sound like you want to continue earlier strategy work.",
    };
  }
  if (
    /\b(rethink|pivot|not working|wrong direction|change course|stuck with)\b/.test(
      t,
    )
  ) {
    return {
      recommendedMode: "apply",
      recommendedEntry: "rethink",
      reason: "Sounds like the current direction needs a fresh look.",
    };
  }
  if (
    /\b(decide|decision|choose between|options|trade-?off|which (path|way))\b/.test(
      t,
    )
  ) {
    return {
      recommendedMode: "create",
      recommendedEntry: "important_decision",
      reason: "Sounds like an important choice is on the table.",
    };
  }
  if (
    /\b(browse|explore|look around|what strategies|show me|ideas)\b/.test(t)
  ) {
    return {
      recommendedMode: "browse",
      recommendedEntry: "help_me_choose",
      reason: "Sounds like you want to explore — Help Me Choose can start gently.",
    };
  }
  if (
    /\b(create|build|write my own|custom|from scratch|make a strategy)\b/.test(
      t,
    )
  ) {
    return {
      recommendedMode: "create",
      recommendedEntry: "important_decision",
      reason: "Sounds like you want a direction shaped specifically for you.",
    };
  }
  if (/\b(help me choose|not sure|don't know where|unsure)\b/.test(t)) {
    return {
      recommendedMode: "apply",
      recommendedEntry: "help_me_choose",
      reason: "You do not need to know the category — we can find the start together.",
    };
  }
  return {
    recommendedMode: "apply",
    recommendedEntry: "need_direction",
    reason: "When something is already going on, starting with direction usually helps.",
  };
}
