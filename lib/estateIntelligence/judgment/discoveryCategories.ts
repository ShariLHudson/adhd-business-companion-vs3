/**
 * Discovery categories — gradual Estate unfolding for room catalog answers.
 */

export type EstateDiscoveryCategory = {
  id: string;
  label: string;
  description: string;
  registryGroup: string;
};

export const ESTATE_DISCOVERY_CATEGORIES: readonly EstateDiscoveryCategory[] = [
  {
    id: "reading",
    label: "Reading spaces",
    description: "Quiet corners for books, research, and unhurried thought",
    registryGroup: "reading",
  },
  {
    id: "water",
    label: "Water spaces",
    description: "Pond, lake, and glass-wall stillness when you need to slow down",
    registryGroup: "water",
  },
  {
    id: "outdoor",
    label: "Outdoor spaces",
    description: "Gardens, decks, hammocks, and open air",
    registryGroup: "outdoor",
  },
  {
    id: "creative",
    label: "Creative spaces",
    description: "Studios and rooms for making, drafting, and bringing ideas to life",
    registryGroup: "creative",
  },
  {
    id: "thinking",
    label: "Thinking spaces",
    description: "Observatory, boardroom, and compass rooms for decisions",
    registryGroup: "think",
  },
  {
    id: "listening",
    label: "Listening spaces",
    description: "Music room, peaceful places, and gentle soundscapes",
    registryGroup: "listening",
  },
  {
    id: "treehouse",
    label: "Treehouse spaces",
    description: "The Possibility House — discovery, legacy, and wonder",
    registryGroup: "treehouse",
  },
  {
    id: "restoration",
    label: "Restoration spaces",
    description: "Places to breathe, reset, and let a crowded mind settle",
    registryGroup: "recover",
  },
];

/** Extra semantic groups not in registry semanticGroups.ts */
export const ESTATE_DISCOVERY_GROUP_PLACE_IDS: Readonly<
  Record<string, readonly string[]>
> = {
  outdoor: [
    "estate-gardens",
    "gardens",
    "garden-bench",
    "back-deck",
    "fireside-deck",
    "personal-deck",
    "porch-swing",
    "summer-terrace",
    "observatory",
    "journal",
  ],
  creative: [
    "creative-studio",
    "art-studio",
    "strategy-studio",
    "greenhouse",
    "game-room",
  ],
  listening: ["music-room", "peaceful-places", "coffee-house"],
  recover: [
    "conservatory",
    "reflection-pond",
    "clear-my-mind",
    "sunroom",
    "lakeside-hammock",
  ],
};
