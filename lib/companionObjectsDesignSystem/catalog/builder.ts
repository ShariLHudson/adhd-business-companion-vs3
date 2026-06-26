import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import {
  DEFAULT_ILLUSTRATION_NOTES,
  DEFAULT_OBJECT_PALETTE,
} from "../illustrationStyle";
import type {
  CompanionObjectAnimation,
  CompanionObjectCatalogEntry,
  CompanionObjectCollection,
  CompanionObjectMaterial,
} from "../types";
import { resolveDesignerStory } from "./designerStories";

export type ObjectSeed = {
  id: string;
  name: string;
  emotionalPurpose: string;
  collection: CompanionObjectCollection;
  primaryRoom: CompanionPlaceId;
  material: CompanionObjectMaterial;
  seasonalVariants?: string[];
  animationCapability?: boolean;
  animation?: CompanionObjectAnimation;
  colorPalette?: readonly string[];
  illustrationNotes?: string;
  accessibilityDescription?: string;
  futureExpansion?: string;
  featureObjectId?: string;
  /** Overrides catalog story when this object has a specific backstory. */
  designerStory?: string;
};

export function objectFromSeed(seed: ObjectSeed): CompanionObjectCatalogEntry {
  return {
    seasonalVariants: [],
    animationCapability: false,
    colorPalette: DEFAULT_OBJECT_PALETTE,
    illustrationNotes: DEFAULT_ILLUSTRATION_NOTES,
    accessibilityDescription: `Illustrated ${seed.name.toLowerCase()} — homestead object in warm watercolor-woodcut style`,
    ...seed,
    designerStory: seed.designerStory ?? resolveDesignerStory(seed),
  };
}

export function objectsFromSeeds(seeds: ObjectSeed[]): CompanionObjectCatalogEntry[] {
  return seeds.map(objectFromSeed);
}
