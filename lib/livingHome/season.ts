import type { RegionCode } from "@/lib/companionLanguage";
import { resolveSparkSeason } from "@/lib/todaysLittleSpark/season";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { LivingHomeSeason } from "./types";

export function welcomeSeasonToLivingHomeSeason(
  welcome: WelcomeSeason,
): LivingHomeSeason {
  if (welcome === "holiday") return "winter";
  return welcome;
}

export function resolveLivingHomeSeason(
  region: RegionCode = "US",
  now = new Date(),
): { season: LivingHomeSeason; welcomeSeason: WelcomeSeason } {
  const welcomeSeason = resolveSparkSeason(region, now);
  return {
    season: welcomeSeasonToLivingHomeSeason(welcomeSeason),
    welcomeSeason,
  };
}
