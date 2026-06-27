import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

/**
 * Companion Hospitality Profile
 *
 * Not a user profile. A hospitality profile.
 * Things Shari remembers because she's paying attention.
 * Used to prepare the home — never to rebuild it.
 */
export type FavoriteDrink = "coffee" | "tea" | "hot-chocolate" | "cider";

export type Chronotype = "morning" | "night";

export type QuoteStyle = "humorous" | "encouraging" | "reflective";

export type AestheticLean = "creative" | "minimalist";

export type CompanionHospitalityProfile = {
  /** Stable id for memory — not display name. */
  guestKey?: string;
  favoriteDrink?: FavoriteDrink;
  favoriteFlower?: string;
  favoriteColor?: string;
  favoriteSeason?: WelcomeSeason;
  lovesBirds?: boolean;
  lovesDogs?: boolean;
  lovesCats?: boolean;
  lovesHummingbirds?: boolean;
  lovesGardening?: boolean;
  lovesReading?: boolean;
  lovesTravel?: boolean;
  enjoysPuzzles?: boolean;
  prefersQuiet?: boolean;
  chronotype?: Chronotype;
  favoriteHoliday?: string;
  quoteStyle?: QuoteStyle;
  aestheticLean?: AestheticLean;
};

/** Foundation changes the profile must never trigger. */
export const FORBIDDEN_FOUNDATION_CHANGES = [
  "wall-color",
  "furniture-style",
  "architecture-theme",
  "neon-lighting",
  "sci-fi-theme",
  "industrial-theme",
  "rebuild-room-identity",
] as const;

export type ForbiddenFoundationChange =
  (typeof FORBIDDEN_FOUNDATION_CHANGES)[number];

/**
 * What a hospitality profile may influence — preparation and conversation only.
 */
export const ALLOWED_PROFILE_INFLUENCE = [
  "drink-prepared",
  "flower-color",
  "book-selection",
  "ambient-sound",
  "conversation-line",
  "artwork-swap",
  "mug-choice",
  "outside-detail",
  "journal-or-magazine",
] as const;

/** Example profiles for prototype / testing — same house, different welcome. */
export const EXAMPLE_HOSPITALITY_PROFILES: Record<
  string,
  CompanionHospitalityProfile
> = {
  "tea-gardener": {
    guestKey: "tea-gardener",
    favoriteDrink: "tea",
    favoriteFlower: "coneflowers",
    lovesGardening: true,
    lovesReading: true,
    prefersQuiet: true,
    quoteStyle: "reflective",
  },
  "coffee-traveler": {
    guestKey: "coffee-traveler",
    favoriteDrink: "coffee",
    lovesTravel: true,
    lovesDogs: true,
    chronotype: "morning",
    quoteStyle: "encouraging",
  },
  "reading-quiet": {
    guestKey: "reading-quiet",
    favoriteDrink: "tea",
    lovesReading: true,
    prefersQuiet: true,
    quoteStyle: "reflective",
    aestheticLean: "minimalist",
  },
  "creative-color": {
    guestKey: "creative-color",
    favoriteDrink: "coffee",
    favoriteColor: "coral",
    lovesGardening: true,
    quoteStyle: "encouraging",
    aestheticLean: "creative",
  },
  traveler: {
    guestKey: "traveler",
    favoriteDrink: "coffee",
    lovesTravel: true,
    chronotype: "morning",
    quoteStyle: "encouraging",
  },
  minimalist: {
    guestKey: "minimalist",
    favoriteDrink: "tea",
    prefersQuiet: true,
    aestheticLean: "minimalist",
    quoteStyle: "reflective",
  },
};

export const EMPTY_HOSPITALITY_PROFILE: CompanionHospitalityProfile = {};

export function mergeHospitalityProfile(
  base: CompanionHospitalityProfile,
  partial: Partial<CompanionHospitalityProfile>,
): CompanionHospitalityProfile {
  return { ...base, ...partial };
}
