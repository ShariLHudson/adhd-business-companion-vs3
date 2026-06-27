/**
 * Companion Objects Design System — canonical types.
 * @see docs/companion-homestead/COMPANION_OBJECTS_DESIGN_SYSTEM.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

export const COMPANION_OBJECT_COLLECTIONS = [
  "writing",
  "coffee-comfort",
  "nature",
  "creative",
  "business",
  "reading",
  "home",
  "kinsey",
  "hospitality",
  "seasonal",
] as const;

export type CompanionObjectCollection = (typeof COMPANION_OBJECT_COLLECTIONS)[number];

export const COMPANION_OBJECT_MATERIALS = [
  "wood",
  "linen",
  "leather",
  "ceramic",
  "stone",
  "cotton",
  "glass",
  "copper",
  "brass",
  "wicker",
  "pottery",
  "wool",
  "paper",
  "iron",
] as const;

export type CompanionObjectMaterial = (typeof COMPANION_OBJECT_MATERIALS)[number];

export type CompanionObjectAnimation =
  | "none"
  | "steam"
  | "flicker"
  | "sway"
  | "bubble"
  | "curtain-drift"
  | "bird-visit"
  | "page-lift"
  | "pendulum"
  | "water-ripple";

export type CompanionObjectCatalogEntry = {
  id: string;
  name: string;
  /** Quiet emotional symbol — not decoration copy. */
  emotionalPurpose: string;
  collection: CompanionObjectCollection;
  primaryRoom: CompanionPlaceId;
  seasonalVariants: string[];
  animationCapability: boolean;
  animation?: CompanionObjectAnimation;
  material: CompanionObjectMaterial;
  /** Homestead palette tokens — see illustrationStyle.ts */
  colorPalette: readonly string[];
  illustrationNotes: string;
  accessibilityDescription: string;
  futureExpansion?: string;
  /** Optional link to feature registry in objectLibrary.ts */
  featureObjectId?: string;
  /**
   * Designer Stories — why this object really lives here.
   * For illustrators and environment artists only. Never shown to guests.
   * @see docs/companion-homestead/COMPANION_OBJECTS_DESIGN_SYSTEM.md#designer-stories
   */
  designerStory: string;
};

export type CompanionObjectCollectionMeta = {
  id: CompanionObjectCollection;
  name: string;
  tagline: string;
  primaryRooms: CompanionPlaceId[];
};
