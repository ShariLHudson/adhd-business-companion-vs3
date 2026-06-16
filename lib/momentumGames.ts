/** Momentum Games — playful ADHD-friendly cognitive resets. */

export type MomentumGameCategory =
  | "attention"
  | "memory"
  | "pattern"
  | "speed"
  | "filter"
  | "word";

export type MomentumGameDef = {
  id: string;
  label: string;
  emoji: string;
  category: MomentumGameCategory;
  blurb: string;
};

export const MOMENTUM_GAME_CATEGORIES: Record<
  MomentumGameCategory,
  { label: string; color: string }
> = {
  attention: { label: "Attention", color: "#3b82f6" },
  memory: { label: "Memory", color: "#a855f7" },
  pattern: { label: "Pattern", color: "#22c55e" },
  speed: { label: "Speed", color: "#f59e0b" },
  filter: { label: "Focus Filter", color: "#ef4444" },
  word: { label: "Words", color: "#0d9488" },
};

export const MOMENTUM_GAMES: MomentumGameDef[] = [
  {
    id: "pattern-match",
    label: "Pattern Match",
    emoji: "🧩",
    category: "attention",
    blurb: "Tap the tile that's different.",
  },
  {
    id: "spot-difference",
    label: "Spot The Difference",
    emoji: "👀",
    category: "attention",
    blurb: "Find the one tile that doesn't belong.",
  },
  {
    id: "memory-match",
    label: "Memory Match",
    emoji: "🃏",
    category: "memory",
    blurb: "Flip and pair matching symbols.",
  },
  {
    id: "sequence-builder",
    label: "Sequence Builder",
    emoji: "🔢",
    category: "pattern",
    blurb: "Tap items in the right order.",
  },
  {
    id: "quick-sort",
    label: "Quick Sort",
    emoji: "📦",
    category: "pattern",
    blurb: "Sort items into the right buckets fast.",
  },
  {
    id: "focus-sprint",
    label: "Focus Sprint",
    emoji: "⏱️",
    category: "speed",
    blurb: "Mini timed tap challenge.",
  },
  {
    id: "treasure-hunt",
    label: "Treasure Hunt",
    emoji: "🗺️",
    category: "attention",
    blurb: "Find hidden gems in the grid.",
  },
  {
    id: "reaction-tap",
    label: "Reaction Tap",
    emoji: "⚡",
    category: "speed",
    blurb: "Tap the target color as fast as you can.",
  },
  {
    id: "color-quest",
    label: "Color Quest",
    emoji: "🎨",
    category: "filter",
    blurb: "Follow the color rule — ignore the rest.",
  },
  {
    id: "number-hunt",
    label: "Number Hunt",
    emoji: "🔍",
    category: "attention",
    blurb: "Find numbers 1 through 9 in order.",
  },
  {
    id: "word-search-mini",
    label: "Word Search Mini",
    emoji: "📝",
    category: "word",
    blurb: "Find three short words in the grid.",
  },
  {
    id: "shape-match",
    label: "Shape Match",
    emoji: "⬡",
    category: "pattern",
    blurb: "Match the target shape.",
  },
  {
    id: "category-blitz",
    label: "Category Blitz",
    emoji: "🧠",
    category: "word",
    blurb: "Name items in a category before time runs out.",
  },
  {
    id: "this-or-that",
    label: "This Or That",
    emoji: "🔀",
    category: "speed",
    blurb: "Fast fun choices — no wrong answers.",
  },
  {
    id: "find-duplicate",
    label: "Find The Duplicate",
    emoji: "👯",
    category: "memory",
    blurb: "Spot the two matching symbols.",
  },
];

export function getMomentumGame(id: string): MomentumGameDef | undefined {
  return MOMENTUM_GAMES.find((g) => g.id === id);
}
