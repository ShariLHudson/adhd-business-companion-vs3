/**
 * Room Composition Rule™ — constitutional placement law.
 */

import type { CompositionZone, EdgeZone } from "./types";

/** Never behind the Protected Conversation Zone™ */
export const CENTER_FORBIDDEN_ELEMENTS = [
  "fireplace",
  "aquarium",
  "open-window",
  "shari-portrait",
  "major-artwork",
  "interactive-object",
  "seasonal-hero",
  "hero-animation",
  "primary-signature-object",
  "kinsey-hero",
] as const;

export type CenterForbiddenElement = (typeof CENTER_FORBIDDEN_ELEMENTS)[number];

/** Movement must not compete with readable text */
export const MOTION_FORBIDDEN_ZONES: CompositionZone[] = ["center"];

/** Shari belongs in the room — never competing with conversation */
export const SHARI_ALLOWED_ZONES: EdgeZone[] = ["left", "right"];

export const EDGE_ZONE_LIFE_HINTS: Record<EdgeZone, readonly string[]> = {
  left: [
    "bookshelves",
    "plants",
    "aquarium",
    "craft-basket",
    "cabinets",
    "lamps",
    "artwork",
    "bird-feeder-outside",
    "decorative-shelves",
  ],
  right: [
    "windows",
    "curtains",
    "garden-view",
    "reading-chair",
    "crochet-basket",
    "side-tables",
    "coffee-mug",
    "kinsey-resting",
  ],
  top: [
    "windows",
    "tree-branches",
    "sky",
    "morning-light",
    "rain",
    "snow",
    "birds",
    "seasonal-decor",
    "ceiling-beams",
    "hanging-lights",
  ],
  bottom: [
    "rugs",
    "furniture",
    "blankets",
    "coffee-tables",
    "dog-bed",
    "flower-pots",
    "storage-baskets",
    "footstools",
  ],
};

export function isCenterForbidden(elementId: string): boolean {
  const normalized = elementId.trim().toLowerCase().replace(/\s+/g, "-");
  return CENTER_FORBIDDEN_ELEMENTS.some(
    (f) => normalized.includes(f) || f.includes(normalized),
  );
}

export function motionAllowedInZone(zone: CompositionZone): boolean {
  return !MOTION_FORBIDDEN_ZONES.includes(zone);
}

export function shariPlacementAllowed(zone: EdgeZone): boolean {
  return SHARI_ALLOWED_ZONES.includes(zone);
}
