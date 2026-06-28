/**
 * Reflection Intelligence™ — wisdom on the wall, never copied journal text.
 * Journal holds private words; Gallery holds distilled meaning.
 */

export type GalleryReflectionSource = {
  /** Private journal object id — never displayed in Gallery. */
  journalEntryId?: string;
  privateExcerpt?: string;
};

export type GalleryReflectionWisdom = {
  heading: string;
  wallQuote: string;
  lessonKind: "courage" | "consistency" | "curiosity" | "resilience" | "growth";
};

/** Example transformation — demo / engine documentation only. */
export const GALLERY_REFLECTION_EXAMPLE: {
  journal: string;
  wall: GalleryReflectionWisdom;
} = {
  journal: "I was terrified to send the proposal.",
  wall: {
    heading: "Courage",
    wallQuote: "You chose progress over perfection.",
    lessonKind: "courage",
  },
};
