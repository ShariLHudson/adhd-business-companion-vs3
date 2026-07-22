/**
 * Unique daily welcome + encouragement selection (no exact consecutive repeat).
 * Pinned once per calendar day so re-renders do not rotate the pool.
 */

import { todayStr } from "@/lib/companionStore";
import {
  FIRST_60_ENCOURAGEMENTS,
  FIRST_60_WELCOME_LINES,
} from "./catalogs";
import { loadFirst60Progress, writeFirst60Progress } from "./progressStore";

function pickAvoidingRecent<T extends { id: string; text: string }>(
  pool: readonly T[],
  recentIds: readonly string[],
  dayIndex: number,
): T {
  if (pool.length === 0) {
    throw new Error("First 60 welcome pool is empty");
  }
  const avoidCount = Math.max(1, Math.min(4, pool.length - 1));
  const recent = new Set(recentIds.slice(-avoidCount));
  const fresh = pool.filter((item) => !recent.has(item.id));
  const candidates = fresh.length > 0 ? fresh : [...pool];
  const index = Math.abs(dayIndex - 1) % candidates.length;
  return candidates[index]!;
}

/**
 * Resolve today's welcome presence line. Stable within a calendar day.
 */
export function resolveFirst60WelcomeLine(input: {
  dayIndex: number;
  dayKey?: string;
  persist?: boolean;
}): { id: string; text: string } {
  const dayKey = input.dayKey ?? todayStr();
  const progress = loadFirst60Progress();

  if (
    progress.lastWelcomeDay === dayKey &&
    progress.lastWelcomeId
  ) {
    const pinned = FIRST_60_WELCOME_LINES.find(
      (w) => w.id === progress.lastWelcomeId,
    );
    if (pinned) return { id: pinned.id, text: pinned.text };
  }

  const picked = pickAvoidingRecent(
    FIRST_60_WELCOME_LINES,
    progress.recentWelcomeIds,
    input.dayIndex,
  );

  if (input.persist !== false) {
    const recentWelcomeIds = [
      ...progress.recentWelcomeIds.filter((id) => id !== picked.id),
      picked.id,
    ].slice(-12);
    writeFirst60Progress({
      ...progress,
      recentWelcomeIds,
      lastWelcomeDay: dayKey,
      lastWelcomeId: picked.id,
    });
  }

  return { id: picked.id, text: picked.text };
}

export function resolveFirst60Encouragement(input: {
  dayIndex: number;
  dayKey?: string;
  persist?: boolean;
}): { id: string; text: string } {
  const dayKey = input.dayKey ?? todayStr();
  const progress = loadFirst60Progress();

  if (
    progress.lastEncouragementDay === dayKey &&
    progress.lastEncouragementId
  ) {
    const pinned = FIRST_60_ENCOURAGEMENTS.find(
      (e) => e.id === progress.lastEncouragementId,
    );
    if (pinned) return { id: pinned.id, text: pinned.text };
  }

  const picked = pickAvoidingRecent(
    FIRST_60_ENCOURAGEMENTS,
    progress.recentEncouragementIds,
    input.dayIndex + 3,
  );

  if (input.persist !== false) {
    const recentEncouragementIds = [
      ...progress.recentEncouragementIds.filter((id) => id !== picked.id),
      picked.id,
    ].slice(-12);
    writeFirst60Progress({
      ...loadFirst60Progress(),
      recentEncouragementIds,
      lastEncouragementDay: dayKey,
      lastEncouragementId: picked.id,
    });
  }

  return { id: picked.id, text: picked.text };
}
