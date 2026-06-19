/**
 * Momentum Boosters — engagement tools (games, wheel, guided exercises).
 * Alphabetical by title.
 */

import type { SidebarToolId } from "./companionUi";
import { sortByDropdownLabel } from "./dropdownSort";

export type MomentumBoosterId =
  | "guided-exercises"
  | "momentum-games"
  | "spin-the-wheel";

export type MomentumBoosterItem = {
  id: MomentumBoosterId;
  title: string;
  desc: string;
  emoji: string;
  tool: SidebarToolId;
};

const BOOSTER_ROWS: MomentumBoosterItem[] = [
  {
    id: "guided-exercises",
    title: "Guided Exercises",
    desc: "Structured thinking — decisions, values, goals, and breakdowns.",
    emoji: "📋",
    tool: "guided-exercises",
  },
  {
    id: "momentum-games",
    title: "Momentum Games",
    desc: "Playful mini-games organized by what your brain needs right now.",
    emoji: "🎮",
    tool: "games",
  },
  {
    id: "spin-the-wheel",
    title: "Spin The Wheel",
    desc: "Let the wheel choose when everything feels equally important.",
    emoji: "🎡",
    tool: "spin-wheel",
  },
];

export function momentumBoosterMenu(): MomentumBoosterItem[] {
  return sortByDropdownLabel(BOOSTER_ROWS, (row) => row.title);
}
