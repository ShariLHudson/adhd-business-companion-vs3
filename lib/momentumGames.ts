/** Momentum Games — playful ADHD-friendly resets organized by what your brain needs. */

import { sortByDropdownLabel } from "./dropdownSort";

export type MomentumNeedId =
  | "focus-attention"
  | "momentum-action"
  | "creative-spark"
  | "mental-vacation"
  | "just-for-fun";

export type GameEnergy = "Low" | "Medium" | "Any" | "None";

export type MomentumGameDef = {
  id: string;
  label: string;
  objectId: string;
  need: MomentumNeedId;
  /** One-sentence description shown on the game card. */
  description: string;
  helpsWith: string;
  time: string;
  energy: GameEnergy;
  /** Opens another focus tool instead of an in-panel mini-game. */
  externalTool?: "spin-wheel";
};

import { MOMENTUM_NEED_OBJECT_ID } from "./workspaceObjectIds";

export type MomentumNeedCategory = {
  id: MomentumNeedId;
  objectId: string;
  title: string;
  tagline: string;
  color: string;
};

export const MOMENTUM_NEED_CATEGORIES: MomentumNeedCategory[] = [
  {
    id: "focus-attention",
    objectId: MOMENTUM_NEED_OBJECT_ID["focus-attention"],
    title: "Focus & Attention",
    tagline: "Help when your brain feels scattered or distracted.",
    color: "#3b82f6",
  },
  {
    id: "momentum-action",
    objectId: MOMENTUM_NEED_OBJECT_ID["momentum-action"],
    title: "Momentum & Action",
    tagline: "Help when you know what to do but can't get started.",
    color: "#f59e0b",
  },
  {
    id: "creative-spark",
    objectId: MOMENTUM_NEED_OBJECT_ID["creative-spark"],
    title: "Creative Spark",
    tagline: "Help when you need ideas, inspiration, or fresh thinking.",
    color: "#a855f7",
  },
  {
    id: "mental-vacation",
    objectId: MOMENTUM_NEED_OBJECT_ID["mental-vacation"],
    title: "Mental Vacation",
    tagline: "Help when you're overwhelmed and need a break.",
    color: "#22c55e",
  },
  {
    id: "just-for-fun",
    objectId: MOMENTUM_NEED_OBJECT_ID["just-for-fun"],
    title: "Just For Fun",
    tagline: "No goals. No productivity. Just dopamine.",
    color: "#e0795a",
  },
];

