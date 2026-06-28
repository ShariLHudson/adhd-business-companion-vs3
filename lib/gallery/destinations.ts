import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { GalleryDestinationId } from "./types";

export type GalleryDestinationAction =
  | { kind: "resume-walk" }
  | { kind: "open-section"; section: AppSection; nav: SidebarNavId }
  | { kind: "placeholder"; message: string };

export const GALLERY_DESTINATION_ACTIONS: Record<
  GalleryDestinationId,
  GalleryDestinationAction
> = {
  "continue-walking": { kind: "resume-walk" },
  journal: {
    kind: "open-section",
    section: "my-journey",
    nav: "growth",
  },
  portfolio: {
    kind: "open-section",
    section: "saved-work",
    nav: "other",
  },
  "evidence-bank": {
    kind: "open-section",
    section: "evidence-bank",
    nav: "evidence-bank",
  },
  highlights: {
    kind: "open-section",
    section: "confidence-vault",
    nav: "confidence-vault",
  },
};
