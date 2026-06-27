import type { CompanionPlaceId } from "../types";

export type HumorMoment = {
  id: string;
  label: string;
  placement: "mug" | "whiteboard" | "sticky-note" | "book-spine" | "garden" | "kitchen";
  places: CompanionPlaceId[];
};

/** Companion Humor Library — tiny moments, never interruptions. */
export const COMPANION_HUMOR_LIBRARY: HumorMoment[] = [];
