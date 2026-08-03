/**
 * Selection tiers + eligibility (Phase 3) — pure, persistence-free.
 *
 * Maps every catalog entry (legacy OR new-model) to its selection tier and
 * decides today-eligibility. The daily selector consumes these predicates to
 * build one pool per tier in the required order:
 *   exact-date → calculated-date → seasonal → core.
 *
 * COMPATIBILITY CONTRACT (do not change without a regression test):
 * Legacy cards are read EXACTLY as the pre-Phase-3 selector read them:
 *   - `monthDay` OR `months` match  → the DATE tier (same pool the old
 *     `matchesDateEntry` produced). Legacy `months`-only cards are therefore
 *     NEVER demoted to the seasonal tier, even though `normalizeSchedule` maps
 *     them there conceptually — they keep their current date-level precedence.
 *   - `seasons` match (and not monthDay/months) → the SEASONAL tier, with NO
 *     region gate (the old `matchesSeasonalEntry` had none).
 *   - otherwise → the CORE tier (the old evergreen filter), no region gate.
 * The new structured `region` gate applies ONLY to new-model cards.
 */

import type { RegionCode } from "@/lib/companionLanguage";
import { matchesCalculatedDate } from "./calculatedDates";
import { normalizeSchedule } from "./normalizedSchedule";
import { currentSparkSeason, matchesSeasonEntry } from "../seasonalPersonality";
import type { SparkNoteCatalogEntry } from "../types";

export type SparkSelectionTier =
  | "exact-date"
  | "calculated-date"
  | "seasonal"
  | "core";

function isLegacy(entry: SparkNoteCatalogEntry): boolean {
  return !entry.displayRule;
}

/** Legacy RegionCode[] gate — unchanged from the old date-pool behavior. */
export function legacyRegionOk(
  entry: SparkNoteCatalogEntry,
  memberRegion: string,
): boolean {
  if (!entry.regions?.length) return true;
  return entry.regions.includes(memberRegion as RegionCode);
}

/**
 * New structured-region gate: a regional card is eligible only when it has no
 * region OR its region equals the member's saved region. A member with no
 * matching saved region is NOT silently shown a regional card.
 */
export function newRegionOk(
  entry: SparkNoteCatalogEntry,
  memberRegion: string,
): boolean {
  if (!entry.region) return true;
  return entry.region === memberRegion;
}

/** DATE tier: legacy monthDay/months (compat) OR new exact-date. */
export function matchesDateTier(
  entry: SparkNoteCatalogEntry,
  now: Date,
  memberRegion: string,
): boolean {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (isLegacy(entry)) {
    if (!legacyRegionOk(entry, memberRegion)) return false;
    if (entry.monthDay) {
      return entry.monthDay.month === month && entry.monthDay.day === day;
    }
    if (entry.months) return entry.months.includes(month);
    return false;
  }
  if (entry.displayRule !== "exact-date") return false;
  if (!newRegionOk(entry, memberRegion)) return false;
  const m = entry.month ?? entry.monthDay?.month;
  const d = entry.day ?? entry.monthDay?.day;
  return m === month && d === day;
}

/** CALCULATED-DATE tier: new-model computed holidays. */
export function matchesCalculatedTier(
  entry: SparkNoteCatalogEntry,
  now: Date,
  memberRegion: string,
): boolean {
  if (isLegacy(entry)) return false;
  if (entry.displayRule !== "calculated-date" || !entry.dateRule) return false;
  if (!newRegionOk(entry, memberRegion)) return false;
  return matchesCalculatedDate(entry.dateRule, now);
}

/** SEASONAL tier: legacy seasons (no region gate) OR new seasonal (region gate). */
export function matchesSeasonalTier(
  entry: SparkNoteCatalogEntry,
  now: Date,
  memberRegion: string,
): boolean {
  if (isLegacy(entry)) {
    // Preserve old matchesSeasonalEntry exactly: not monthDay/months, no region.
    if (entry.monthDay || entry.months) return false;
    return matchesSeasonEntry(entry, currentSparkSeason(now));
  }
  if (entry.displayRule !== "seasonal") return false;
  if (!newRegionOk(entry, memberRegion)) return false;
  const month = now.getMonth() + 1;
  if (entry.months?.length) return entry.months.includes(month);
  if (entry.season) return entry.season === currentSparkSeason(now);
  return false;
}

/** CORE tier eligibility (evergreen). Legacy: no region gate; new: region gate. */
export function isCoreEligible(
  entry: SparkNoteCatalogEntry,
  memberRegion: string,
): boolean {
  if (normalizeSchedule(entry).kind !== "core") return false;
  if (isLegacy(entry)) return true;
  return newRegionOk(entry, memberRegion);
}

/**
 * The single selection tier a card occupies today, or null when it is not
 * eligible for automatic daily selection (off-day date/seasonal card, or a
 * regional card without a matching member region). Convenience for tests; the
 * selector uses the per-tier predicates directly to preserve per-tier mechanics.
 */
export function selectionTierOf(
  entry: SparkNoteCatalogEntry,
  now: Date,
  memberRegion: string,
): SparkSelectionTier | null {
  if (matchesDateTier(entry, now, memberRegion)) return "exact-date";
  if (matchesCalculatedTier(entry, now, memberRegion)) return "calculated-date";
  if (matchesSeasonalTier(entry, now, memberRegion)) return "seasonal";
  if (isCoreEligible(entry, memberRegion)) return "core";
  return null;
}
