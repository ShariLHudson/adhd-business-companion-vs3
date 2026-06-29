import type { AppSection } from "@/lib/companionUi";
import type { EstateSignId } from "./signpostLayout";

/**
 * Curated cloth-tag menus beneath each garden banner.
 * V2+: Arrival Intelligence may warm-glow a recommended item — never force navigation.
 */
export type GardenBannerMenuItemKind =
  | "soundscape"
  | "activity"
  | "section"
  | "my-places";

export type GardenBannerMenuItem = {
  id: string;
  label: string;
  kind: GardenBannerMenuItemKind;
  soundscapeId?: string;
  activityId?: string;
  section?: AppSection;
  myPlacesAction?: "saved" | "add" | "manage";
};

export const GARDEN_BANNER_MENUS: Record<EstateSignId, readonly GardenBannerMenuItem[]> = {
  focus: [
    {
      id: "first-step-finder",
      label: "First Step Finder",
      kind: "activity",
      activityId: "first-step-finder",
    },
    {
      id: "priority-sort",
      label: "Priority Sort",
      kind: "activity",
      activityId: "priority-sort",
    },
    {
      id: "break-it-down",
      label: "Break It Down",
      kind: "activity",
      activityId: "break-into-pieces",
    },
    {
      id: "music-room",
      label: "Music Room",
      kind: "soundscape",
      soundscapeId: "deep-focus-piano",
    },
  ],
  calming: [
    {
      id: "pause-reset",
      label: "Pause & Reset",
      kind: "soundscape",
      soundscapeId: "fireside-retreat",
    },
    {
      id: "breathing-room",
      label: "Breathing Room",
      kind: "section",
      section: "breathe",
    },
    {
      id: "quiet-moment",
      label: "Quiet Moment",
      kind: "soundscape",
      soundscapeId: "summer-storm",
    },
  ],
  energize: [
    {
      id: "nature-escape",
      label: "Nature Escape",
      kind: "soundscape",
      soundscapeId: "nature-escape",
    },
    {
      id: "sunshine-break",
      label: "Sunshine Break",
      kind: "soundscape",
      soundscapeId: "sunrise-terrace",
    },
    {
      id: "guided-recharge",
      label: "Guided Recharge",
      kind: "activity",
      activityId: "energy-check",
    },
    {
      id: "energy-reset",
      label: "Energy Reset",
      kind: "soundscape",
      soundscapeId: "movement-studio",
    },
  ],
  unwind: [
    {
      id: "bedroom-window",
      label: "Bedroom Window",
      kind: "soundscape",
      soundscapeId: "gentle-rain",
    },
    {
      id: "evening-hearth",
      label: "Evening Hearth",
      kind: "soundscape",
      soundscapeId: "fireplace-night",
    },
    {
      id: "woodland-path",
      label: "Woodland Path",
      kind: "soundscape",
      soundscapeId: "night-forest",
    },
    {
      id: "moonlit-shore",
      label: "Moonlit Shore",
      kind: "soundscape",
      soundscapeId: "ocean-night",
    },
  ],
  "my-places": [
    {
      id: "saved",
      label: "My Peaceful Places",
      kind: "my-places",
      myPlacesAction: "saved",
    },
    {
      id: "add",
      label: "Add a Place",
      kind: "my-places",
      myPlacesAction: "add",
    },
    {
      id: "manage",
      label: "Manage Places",
      kind: "my-places",
      myPlacesAction: "manage",
    },
  ],
} as const;

export function gardenBannerMenuFor(
  signId: EstateSignId,
): readonly GardenBannerMenuItem[] {
  return GARDEN_BANNER_MENUS[signId];
}
