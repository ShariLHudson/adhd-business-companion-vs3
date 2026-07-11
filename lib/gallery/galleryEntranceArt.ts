/**
 * Entrance wall copy — beginning zone only. No dates. No accomplishments.
 * Overlays baked mockup frames until gallery-background master plate ships.
 */

export type GalleryEntranceFrame = {
  id: string;
  side: "left" | "right";
  title?: string;
  body?: string;
  plaque?: string;
  variant: "quote" | "botanical" | "empty" | "progress-quote";
};

/** @deprecated Master plate will replace CSS wall art — kept for intelligence registry. */
export const GALLERY_ENTRANCE_FRAMES: readonly GalleryEntranceFrame[] = [
  {
    id: "story-begins",
    side: "left",
    title: "Your Story Begins Here",
    body: "Every journey begins with a single step.",
    plaque: "Welcome",
    variant: "quote",
  },
  {
    id: "journey-botanical",
    side: "right",
    plaque: "The Journey Begins",
    variant: "botanical",
  },
  {
    id: "still-being-written",
    side: "left",
    plaque: "Still Being Written",
    variant: "empty",
  },
  {
    id: "small-steps",
    side: "right",
    body: "Progress is built one small step at a time.",
    variant: "progress-quote",
  },
] as const;

/** Estate room label for evidence proof. */
export const GALLERY_EVIDENCE_ROOM_LABEL = "Evidence Vault" as const;
