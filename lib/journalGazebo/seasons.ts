import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

export type GazeboSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "holiday"
  | "default";

export function resolveGazeboSeason(date = new Date()): GazeboSeason {
  const month = date.getMonth();
  const day = date.getDate();
  if ((month === 11 && day >= 15) || (month === 0 && day <= 5)) {
    return "holiday";
  }
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

const SEASONAL_FILES: Record<Exclude<GazeboSeason, "default">, string> = {
  spring: "gazebo-journal-spring-background.png",
  summer: "gazebo-journal-summer-background.png",
  autumn: "gazebo-journal-autumn-background.png",
  winter: "gazebo-journal-winter-background.png",
  holiday: "gazebo-journal-holiday-background.png",
};

/** Use CSS atmosphere when photo plates are not available locally. */
export function journalGazeboAtmosphereOnly(): boolean {
  if (typeof window === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_JOURNAL_GAZEBO_ATMOSPHERE === "true" ||
    process.env.NODE_ENV === "development"
  );
}

/** Primary seasonal plate; falls back to canonical gazebo journal. */
export function gazeboSeasonBackgroundCandidates(
  date = new Date(),
  options?: { atmosphereOnly?: boolean },
): readonly string[] {
  if (options?.atmosphereOnly) return [];
  const season = resolveGazeboSeason(date);
  const defaultBg = ESTATE_ROOM_BG.gazeboJournal;
  if (season === "default") return [defaultBg];
  const seasonal = estateBackgroundPath(SEASONAL_FILES[season]);
  return [seasonal, defaultBg];
}
