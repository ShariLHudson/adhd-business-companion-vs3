/**
 * Calculated-date rule support (Phase 2).
 *
 * Resolves each `SparkCalculatedDateRule` to the calendar month/day it lands on
 * for a given year, and tests whether a given local `now` falls on it. Pure
 * calendar math — no clock reads of its own, no selection, no region logic.
 *
 * Fixed-weekday US observances are computed exactly. Winter Solstice and Spring
 * Equinox use CONVENTIONAL fixed Spark observance dates (Dec 21 / Mar 20) — a
 * deliberate simplification for this version, not a guarantee of the exact
 * astronomical instant in every timezone and year.
 *
 * TODO(astronomical-local-time): if it later proves valuable, replace the fixed
 * solstice/equinox dates with an astronomical calculation (e.g. Meeus) resolved
 * to the member's local timezone. Out of scope for this version.
 */

import type { SparkCalculatedDateRule } from "../types";

export type MonthDay = { month: number; day: number };

/** Day-of-month of the nth given weekday (0=Sun … 6=Sat) in a month (1–12). */
function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): number {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const firstOccurrence = 1 + ((weekday - firstDow + 7) % 7);
  return firstOccurrence + (n - 1) * 7;
}

/** Day-of-month of the last given weekday in a month (1–12). */
function lastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDow = new Date(year, month - 1, daysInMonth).getDay();
  return daysInMonth - ((lastDow - weekday + 7) % 7);
}

/** Conventional Spark observance date for the winter solstice (see file note). */
export const WINTER_SOLSTICE_OBSERVANCE: MonthDay = { month: 12, day: 21 };
/** Conventional Spark observance date for the spring equinox (see file note). */
export const SPRING_EQUINOX_OBSERVANCE: MonthDay = { month: 3, day: 20 };

/** Resolve a calculated-date rule to its month/day for a specific year. */
export function resolveCalculatedDate(
  rule: SparkCalculatedDateRule,
  year: number,
): MonthDay {
  switch (rule) {
    case "thanksgiving-us": // 4th Thursday of November
      return { month: 11, day: nthWeekdayOfMonth(year, 11, 4, 4) };
    case "memorial-day-us": // last Monday of May
      return { month: 5, day: lastWeekdayOfMonth(year, 5, 1) };
    case "mothers-day-us": // 2nd Sunday of May
      return { month: 5, day: nthWeekdayOfMonth(year, 5, 0, 2) };
    case "mlk-day-us": // 3rd Monday of January
      return { month: 1, day: nthWeekdayOfMonth(year, 1, 1, 3) };
    case "winter-solstice": // conventional observance (see file note)
      return WINTER_SOLSTICE_OBSERVANCE;
    case "spring-equinox": // conventional observance (see file note)
      return SPRING_EQUINOX_OBSERVANCE;
    default: {
      // Exhaustiveness guard: a new rule must be handled explicitly.
      const _never: never = rule;
      return _never;
    }
  }
}

/**
 * True when local `now` is the calculated date for `rule` (that year). Compared
 * in the member's local calendar so the card is available the whole local day.
 */
export function matchesCalculatedDate(
  rule: SparkCalculatedDateRule,
  now: Date,
): boolean {
  const { month, day } = resolveCalculatedDate(rule, now.getFullYear());
  return now.getMonth() + 1 === month && now.getDate() === day;
}
