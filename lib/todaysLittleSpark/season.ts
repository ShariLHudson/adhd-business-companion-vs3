import type { RegionCode } from "@/lib/companionLanguage";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import { seasonBucket } from "@/lib/welcomeLivingRoom";

const SOUTHERN_HEMISPHERE_REGIONS = new Set<RegionCode>(["AU"]);

export function isSouthernHemisphere(region: RegionCode): boolean {
  return SOUTHERN_HEMISPHERE_REGIONS.has(region);
}

/** Flip northern month for southern-hemisphere season alignment. */
export function southernHemisphereMonth(month: number): number {
  return ((month + 5) % 12) + 1;
}

export function resolveSparkSeason(
  region: RegionCode,
  now = new Date(),
): WelcomeSeason {
  if (!isSouthernHemisphere(region)) {
    return seasonBucket(now);
  }
  const flipped = new Date(now);
  flipped.setMonth(southernHemisphereMonth(now.getMonth() + 1) - 1);
  return seasonBucket(flipped);
}
