/**
 * Today's Adventure — Spin the Wheel as Estate reinforcement.
 */

import type { AdventureWheelEntry } from "./types";

export const TODAYS_ADVENTURE_WHEEL: readonly AdventureWheelEntry[] = [
  {
    id: "explore-new",
    label: "Visit somewhere you've never explored",
    kind: "place",
    placeId: "discovery-room",
  },
  {
    id: "read-story",
    label: "Read one Estate story",
    kind: "guide_story",
    spreadId: "butterfly-conservatory",
  },
  {
    id: "journal-sentence",
    label: "Write one sentence in your journal",
    kind: "place",
    placeId: "journal",
    section: "journal",
  },
  {
    id: "evidence-vault",
    label: "Look at your Evidence Vault",
    kind: "place",
    placeId: "evidence-vault",
    section: "portfolio",
  },
  {
    id: "lake",
    label: "Sit by the lake",
    kind: "place",
    placeId: "lakeside-verandah",
  },
  {
    id: "great-thinker",
    label: "Learn one Great Thinker idea",
    kind: "place",
    placeId: "momentum-institute",
    section: "momentum-institute",
  },
  {
    id: "breathing",
    label: "Do one breathing exercise",
    kind: "capability",
    section: "breathe",
  },
  {
    id: "butterflies",
    label: "Watch the butterflies",
    kind: "place",
    placeId: "conservatory",
    spreadId: "butterfly-conservatory",
  },
  {
    id: "gardens-walk",
    label: "Walk the gardens",
    kind: "place",
    placeId: "estate-gardens",
  },
  {
    id: "spin-again",
    label: "Spin for another adventure",
    kind: "adventure",
  },
];

export function pickAdventureEntry(seed: number): AdventureWheelEntry {
  const index = Math.abs(seed) % TODAYS_ADVENTURE_WHEEL.length;
  return TODAYS_ADVENTURE_WHEEL[index]!;
}

export function formatAdventureWheelLine(entry: AdventureWheelEntry): string {
  return `Today's Adventure: ${entry.label}`;
}
