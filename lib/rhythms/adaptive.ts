/**
 * Adaptive layer — day conditions, snooze protection (Phase 3).
 * Pattern suggestions belong to Phase 7 — observe only here.
 */

import { historyForRhythm } from "./history";
import { saveRhythmPrefs, getRhythmPrefs } from "./prefs";
import type { DayCondition } from "./types";

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SNOOZE_TRACK_KEY = "companion-rhythm-snooze-track-v1";

/** Nonjudgmental choices after repeated snoozes — never auto-applied. */
export const SNOOZE_PROTECTION_CHOICES = [
  { id: "change_time", label: "Change time" },
  { id: "make_smaller", label: "Make it smaller" },
  { id: "pause", label: "Pause" },
  { id: "leave_as_is", label: "Leave it as is" },
] as const;

export type SnoozeProtectionChoiceId =
  (typeof SNOOZE_PROTECTION_CHOICES)[number]["id"];

export const SNOOZE_PROTECTION_MESSAGE =
  "This timing may not be working. Would you like to change the time, make it smaller, pause it, or leave it as it is?";

/** Phase 3 — snooze protection never mutates schedules by itself. */
export const SNOOZE_PROTECTION_MAY_CHANGE_SCHEDULES = false as const;

type SnoozeTrackEntry = {
  count: number;
  lastAt: string;
  /** When set, suppress until count reaches countWhenDismissed + 3. */
  countWhenDismissed?: number;
  dismissedChoice?: SnoozeProtectionChoiceId | string;
  dismissedAt?: string;
};

type SnoozeTrack = Record<string, SnoozeTrackEntry>;

function readSnoozeTrack(): SnoozeTrack {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SNOOZE_TRACK_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SnoozeTrack;
  } catch {
    return {};
  }
}

function writeSnoozeTrack(track: SnoozeTrack): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SNOOZE_TRACK_KEY, JSON.stringify(track));
  } catch {
    /* ignore */
  }
}

export function setDayCondition(condition: DayCondition): void {
  saveRhythmPrefs({
    dayCondition: condition,
    dayConditionSetOn: todayKey(),
  });
}

export function clearDayCondition(): void {
  saveRhythmPrefs({
    dayCondition: null,
    dayConditionSetOn: undefined,
  });
}

export function noteSnoozePattern(rhythmId: string): void {
  const track = readSnoozeTrack();
  const prev = track[rhythmId];
  track[rhythmId] = {
    count: (prev?.count ?? 0) + 1,
    lastAt: new Date().toISOString(),
    countWhenDismissed: prev?.countWhenDismissed,
    dismissedChoice: prev?.dismissedChoice,
    dismissedAt: prev?.dismissedAt,
  };
  writeSnoozeTrack(track);
}

/** After 3+ snoozes, offer attention signal (no shame, no auto-change). */
export function shouldOfferSnoozeProtection(rhythmId: string): boolean {
  const entry = readSnoozeTrack()[rhythmId];
  if (!entry) return false;
  if (entry.count < 3) return false;
  if (
    entry.countWhenDismissed != null &&
    entry.count < entry.countWhenDismissed + 3
  ) {
    return false;
  }
  return true;
}

/**
 * Member dismissed or answered the snooze-protection prompt.
 * Does not change schedules — only prevents immediate re-prompting.
 */
export function dismissSnoozeProtection(
  rhythmId: string,
  choice?: SnoozeProtectionChoiceId | string,
): void {
  const track = readSnoozeTrack();
  const prev = track[rhythmId];
  if (!prev) return;
  track[rhythmId] = {
    ...prev,
    countWhenDismissed: prev.count,
    dismissedChoice: choice,
    dismissedAt: new Date().toISOString(),
  };
  writeSnoozeTrack(track);
}

export function resetSnoozeTrack(rhythmId: string): void {
  const track = readSnoozeTrack();
  delete track[rhythmId];
  writeSnoozeTrack(track);
}

export type AdaptiveHint = {
  kind: "snooze_protection" | "day_condition";
  message: string;
  rhythmId?: string;
  choices?: readonly { id: string; label: string }[];
};

/**
 * Collect non-intrusive adaptive hints for UI/conversation.
 * Phase 3: day condition awareness + snooze protection only.
 * Full pattern suggestions belong to Phase 7.
 */
export function collectAdaptiveHints(): AdaptiveHint[] {
  const hints: AdaptiveHint[] = [];
  const prefs = getRhythmPrefs();
  if (prefs.dayCondition && prefs.dayCondition !== "normal") {
    hints.push({
      kind: "day_condition",
      message:
        "Today's support is adjusted for how you're feeling. Important reminders stay; optional ones wait.",
    });
  }

  const track = readSnoozeTrack();
  for (const [rhythmId, entry] of Object.entries(track)) {
    if (!shouldOfferSnoozeProtection(rhythmId)) continue;
    if (entry.count < 3) continue;
    hints.push({
      kind: "snooze_protection",
      rhythmId,
      message: SNOOZE_PROTECTION_MESSAGE,
      choices: SNOOZE_PROTECTION_CHOICES,
    });
  }

  return hints;
}

/** Preferred hour from completion history (ethical observation for suggestions). */
export function inferPreferredHour(rhythmId: string): number | null {
  const entries = historyForRhythm(rhythmId, 40).filter(
    (e) => e.action === "completed" || e.action === "prompted",
  );
  if (entries.length < 3) return null;
  const hours = entries.map((e) => new Date(e.at).getHours());
  const buckets = new Array(24).fill(0) as number[];
  for (const h of hours) buckets[h]!++;
  let best = 0;
  for (let i = 1; i < 24; i++) {
    if (buckets[i]! > buckets[best]!) best = i;
  }
  return best;
}
