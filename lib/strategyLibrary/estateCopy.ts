/**
 * Strategy Library — Spark Estate destination copy (109–112 package).
 */

export const STRATEGY_LIBRARY_ROOM_BG =
  "/backgrounds/strategy-conference-room.png";

export const STRATEGY_LIBRARY_TITLE = "ADHD Entrepreneur Strategy Library";

export const STRATEGY_LIBRARY_SUBTITLE =
  "Browse proven strategies for real problems — or build your own with Shari.";

export const STRATEGY_LIBRARY_HOW_DO_I = [
  "Browse when you want to explore by topic, search by problem, or open a strategy to read.",
  "Apply when you want Shari to walk a strategy with you for your real situation — one step at a time.",
  "Create when you need a custom strategy built around your business and how your brain works.",
  "Resume opens work you already started or strategies you saved — nothing important gets lost.",
  "Use Saved for strategies you want to keep nearby. Switch modes anytime from the choices above.",
].join("\n\n");

export const STRATEGY_LIBRARY_MODE_CHOICES = [
  {
    id: "browse" as const,
    label: "Browse Strategies",
    description: "Explore by topic, search a problem, or open a strategy to read.",
  },
  {
    id: "apply" as const,
    label: "Apply a Strategy",
    description: "Walk a strategy with Shari for what you are facing now.",
  },
  {
    id: "create" as const,
    label: "Create a Strategy",
    description: "Build a custom strategy shaped around your real situation.",
  },
  {
    id: "resume" as const,
    label: "Resume a Strategy",
    description: "Return to saved strategies or work you already started.",
  },
] as const;

export type StrategyLibraryModeId =
  (typeof STRATEGY_LIBRARY_MODE_CHOICES)[number]["id"];
