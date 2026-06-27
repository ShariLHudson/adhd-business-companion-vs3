import type { CompanionPlaceId } from "../types";

export type SignatureObject = {
  id: string;
  name: string;
  placeId: CompanionPlaceId;
  description: string;
};

/** Signature Object Library — one iconic anchor per place. */
export const SIGNATURE_OBJECT_LIBRARY: SignatureObject[] = [
  { id: "spark-mug", name: "Spark mug", placeId: "living-room", description: "The familiar mug — warmth waiting" },
  { id: "window-blanket", name: "Folded blanket", placeId: "window-seat", description: "Soft weight for heavy afternoons" },
  { id: "tea-set", name: "Tea set", placeId: "kitchen-table", description: "Steam and pause" },
  { id: "leather-planner", name: "Leather planner", placeId: "planning-table", description: "Today made manageable" },
  { id: "vision-board", name: "Vision board", placeId: "business-office", description: "Where the work points" },
  { id: "sketchbook", name: "Sketchbook", placeId: "creative-studio", description: "Ideas without judgment" },
  { id: "workbench", name: "Workbench", placeId: "workshop", description: "Hands-on progress" },
  { id: "timer-candle", name: "Focus candle", placeId: "focus-studio", description: "Attention protected" },
  { id: "reading-lamp", name: "Reading lamp", placeId: "reading-nook", description: "Pool of quiet light" },
  { id: "wildflowers", name: "Wildflowers", placeId: "garden", description: "What's blooming now" },
  { id: "garden-basket", name: "Garden basket", placeId: "garden-path", description: "Unhurried gathering" },
  { id: "seedling-tray", name: "Seedling tray", placeId: "greenhouse", description: "Slow growth honored" },
  { id: "rocking-chair", name: "Rocking chair", placeId: "back-deck", description: "Let the day end" },
  { id: "fire-pit", name: "Fire pit", placeId: "fire-circle", description: "Warmth for wins" },
  { id: "book-ladder", name: "Book ladder", placeId: "library", description: "Knowledge within reach" },
  { id: "welcome-mat", name: "Welcome mat", placeId: "front-porch", description: "You made it home" },
  { id: "project-board", name: "Project board", placeId: "barn", description: "Big work has a barn" },
  { id: "bench-at-edge", name: "Outlook bench", placeId: "outlook-point", description: "See further" },
  { id: "travel-guide", name: "Travel guide", placeId: "adventure-room", description: "Adventure approaching" },
  { id: "blueprint-scroll", name: "Blueprint scroll", placeId: "future-wings", description: "What comes next" },
];

export function signatureObjectForPlace(placeId: CompanionPlaceId): SignatureObject | undefined {
  return SIGNATURE_OBJECT_LIBRARY.find((object) => object.placeId === placeId);
}
