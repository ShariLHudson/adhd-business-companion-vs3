/**
 * Intent families — map member needs to registry place ids and features.
 */

import type { EstateIntentFamily } from "./types";

export type EstateIntentFamilySpec = {
  id: EstateIntentFamily;
  label: string;
  placeIds: readonly string[];
  featureIds: readonly string[];
  musicFeatureIds: readonly string[];
  breathingFeatureIds: readonly string[];
};

export const ESTATE_INTENT_FAMILIES: Readonly<
  Record<EstateIntentFamily, EstateIntentFamilySpec>
> = {
  create: {
    id: "create",
    label: "Create",
    placeIds: [
      "creative-studio",
      "art-studio",
      "strategy-studio",
      "round-table",
      "greenhouse",
    ],
    featureIds: [
      "create",
      "templates",
      "focus",
    ],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
  organize: {
    id: "organize",
    label: "Organize",
    placeIds: [
      "clear-my-mind",
      "goals-projects",
      "momentum-builder",
      "discovery-room",
    ],
    featureIds: [
      "clear-my-mind",
      "brain-parking-lot",
      "plan-my-day",
      "projects",
    ],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
  focus: {
    id: "focus",
    label: "Focus",
    placeIds: [
      "music-room",
      "peaceful-places",
      "reading-nook",
      "conservatory",
      "greenhouse",
      "coffee-house",
    ],
    featureIds: [
      "focus",
      "focus-session",
      "focus-audio",
      "breathe",
    ],
    musicFeatureIds: ["focus-audio", "focus"],
    breathingFeatureIds: ["breathe"],
  },
  think: {
    id: "think",
    label: "Think",
    placeIds: [
      "decision-compass",
      "observatory",
      "house-possibility-observatory",
      "round-table",
      "reflection-pond",
      "conservatory",
      "coffee-house",
    ],
    featureIds: ["strategies", "focus"],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
  recover: {
    id: "recover",
    label: "Recover",
    placeIds: [
      "conservatory",
      "reflection-pond",
      "journal",
      "greenhouse",
      "clear-my-mind",
      "peaceful-places",
      "lakeside-hammock",
      "seat-at-pond",
    ],
    featureIds: ["clear-my-mind", "breathe", "focus-audio"],
    musicFeatureIds: ["focus-audio"],
    breathingFeatureIds: ["breathe"],
  },
  learn: {
    id: "learn",
    label: "Learn",
    placeIds: [
      "library",
      "personal-library",
      "study-hall",
      "momentum-institute",
      "reading-nook",
      "greenhouse",
      "house-possibility-outside",
      "house-possibility-discovery-chest",
    ],
    featureIds: ["focus", "strategies"],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
  celebrate: {
    id: "celebrate",
    label: "Celebrate",
    placeIds: [
      "gallery-of-firsts",
      "evidence-vault",
      "portfolio",
      "gardens",
      "celebration-room",
      "goals-projects",
    ],
    featureIds: ["projects"],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
  explore: {
    id: "explore",
    label: "Explore",
    placeIds: [
      "coffee-house",
      "library",
      "observatory",
      "estate-gardens",
      "house-possibility-outside",
    ],
    featureIds: [],
    musicFeatureIds: [],
    breathingFeatureIds: [],
  },
};

export function placeIdsForIntentFamilies(
  families: readonly EstateIntentFamily[],
): string[] {
  const ids = new Set<string>();
  for (const family of families) {
    for (const id of ESTATE_INTENT_FAMILIES[family].placeIds) {
      ids.add(id);
    }
  }
  return [...ids];
}

export function featureIdsForIntentFamilies(
  families: readonly EstateIntentFamily[],
): string[] {
  const ids = new Set<string>();
  for (const family of families) {
    for (const id of ESTATE_INTENT_FAMILIES[family].featureIds) {
      ids.add(id);
    }
  }
  return [...ids];
}
