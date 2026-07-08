import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import { seasonBucket } from "@/lib/welcomeLivingRoom";

import type { SparkNoteCatalogEntry } from "./types";

/** Seasonal personality sparks — between date-based and library rotation. */
export function matchesSeasonEntry(
  entry: SparkNoteCatalogEntry,
  season: WelcomeSeason,
): boolean {
  if (!entry.seasons?.length) return false;
  return entry.seasons.includes(season);
}

export function currentSparkSeason(now = new Date()): WelcomeSeason {
  return seasonBucket(now);
}
