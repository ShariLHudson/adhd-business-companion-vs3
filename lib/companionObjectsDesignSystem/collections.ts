import type { CompanionObjectCollectionMeta } from "./types";

/** Companion Object Collections — permanent groupings for the master catalog. */
export const COMPANION_OBJECT_COLLECTION_META: readonly CompanionObjectCollectionMeta[] = [
  {
    id: "writing",
    name: "Writing Collection",
    tagline: "Reflection, clarity, and the quiet work of putting words on paper",
    primaryRooms: ["window-seat", "library", "planning-table"],
  },
  {
    id: "coffee-comfort",
    name: "Coffee & Comfort Collection",
    tagline: "Welcome, warmth, and the feeling of being at home",
    primaryRooms: ["kitchen-table", "living-room", "front-porch"],
  },
  {
    id: "nature",
    name: "Nature Collection",
    tagline: "Hope, care, and the land outside the windows",
    primaryRooms: ["garden", "garden-path", "greenhouse", "back-deck"],
  },
  {
    id: "creative",
    name: "Creative Collection",
    tagline: "Making, play, and the courage to start something imperfect",
    primaryRooms: ["creative-studio", "workshop"],
  },
  {
    id: "business",
    name: "Business Collection",
    tagline: "Building something real — without corporate coldness",
    primaryRooms: ["business-office", "planning-table"],
  },
  {
    id: "reading",
    name: "Reading Collection",
    tagline: "Learning, rest, and getting lost in a good story",
    primaryRooms: ["reading-nook", "library"],
  },
  {
    id: "home",
    name: "Home Collection",
    tagline: "The ordinary beauty of a house that is truly lived in",
    primaryRooms: ["living-room", "kitchen-table", "front-porch", "fire-circle"],
  },
  {
    id: "kinsey",
    name: "Kinsey Collection",
    tagline: "Companionship — the dog who belongs in every room",
    primaryRooms: ["living-room", "kitchen-table", "back-deck", "garden-path"],
  },
  {
    id: "hospitality",
    name: "Hospitality Collection",
    tagline: "Objects that say someone prepared for your arrival",
    primaryRooms: ["living-room", "kitchen-table", "front-porch"],
  },
  {
    id: "seasonal",
    name: "Seasonal Collection",
    tagline: "Natural evolution — never decorative for decoration's sake",
    primaryRooms: ["living-room", "front-porch", "garden", "fire-circle"],
  },
];

export function collectionMetaById(
  id: CompanionObjectCollectionMeta["id"],
): CompanionObjectCollectionMeta {
  return COMPANION_OBJECT_COLLECTION_META.find((c) => c.id === id)!;
}
