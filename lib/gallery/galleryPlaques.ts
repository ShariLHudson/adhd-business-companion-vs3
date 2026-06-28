import type { GalleryDestinationId } from "./types";
import { GALLERY_EVIDENCE_ROOM_LABEL } from "./galleryEntranceArt";

/** Estate brass plaques — centered along the gallery floor, left to right. */
export type GalleryBrassPlaque = {
  id: GalleryDestinationId;
  label: string;
  /** Subtle hand-crafted variance — degrees, not crooked. */
  craftRotate: number;
  craftYOffset: number;
};

export const GALLERY_BOTTOM_PLAQUES: readonly GalleryBrassPlaque[] = [
  {
    id: "continue-walking",
    label: "Continue Walking",
    craftRotate: 0,
    craftYOffset: 0,
  },
  {
    id: "evidence-bank",
    label: GALLERY_EVIDENCE_ROOM_LABEL,
    craftRotate: 0,
    craftYOffset: 0,
  },
  { id: "highlights", label: "Highlights", craftRotate: 0, craftYOffset: 0 },
  { id: "journal", label: "Journal", craftRotate: 0, craftYOffset: 0 },
  { id: "portfolio", label: "Portfolio", craftRotate: 0, craftYOffset: 0 },
] as const;

export const GALLERY_INSCRIPTION =
  "A walk through your journey" as const;

export const GALLERY_FOYER_ENTER_LABEL = "Enter the hallway" as const;

/** Auto-advance from foyer if guest waits — walking begins without a button. */
export const GALLERY_FOYER_AUTO_ENTER_MS = 2000 as const;