export const MOMENTUM_GAMES: MomentumGameDef[] = [
  // 🧠 Focus & Attention
  {
    id: "focus-sprint",
    label: "Focus Sprint",
    objectId: "games",
    need: "focus-attention",
    description: "Mini timed tap challenge to sharpen attention.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "memory-match",
    label: "Memory Match",
    objectId: "games",
    need: "focus-attention",
    description: "Flip and pair matching symbols.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "number-hunt",
    label: "Number Hunt",
    objectId: "games",
    need: "focus-attention",
    description: "Find numbers 1 through 9 in order.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "pattern-match",
    label: "Pattern Match",
    objectId: "games",
    need: "focus-attention",
    description: "Tap the tile that's different.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "quick-sort",
    label: "Quick Sort",
    objectId: "games",
    need: "focus-attention",
    description: "Sort items into the right buckets fast.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "sequence-builder",
    label: "Sequence Builder",
    objectId: "games",
    need: "focus-attention",
    description: "Tap items in the right order.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  {
    id: "shape-match",
    label: "Shape Match",
    objectId: "games",
    need: "focus-attention",
    description: "Match the target shape.",
    helpsWith: "Focus",
    time: "1–3 minutes",
    energy: "Low",
  },
  // ⚡ Momentum & Action
  {
    id: "first-step-finder",
    label: "First Step Finder",
    objectId: "games",
    need: "momentum-action",
    description: "Shrink one stuck task down to a tiny first move.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
  },
  {
    id: "random-action-generator",
    label: "Random Action Generator",
    objectId: "games",
    need: "momentum-action",
    description: "Get one small action you can do right now.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
  },
  {
    id: "reaction-tap",
    label: "Reaction Tap",
    objectId: "games",
    need: "momentum-action",
    description: "Tap the target color as fast as you can.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
  },
  {
    id: "spin-the-wheel",
    label: "Spin The Wheel",
    objectId: "games",
    need: "momentum-action",
    description: "Let the wheel pick one thing when everything feels equal.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
    externalTool: "spin-wheel",
  },
  {
    id: "this-or-that",
    label: "This Or That",
    objectId: "games",
    need: "momentum-action",
    description: "Fast choices — no wrong answers, just movement.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
  },
  {
    id: "tiny-win-challenge",
    label: "Tiny Win Challenge",
    objectId: "games",
    need: "momentum-action",
    description: "Stack three micro-wins to build momentum.",
    helpsWith: "Getting Started",
    time: "1–5 minutes",
    energy: "Low",
  },
  // 💡 Creative Spark
  {
    id: "category-blitz",
    label: "Category Blitz",
    objectId: "games",
    need: "creative-spark",
    description: "Name items in a category before time runs out.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  {
    id: "opposite-thinking",
    label: "Opposite Thinking",
    objectId: "games",
    need: "creative-spark",
    description: "Flip a familiar idea and see what opens up.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  {
    id: "random-idea-generator",
    label: "Random Idea Generator",
    objectId: "games",
    need: "creative-spark",
    description: "A surprise prompt to spark a fresh angle.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  {
    id: "story-starter",
    label: "Story Starter",
    objectId: "games",
    need: "creative-spark",
    description: "Open with one line — let your brain fill in the rest.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  {
    id: "what-if-challenge",
    label: "What If Challenge",
    objectId: "games",
    need: "creative-spark",
    description: "Play with a what-if question to loosen rigid thinking.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  {
    id: "word-search-mini",
    label: "Word Search Mini",
    objectId: "games",
    need: "creative-spark",
    description: "Find three short words in the grid.",
    helpsWith: "Ideas",
    time: "2–5 minutes",
    energy: "Medium",
  },
  // 🌴 Mental Vacation
  {
    id: "color-quest",
    label: "Color Quest",
    objectId: "games",
    need: "mental-vacation",
    description: "Follow the color rule — ignore the rest.",
    helpsWith: "Mental Reset",
    time: "2–5 minutes",
    energy: "None",
  },
  {
    id: "find-duplicate",
    label: "Find The Duplicate",
    objectId: "games",
    need: "mental-vacation",
    description: "Spot the two matching symbols.",
    helpsWith: "Mental Reset",
    time: "2–5 minutes",
    energy: "None",
  },
  {
    id: "hidden-objects",
    label: "Hidden Objects",
    objectId: "games",
    need: "mental-vacation",
    description: "Hunt for hidden gems in a calm grid.",
    helpsWith: "Mental Reset",
    time: "2–5 minutes",
    energy: "None",
  },
  {
    id: "spot-difference",
    label: "Spot The Difference",
    objectId: "games",
    need: "mental-vacation",
    description: "Find the one tile that doesn't belong.",
    helpsWith: "Mental Reset",
    time: "2–5 minutes",
    energy: "None",
  },
  {
    id: "treasure-hunt",
    label: "Treasure Hunt",
    objectId: "games",
    need: "mental-vacation",
    description: "Find hidden gems in the grid.",
    helpsWith: "Mental Reset",
    time: "2–5 minutes",
    energy: "None",
  },
  // 🎉 Just For Fun
  {
    id: "finish-the-sentence",
    label: "Finish The Sentence",
    objectId: "games",
    need: "just-for-fun",
    description: "Complete a silly or surprising sentence starter.",
    helpsWith: "Mood",
    time: "1–5 minutes",
    energy: "Any",
  },
  {
    id: "random-trivia",
    label: "Random Trivia",
    objectId: "games",
    need: "just-for-fun",
    description: "One fun fact — guess or just enjoy.",
    helpsWith: "Mood",
    time: "1–5 minutes",
    energy: "Any",
  },
  {
    id: "this-or-that-fun",
    label: "This Or That (Fun Version)",
    objectId: "games",
    need: "just-for-fun",
    description: "Playful picks — zero stakes, pure dopamine.",
    helpsWith: "Mood",
    time: "1–5 minutes",
    energy: "Any",
  },
  {
    id: "two-truths-lie",
    label: "Two Truths And A Lie",
    objectId: "games",
    need: "just-for-fun",
    description: "Spot the odd one out in three quick statements.",
    helpsWith: "Mood",
    time: "1–5 minutes",
    energy: "Any",
  },
  {
    id: "would-you-rather",
    label: "Would You Rather",
    objectId: "games",
    need: "just-for-fun",
    description: "Pick between two fun scenarios — no wrong answer.",
    helpsWith: "Mood",
    time: "1–5 minutes",
    energy: "Any",
  },
];

/** Original in-app mini-game ids (preserved for compatibility). */
export const LEGACY_MOMENTUM_GAME_IDS = [
  "pattern-match",
  "spot-difference",
  "memory-match",
  "sequence-builder",
  "quick-sort",
  "focus-sprint",
  "treasure-hunt",
  "reaction-tap",
  "color-quest",
  "number-hunt",
  "word-search-mini",
  "shape-match",
  "category-blitz",
  "this-or-that",
  "find-duplicate",
] as const;

export function getMomentumNeedCategory(
  id: MomentumNeedId,
): MomentumNeedCategory {
  return (
    MOMENTUM_NEED_CATEGORIES.find((c) => c.id === id) ??
    MOMENTUM_NEED_CATEGORIES[0]!
  );
}

export function gamesForNeed(need: MomentumNeedId): MomentumGameDef[] {
  return sortByDropdownLabel(
    MOMENTUM_GAMES.filter((g) => g.need === need),
    (g) => g.label,
  );
}

export function getMomentumGame(id: string): MomentumGameDef | undefined {
  return MOMENTUM_GAMES.find((g) => g.id === id);
}

export function playableMomentumGames(): MomentumGameDef[] {
  return MOMENTUM_GAMES.filter((g) => !g.externalTool);
}
