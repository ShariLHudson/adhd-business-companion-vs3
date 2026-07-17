/**
 * Strategy Library — Spark Estate destination copy (guided entrance 128–132).
 */

export const STRATEGY_LIBRARY_ROOM_BG =
  "/backgrounds/strategy-conference-room.png";

export const STRATEGY_LIBRARY_TITLE = "ADHD Entrepreneur Strategy Library";

export const STRATEGY_LIBRARY_SUBTITLE =
  "A calm place to find, tailor, or build a strategy — then connect it to real action.";

export const STRATEGY_LIBRARY_HOW_DO_I = [
  "I Have a Problem and Need Help — tell Shari what is happening. She helps pick a strategy, tailor it, and walk through it with you.",
  "I Want to Explore Ideas — browse by topic or challenge, read how a strategy works, and decide if it fits.",
  "I Want to Build My Own Strategy — shape a strategy around your business, ADHD, time, and real constraints — not a blank form.",
  "Continue Where I Left Off — return to a saved strategy or apply session with your progress intact.",
  "After a strategy is ready, you can add a first step to Plan My Day, connect a Project, or create a Reminder or Rhythm — only when you choose.",
].join("\n\n");

/** Display order matches guided entrance; ids remain apply | browse | create | resume. */
export const STRATEGY_LIBRARY_MODE_CHOICES = [
  {
    id: "apply" as const,
    label: "I Have a Problem and Need Help",
    description:
      "Tell Shari what is happening. She will help identify the best strategy, tailor it to your situation, and walk through it with you.",
  },
  {
    id: "browse" as const,
    label: "I Want to Explore Ideas",
    description:
      "Browse strategies by topic or challenge, read how they work, and decide whether one fits.",
  },
  {
    id: "create" as const,
    label: "I Want to Build My Own Strategy",
    description:
      "Build a strategy around your business, ADHD, available time, resources, and real situation.",
  },
  {
    id: "resume" as const,
    label: "Continue Where I Left Off",
    description:
      "Return to a saved strategy with your previous decisions, notes, and progress intact.",
  },
] as const;

export type StrategyLibraryModeId =
  (typeof STRATEGY_LIBRARY_MODE_CHOICES)[number]["id"];

export type StrategyEntranceHint = {
  recommendedMode: StrategyLibraryModeId;
  reason: string;
};

/**
 * Recommend one entrance path from optional search / member wording.
 * Defaults to Apply — most members arrive with a problem.
 */
export function recommendStrategyLibraryMode(
  hint?: string | null,
): StrategyEntranceHint {
  const t = (hint ?? "").trim().toLowerCase();
  if (!t) {
    return {
      recommendedMode: "apply",
      reason: "Most helpful when something is already hard and you want a next step.",
    };
  }
  if (
    /\b(resume|continue|left off|saved|where i left|pick up)\b/.test(t)
  ) {
    return {
      recommendedMode: "resume",
      reason: "Your words sound like you want to continue earlier strategy work.",
    };
  }
  if (
    /\b(browse|explore|look around|what strategies|show me|ideas)\b/.test(t)
  ) {
    return {
      recommendedMode: "browse",
      reason: "Sounds like you want to explore options before committing.",
    };
  }
  if (
    /\b(create|build|write my own|custom|from scratch|make a strategy)\b/.test(
      t,
    )
  ) {
    return {
      recommendedMode: "create",
      reason: "Sounds like you want a strategy shaped specifically for you.",
    };
  }
  return {
    recommendedMode: "apply",
    reason: "When something is already going on, Apply usually helps first.",
  };
}
