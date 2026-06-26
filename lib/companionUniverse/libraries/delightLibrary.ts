import type { CompanionPlaceId } from "../types";

export type DelightMoment = {
  id: string;
  label: string;
  places: CompanionPlaceId[];
  frequency: "rare" | "seasonal" | "once";
  presentation: "object-moved" | "note-appeared" | "creature" | "bloom";
};

/** Delight Library™ — things users simply notice. Never achievements. */
export const DELIGHT_LIBRARY: DelightMoment[] = [
  { id: "squirrel-acorn", label: "A squirrel stole an acorn outside", places: ["garden", "garden-path"], frequency: "rare", presentation: "creature" },
  { id: "sticky-note-moved", label: "A sticky note shifted on the board", places: ["creative-studio", "workshop"], frequency: "rare", presentation: "note-appeared" },
  { id: "bookmark-moved", label: "A bookmark moved in an open book", places: ["reading-nook", "living-room"], frequency: "rare", presentation: "object-moved" },
  { id: "flower-bloomed", label: "A new bloom on the sill", places: ["living-room", "greenhouse"], frequency: "seasonal", presentation: "bloom" },
  { id: "butterfly-once", label: "A butterfly paused outside", places: ["living-room", "garden"], frequency: "seasonal", presentation: "creature" },
];
