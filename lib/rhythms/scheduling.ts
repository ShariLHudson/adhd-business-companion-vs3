/**
 * Adaptive Rhythms — scheduling (flexible windows + next due).
 */

import type {
  MemberRhythm,
  QuietHoursBehavior,
  RhythmPriority,
  RhythmTimeWindow,
  Weekday,
} from "./types";
import { getRhythmPrefs, isInQuietHours } from "./prefs";

const WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Default representative open times inside flexible windows. */
export const WINDOW_DEFAULT_TIMES: Record<
  Exclude<RhythmTimeWindow, "exact" | "custom">,
  { hour: number; minute: number }
> = {
  morning: { hour: 9, minute: 0 },
  afternoon: { hour: 14, minute: 0 },
  evening: { hour: 18, minute: 30 },
};

/** Flexible window close times (local clock). Exact has no close bound. */
export const WINDOW_END_TIMES: Record<
  Exclude<RhythmTimeWindow, "exact" | "custom">,
  { hour: number; minute: number }
> = {
  morning: { hour: 12, minute: 0 },
  afternoon: { hour: 17, minute: 0 },
  evening: { hour: 21, minute: 0 },
};

export function parseHm(hm: string): { hour: number; minute: number } | null {
  const m = hm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function applyClock(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setSeconds(0, 0);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function clockForRhythm(rhythm: MemberRhythm): {
  hour: number;
  minute: number;
} {
  if (rhythm.window === "exact" && rhythm.schedule.exactTime) {
    const parsed = parseHm(rhythm.schedule.exactTime);
    if (parsed) return parsed;
  }
  if (rhythm.window === "custom" && rhythm.schedule.customWindowStart) {
    const parsed = parseHm(rhythm.schedule.customWindowStart);
    if (parsed) return parsed;
  }
  if (
    rhythm.window === "morning" ||
    rhythm.window === "afternoon" ||
    rhythm.window === "evening"
  ) {
    return WINDOW_DEFAULT_TIMES[rhythm.window];
  }
  if (rhythm.schedule.exactTime) {
    const parsed = parseHm(rhythm.schedule.exactTime);
    if (parsed) return parsed;
  }
  return WINDOW_DEFAULT_TIMES.morning;
}

/** End of the flexible delivery window for a calendar day (local). */
export function windowEndForRhythm(
  rhythm: MemberRhythm,
  day: Date = new Date(),
): Date | null {
  if (rhythm.window === "exact") return null;
  if (rhythm.window === "custom") {
    const start = clockForRhythm(rhythm);
    const end =
      parseHm(rhythm.schedule.customWindowEnd ?? "") ?? {
        hour: Math.min(23, start.hour + 3),
        minute: start.minute,
      };
    return applyClock(day, end.hour, end.minute);
  }
  if (
    rhythm.window === "morning" ||
    rhythm.window === "afternoon" ||
    rhythm.window === "evening"
  ) {
    const end = WINDOW_END_TIMES[rhythm.window];
    return applyClock(day, end.hour, end.minute);
  }
  return null;
}

/**
 * True when `now` is inside the open flexible window for this rhythm's due day.
 * Exact windows stay open until completed/skipped/snoozed.
 */
export function isWithinFlexibleWindow(
  rhythm: MemberRhythm,
  now: Date = new Date(),
): boolean {
  if (!rhythm.nextDueAt) return false;
  const due = new Date(rhythm.nextDueAt);
  if (now.getTime() < due.getTime()) return false;
  const end = windowEndForRhythm(rhythm, due);
  if (!end) return true;
  return now.getTime() <= end.getTime();
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSkipped(rhythm: MemberRhythm, d: Date): boolean {
  return (rhythm.skippedOccurrenceDates ?? []).includes(dateKey(d));
}

function shouldDeferQuietHours(
  behavior: QuietHoursBehavior,
  priority: RhythmPriority,
): boolean {
  if (behavior === "allow_critical" && priority === "critical") return false;
  if (behavior === "skip") return false;
  return true;
}

function deferPastQuietHours(candidate: Date, rhythm: MemberRhythm): Date {
  const prefs = getRhythmPrefs();
  if (!isInQuietHours(candidate, prefs)) return candidate;
  if (!shouldDeferQuietHours(rhythm.quietHoursBehavior, rhythm.priority)) {
    return candidate;
  }
  const end = parseHm(prefs.quietHoursEnd) ?? { hour: 8, minute: 0 };
  const next = applyClock(candidate, end.hour, end.minute);
  if (next.getTime() <= candidate.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function advanceByCadence(from: Date, rhythm: MemberRhythm): Date {
  const d = new Date(from);
  const interval = Math.max(1, rhythm.schedule.interval ?? 1);
  switch (rhythm.schedule.cadence) {
    case "daily":
      d.setDate(d.getDate() + interval);
      break;
    case "weekly": {
      const wanted = rhythm.schedule.weekdays?.length
        ? rhythm.schedule.weekdays
        : ([WEEKDAYS[d.getDay()]!] as Weekday[]);
      for (let i = 1; i <= 14 * interval; i++) {
        const probe = new Date(from);
        probe.setDate(probe.getDate() + i);
        const name = WEEKDAYS[probe.getDay()]!;
        if (wanted.includes(name)) {
          if (interval <= 1) return probe;
          const weeks = Math.floor(i / 7);
          if (weeks % interval === 0 || i < 7) return probe;
        }
      }
      d.setDate(d.getDate() + 7 * interval);
      break;
    }
    case "monthly":
      d.setMonth(d.getMonth() + interval);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3 * interval);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + interval);
      break;
    case "custom":
      d.setDate(d.getDate() + interval);
      break;
    default:
      d.setDate(d.getDate() + 1);
  }
  return d;
}

function skipPastQuietHours(candidate: Date, rhythm: MemberRhythm): Date {
  const prefs = getRhythmPrefs();
  if (!isInQuietHours(candidate, prefs)) return candidate;
  let next = advanceByCadence(candidate, rhythm);
  const { hour, minute } = clockForRhythm(rhythm);
  next = applyClock(next, hour, minute);
  if (isInQuietHours(next, prefs)) {
    next = deferPastQuietHours(next, {
      ...rhythm,
      quietHoursBehavior: "defer",
    });
  }
  return next;
}

/**
 * Resolve the next due timestamp for an active rhythm.
 * Respects flexible windows, skip list, and quiet-hours behavior.
 */
export function resolveNextDueAt(
  rhythm: MemberRhythm,
  from: Date = new Date(),
): string | undefined {
  if (rhythm.status !== "active") return undefined;

  const { hour, minute } = clockForRhythm(rhythm);
  let candidate = applyClock(from, hour, minute);

  if (candidate.getTime() <= from.getTime()) {
    candidate = advanceByCadence(candidate, rhythm);
    candidate = applyClock(candidate, hour, minute);
  }

  if (rhythm.schedule.cadence === "weekly" && rhythm.schedule.weekdays?.length) {
    for (let i = 0; i < 14; i++) {
      const name = WEEKDAYS[candidate.getDay()]!;
      if (
        rhythm.schedule.weekdays.includes(name) &&
        !isSkipped(rhythm, candidate)
      ) {
        break;
      }
      candidate.setDate(candidate.getDate() + 1);
      candidate = applyClock(candidate, hour, minute);
    }
  }

  let guard = 0;
  while (isSkipped(rhythm, candidate) && guard < 60) {
    candidate = advanceByCadence(candidate, rhythm);
    candidate = applyClock(candidate, hour, minute);
    guard++;
  }

  if (rhythm.quietHoursBehavior === "skip") {
    candidate = skipPastQuietHours(candidate, rhythm);
  } else {
    candidate = deferPastQuietHours(candidate, rhythm);
  }

  if (rhythm.schedule.endDate) {
    const end = new Date(`${rhythm.schedule.endDate}T23:59:59`);
    if (candidate.getTime() > end.getTime()) return undefined;
  }

  return candidate.toISOString();
}

export function rhythmsDueNow(
  rhythms: MemberRhythm[],
  now = Date.now(),
): MemberRhythm[] {
  const at = new Date(now);
  return rhythms.filter((r) => {
    if (r.status !== "active") return false;
    if (!r.nextDueAt) return false;
    if (new Date(r.nextDueAt).getTime() > now) return false;
    if (!isWithinFlexibleWindow(r, at)) return false;
    if (r.lastPromptedAt) {
      const fired = new Date(r.lastPromptedAt).getTime();
      if (now - fired < 55_000) return false;
    }
    return true;
  });
}
