/**
 * Adaptive Rhythms — pause / resume / skip / snooze / complete.
 */

import { appendRhythmHistory } from "./history";
import { noteSnoozePattern } from "./adaptive";
import { resolveNextDueAt } from "./scheduling";
import { getMemberRhythm, updateMemberRhythm } from "./store";
import type { MemberRhythm } from "./types";

function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function pauseRhythm(id: string): MemberRhythm | null {
  const next = updateMemberRhythm(id, {
    status: "paused",
    nextDueAt: undefined,
  });
  if (next) appendRhythmHistory({ rhythmId: id, action: "paused" });
  return next;
}

export function resumeRhythm(id: string): MemberRhythm | null {
  const current = getMemberRhythm(id);
  if (!current) return null;
  const withActive = { ...current, status: "active" as const };
  const nextDueAt = resolveNextDueAt(withActive, new Date());
  const next = updateMemberRhythm(id, { status: "active", nextDueAt });
  if (next) appendRhythmHistory({ rhythmId: id, action: "resumed" });
  return next;
}

/** Skip today's occurrence — advance to next due without shame. */
export function skipRhythmOccurrence(
  id: string,
  occurrenceDate = new Date(),
): MemberRhythm | null {
  const current = getMemberRhythm(id);
  if (!current) return null;
  const key = dateKey(occurrenceDate);
  const skipped = Array.from(
    new Set([...(current.skippedOccurrenceDates ?? []), key]),
  ).slice(-60);
  const patched = {
    ...current,
    skippedOccurrenceDates: skipped,
  };
  const nextDueAt = resolveNextDueAt(patched, occurrenceDate);
  const next = updateMemberRhythm(id, {
    skippedOccurrenceDates: skipped,
    nextDueAt,
  });
  if (next) appendRhythmHistory({ rhythmId: id, action: "skipped" });
  return next;
}

export function snoozeRhythm(
  id: string,
  minutes: number,
  from = new Date(),
): MemberRhythm | null {
  const until = new Date(from.getTime() + minutes * 60_000);
  const next = updateMemberRhythm(id, {
    nextDueAt: until.toISOString(),
  });
  if (next) {
    noteSnoozePattern(id);
    appendRhythmHistory({
      rhythmId: id,
      action: "snoozed",
      note: `${minutes}m`,
    });
  }
  return next;
}

/** Mark this occurrence complete and schedule the next. */
export function completeRhythmOccurrence(
  id: string,
  from = new Date(),
): MemberRhythm | null {
  const current = getMemberRhythm(id);
  if (!current) return null;
  const after = new Date(from.getTime() + 60_000);
  const nextDueAt = resolveNextDueAt(
    { ...current, lastPromptedAt: from.toISOString() },
    after,
  );
  const next = updateMemberRhythm(id, {
    lastPromptedAt: from.toISOString(),
    nextDueAt,
  });
  if (next) appendRhythmHistory({ rhythmId: id, action: "completed" });
  return next;
}

export function markRhythmPrompted(id: string): MemberRhythm | null {
  const next = updateMemberRhythm(id, {
    lastPromptedAt: new Date().toISOString(),
  });
  if (next) appendRhythmHistory({ rhythmId: id, action: "prompted" });
  return next;
}
