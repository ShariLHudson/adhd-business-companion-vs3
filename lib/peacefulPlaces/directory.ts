import type { SoundscapeMoodId } from "@/lib/soundscapes/types";

export const PEACEFUL_PLACES_TITLE = "Peaceful Places" as const;

export const PEACEFUL_PLACES_SUBTITLE =
  "Take a gentle pause. Choose the place that feels right." as const;

export type PeacefulPlacesCategoryId = SoundscapeMoodId | "my-places";

export type PeacefulPlacesCategory = {
  id: SoundscapeMoodId;
  emoji: string;
  label: string;
  description: string;
};

export const PEACEFUL_PLACES_CATEGORIES: readonly PeacefulPlacesCategory[] = [
  {
    id: "calming",
    emoji: "🌿",
    label: "Slow Down",
    description: "Places that help your mind become calm and present.",
  },
  {
    id: "focus",
    emoji: "🎯",
    label: "Focus",
    description: "Places that gently support concentration and deep thinking.",
  },
  {
    id: "energize",
    emoji: "⚡",
    label: "Recharge",
    description: "Places that naturally restore motivation and energy.",
  },
  {
    id: "unwind",
    emoji: "🌙",
    label: "Unwind",
    description: "Places for quiet evenings and gentle reflection.",
  },
] as const;

export const MY_PLACES_CATEGORY = {
  id: "my-places" as const,
  emoji: "❤️",
  label: "My Places",
  description: "Your personal collection of favorite peaceful places.",
};
