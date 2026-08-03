/**
 * Shared scheduling normalization (Phase 1).
 *
 * Version 1 of the Spark catalog carries TWO scheduling shapes:
 *   - Legacy (live Volume 1): `monthDay` / `months` / `seasons` / `regions`.
 *   - New (Volumes 2–4 + seasonal): `displayRule` + `dateRule` / `season` /
 *     flat `month` / `day` / `months` / `region`.
 *
 * This module is the ONE place that converts either shape into a single internal
 * `NormalizedSchedule` model. Nothing here reads the clock, computes a holiday
 * date, or selects a card — it is a pure data mapping. The daily selector
 * (Phase 3) consumes `normalizeSchedule()` so it never has to know which shape a
 * record was authored in.
 *
 * Legacy records are read exactly as before: `monthDay` → exact-date,
 * `months`/`seasons` → seasonal, otherwise core. No legacy field is rewritten.
 */

import type { RegionCode } from "@/lib/companionLanguage";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type {
  SparkCalculatedDateRule,
  SparkNoteCatalogEntry,
  SparkSeason,
} from "../types";

/** Fields common to every normalized schedule kind. */
type NormalizedScheduleBase = {
  /** Higher wins when multiple entries of the same kind match a day. */
  priority: number;
  /** Days before the same spark may repeat (undefined → caller default). */
  cooldownDays?: number;
  /** Legacy region gate (RegionCode[]). */
  regions?: RegionCode[];
  /**
   * Structured region code for regional cards, e.g. "US-IA". Undefined = no
   * region restriction. The eligibility rule (match member's saved region;
   * never block search/reopen/review/admin) is applied by the selector (Phase 3).
   */
  region?: string;
};

/**
 * The one internal scheduling model. `kind` mirrors the selection tiers:
 * exact-date → calculated-date → seasonal → core.
 */
export type NormalizedSchedule = NormalizedScheduleBase &
  (
    | { kind: "core" }
    | { kind: "exact-date"; month: number; day: number }
    | { kind: "calculated-date"; dateRule: SparkCalculatedDateRule }
    | {
        kind: "seasonal";
        /** Eligible calendar months (1–12), when specified. */
        months?: number[];
        /** Legacy season personalities. */
        seasons?: WelcomeSeason[];
        /** New single-season keyword. */
        season?: SparkSeason;
      }
  );

function baseOf(entry: SparkNoteCatalogEntry): NormalizedScheduleBase {
  return {
    priority: entry.priority ?? 0,
    ...(entry.cooldownDays !== undefined
      ? { cooldownDays: entry.cooldownDays }
      : {}),
    ...(entry.regions && entry.regions.length ? { regions: entry.regions } : {}),
    ...(entry.region ? { region: entry.region } : {}),
  };
}

/** New-model records: `displayRule` is authoritative. */
function normalizeNewModel(
  entry: SparkNoteCatalogEntry,
  base: NormalizedScheduleBase,
): NormalizedSchedule {
  switch (entry.displayRule) {
    case "exact-date":
      return {
        ...base,
        kind: "exact-date",
        month: entry.month ?? entry.monthDay?.month ?? 0,
        day: entry.day ?? entry.monthDay?.day ?? 0,
      };
    case "calculated-date":
      return {
        ...base,
        kind: "calculated-date",
        // dateRule is validated upstream; fall back to a harmless rule is not
        // desirable, so keep the authored value (typed as required here).
        dateRule: entry.dateRule as SparkCalculatedDateRule,
      };
    case "seasonal":
      return {
        ...base,
        kind: "seasonal",
        ...(entry.months && entry.months.length
          ? { months: entry.months }
          : {}),
        ...(entry.seasons && entry.seasons.length
          ? { seasons: entry.seasons }
          : {}),
        ...(entry.season ? { season: entry.season } : {}),
      };
    case "core":
    default:
      return { ...base, kind: "core" };
  }
}

/** Legacy records: read `monthDay` / `months` / `seasons` exactly as before. */
function normalizeLegacyModel(
  entry: SparkNoteCatalogEntry,
  base: NormalizedScheduleBase,
): NormalizedSchedule {
  if (entry.monthDay) {
    return {
      ...base,
      kind: "exact-date",
      month: entry.monthDay.month,
      day: entry.monthDay.day,
    };
  }
  if (
    (entry.months && entry.months.length) ||
    (entry.seasons && entry.seasons.length)
  ) {
    return {
      ...base,
      kind: "seasonal",
      ...(entry.months && entry.months.length
        ? { months: entry.months }
        : {}),
      ...(entry.seasons && entry.seasons.length
        ? { seasons: entry.seasons }
        : {}),
    };
  }
  return { ...base, kind: "core" };
}

/**
 * Convert a catalog entry (either shape) into the single internal schedule.
 * New-model when `displayRule` is present; legacy fields otherwise.
 */
export function normalizeSchedule(
  entry: SparkNoteCatalogEntry,
): NormalizedSchedule {
  const base = baseOf(entry);
  return entry.displayRule
    ? normalizeNewModel(entry, base)
    : normalizeLegacyModel(entry, base);
}

/** Convenience predicates (used by the Phase 3 selector and by tests). */
export function isExactDate(
  s: NormalizedSchedule,
): s is NormalizedSchedule & { kind: "exact-date"; month: number; day: number } {
  return s.kind === "exact-date";
}

export function isCalculatedDate(
  s: NormalizedSchedule,
): s is NormalizedSchedule & {
  kind: "calculated-date";
  dateRule: SparkCalculatedDateRule;
} {
  return s.kind === "calculated-date";
}

export function isSeasonal(
  s: NormalizedSchedule,
): s is NormalizedSchedule & { kind: "seasonal" } {
  return s.kind === "seasonal";
}

export function isCore(s: NormalizedSchedule): boolean {
  return s.kind === "core";
}
