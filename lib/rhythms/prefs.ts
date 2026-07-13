/**
 * Adaptive Rhythms — member preferences (quiet hours, frequency, delivery).
 */

import type { RhythmPrefs } from "./types";
import { DEFAULT_RHYTHM_PREFS } from "./types";

function parseHm(hm: string): { hour: number; minute: number } | null {
  const m = hm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

const PREFS_KEY = "companion-rhythm-prefs-v1";

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getRhythmPrefs(): RhythmPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_RHYTHM_PREFS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_RHYTHM_PREFS };
    const parsed = JSON.parse(raw) as Partial<RhythmPrefs>;
    const prefs: RhythmPrefs = { ...DEFAULT_RHYTHM_PREFS, ...parsed };

    // Clear expired day condition
    if (prefs.dayCondition && prefs.dayConditionSetOn) {
      if (prefs.dayConditionSetOn !== todayKey()) {
        prefs.dayCondition = null;
        prefs.dayConditionSetOn = undefined;
        saveRhythmPrefs(prefs);
      }
    }

    // Reset daily prompt counter
    if (prefs.promptedCountDate !== todayKey()) {
      prefs.promptedCountDate = todayKey();
      prefs.promptedCountToday = 0;
    }

    return prefs;
  } catch {
    return { ...DEFAULT_RHYTHM_PREFS };
  }
}

export function saveRhythmPrefs(patch: Partial<RhythmPrefs>): RhythmPrefs {
  const next = { ...getRhythmPrefs(), ...patch };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("companion-rhythm-prefs-updated"));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/**
 * Quiet hours can wrap midnight (e.g. 21:00–08:00).
 */
export function isInQuietHours(
  at: Date = new Date(),
  prefs: RhythmPrefs = getRhythmPrefs(),
): boolean {
  const start = parseHm(prefs.quietHoursStart);
  const end = parseHm(prefs.quietHoursEnd);
  if (!start || !end) return false;

  const minutes = at.getHours() * 60 + at.getMinutes();
  const startM = start.hour * 60 + start.minute;
  const endM = end.hour * 60 + end.minute;

  if (startM === endM) return false;
  if (startM < endM) {
    return minutes >= startM && minutes < endM;
  }
  // wraps midnight
  return minutes >= startM || minutes < endM;
}

export function incrementPromptedCount(): void {
  const prefs = getRhythmPrefs();
  const date = todayKey();
  const count =
    prefs.promptedCountDate === date ? (prefs.promptedCountToday ?? 0) + 1 : 1;
  saveRhythmPrefs({
    promptedCountDate: date,
    promptedCountToday: count,
  });
}
