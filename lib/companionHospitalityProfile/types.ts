import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type {
  Chronotype,
  CompanionHospitalityProfile,
  FavoriteDrink,
} from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";

/** Where the active hospitality profile comes from. */
export type HospitalityProfileSource = "demo" | "memory" | "manual";

/**
 * Safe hospitality facts gathered from Companion Memory systems.
 * Sensitive items are omitted here — never passed to room visuals without permission.
 */
export type UserHospitalityMemory = {
  favoriteDrink?: string;
  favoriteFlower?: string;
  favoriteColor?: string;
  favoriteSeason?: WelcomeSeason | string;
  lovesBirds?: boolean;
  lovesDogs?: boolean;
  lovesCats?: boolean;
  lovesGardening?: boolean;
  lovesBooks?: boolean;
  lovesTravel?: boolean;
  enjoysPuzzles?: boolean;
  prefersQuiet?: boolean;
  chronotype?: Chronotype;
  /** Explicit permission grants for sensitive visual use. */
  permissions?: {
    petsFromPhotos?: boolean;
    familyPhotos?: boolean;
    childDrawings?: boolean;
    memorialItems?: boolean;
    healthSymbols?: boolean;
    griefDates?: boolean;
  };
};

/** Calendar and visit context — not permanent profile traits. */
export type HospitalityTodayContext = {
  now?: Date;
  birthdayToday?: boolean;
  vacationDaysAway?: number | null;
  projectRecentlyCompleted?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
};

/** Safe fields shown in Director's Studio when Memory source is active. */
export type HospitalityMemorySummary = {
  source: HospitalityProfileSource;
  recognized: string[];
  blocked: string[];
  hasMemory: boolean;
  profile: CompanionHospitalityProfile;
  todayContext: HospitalityTodayContext;
};

export type ResolvedHospitalityProfile = {
  profile: CompanionHospitalityProfile;
  summary: HospitalityMemorySummary;
  todayContext: HospitalityTodayContext;
};

export function normalizeFavoriteDrink(
  raw: string | undefined,
): FavoriteDrink | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  const map: Record<string, FavoriteDrink> = {
    coffee: "coffee",
    tea: "tea",
    water: "tea",
    cocoa: "hot-chocolate",
    chocolate: "hot-chocolate",
    "hot chocolate": "hot-chocolate",
    "hot-chocolate": "hot-chocolate",
    cider: "cider",
    "apple cider": "cider",
  };
  return map[key];
}

export function normalizeFavoriteSeason(
  raw: string | undefined,
): WelcomeSeason | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  const seasons: WelcomeSeason[] = [
    "spring",
    "summer",
    "autumn",
    "winter",
    "holiday",
  ];
  return seasons.find((season) => season === key || key.includes(season));
}
