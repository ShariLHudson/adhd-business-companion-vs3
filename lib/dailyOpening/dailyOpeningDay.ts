/**
 * Calendar-day gate for the Global Daily Companion Experience.
 */

import { todayStr } from "@/lib/companionStore";
import {
  DAILY_OPENING_DAY_KEY_STORAGE,
  DAILY_OPENING_ABSENCE_THRESHOLD_DAYS,
} from "./types";

export function readDailyOpeningPresentedDay(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DAILY_OPENING_DAY_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function markDailyOpeningPresented(day = todayStr()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_OPENING_DAY_KEY_STORAGE, day);
  } catch {
    /* noop */
  }
}

export function clearDailyOpeningPresentedForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DAILY_OPENING_DAY_KEY_STORAGE);
  } catch {
    /* noop */
  }
}

/** True when the Global Daily opening has not yet run for today's calendar day. */
export function shouldOfferFirstPlatformOpeningOfDay(
  day = todayStr(),
): boolean {
  return readDailyOpeningPresentedDay() !== day;
}

export function isAbsenceReturn(
  returnIntervalDays: number | null | undefined,
): boolean {
  return (
    returnIntervalDays != null &&
    returnIntervalDays >= DAILY_OPENING_ABSENCE_THRESHOLD_DAYS
  );
}
