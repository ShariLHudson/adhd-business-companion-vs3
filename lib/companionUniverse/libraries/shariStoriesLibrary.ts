import type { CompanionPlaceId } from "../types";

export type ShariStory = {
  id: string;
  title: string;
  lesson: string;
  humorLevel: 0 | 1 | 2 | 3;
  presentation: "sticky-note" | "whiteboard" | "book-title" | "journal-page" | "object";
  rooms: CompanionPlaceId[];
};

/** Shari Stories™ + NGMTM — real stories as quiet discovery. */
export const SHARI_STORIES_LIBRARY: ShariStory[] = [];

export const NGMTM_STORIES_LIBRARY: ShariStory[] = [];
