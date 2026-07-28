/**
 * Unique daily welcome + encouragement selection (no exact consecutive repeat).
 * Pinned once per local calendar day so re-renders, remounts, route changes, and
 * sign-out/sign-in do not rotate the pool. The two selections are resolved and
 * pinned TOGETHER via a single atomic write (MA-05 Phase 1) so interleaved
 * resolution can never clobber one dimension's pin.
 */

import { todayStr } from "@/lib/companionStore";
import {
  FIRST_60_ENCOURAGEMENTS,
  FIRST_60_WELCOME_LINES,
} from "./catalogs";
import { loadFirst60Progress, pinDailySelections } from "./progressStore";

type DailyLine = { id: string; text: string };

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
 * Coordinated resolution of BOTH daily selections for a local day. Preserves any
 * already-valid same-day pin for a dimension (so a partially-pinned blob is
 * repaired, not overwritten) and otherwise picks with the existing recent-ID
 * avoidance. Encouragement keeps its historical +3 salt offset. Pure — reads
 * progress but does not write; the caller decides whether to pin.
 */
function resolveDailyPair(
  dayKey: string,
  dayIndex: number,
): { welcome: DailyLine; encouragement: DailyLine } {
  const progress = loadFirst60Progress();

  const pinnedWelcome =
    progress.lastWelcomeDay === dayKey && progress.lastWelcomeId
      ? FIRST_60_WELCOME_LINES.find((w) => w.id === progress.lastWelcomeId)
      : undefined;
  const pinnedEncouragement =
    progress.lastEncouragementDay === dayKey && progress.lastEncouragementId
      ? FIRST_60_ENCOURAGEMENTS.find((e) => e.id === progress.lastEncouragementId)
      : undefined;

  const welcome =
    pinnedWelcome ??
    pickAvoidingRecent(
      FIRST_60_WELCOME_LINES,
      progress.recentWelcomeIds,
      dayIndex,
    );
  const encouragement =
    pinnedEncouragement ??
    pickAvoidingRecent(
      FIRST_60_ENCOURAGEMENTS,
      progress.recentEncouragementIds,
      dayIndex + 3,
    );

  return {
    welcome: { id: welcome.id, text: welcome.text },
    encouragement: { id: encouragement.id, text: encouragement.text },
  };
}

/**
 * Resolve today's welcome presence line. Stable within a local calendar day:
 * a valid same-day pin is authoritative (returned as-is, never reselected, never
 * subjected to recent-ID avoidance, never overwritten). The first live
 * resolution of a new day pins BOTH selections atomically.
 */
export function resolveFirst60WelcomeLine(input: {
  dayIndex: number;
  dayKey?: string;
  persist?: boolean;
}): DailyLine {
  const dayKey = input.dayKey ?? todayStr();
  const progress = loadFirst60Progress();

  if (progress.lastWelcomeDay === dayKey && progress.lastWelcomeId) {
    const pinned = FIRST_60_WELCOME_LINES.find(
      (w) => w.id === progress.lastWelcomeId,
    );
    if (pinned) return { id: pinned.id, text: pinned.text };
  }

  const pair = resolveDailyPair(dayKey, input.dayIndex);
  if (input.persist !== false) {
    pinDailySelections({
      dayKey,
      welcomeId: pair.welcome.id,
      encouragementId: pair.encouragement.id,
    });
  }
  return pair.welcome;
}

/**
 * Resolve today's encouragement line. Same per-day authority as the welcome
 * line; resolving either dimension on a fresh day pins BOTH atomically.
 */
export function resolveFirst60Encouragement(input: {
  dayIndex: number;
  dayKey?: string;
  persist?: boolean;
}): DailyLine {
  const dayKey = input.dayKey ?? todayStr();
  const progress = loadFirst60Progress();

  if (progress.lastEncouragementDay === dayKey && progress.lastEncouragementId) {
    const pinned = FIRST_60_ENCOURAGEMENTS.find(
      (e) => e.id === progress.lastEncouragementId,
    );
    if (pinned) return { id: pinned.id, text: pinned.text };
  }

  const pair = resolveDailyPair(dayKey, input.dayIndex);
  if (input.persist !== false) {
    pinDailySelections({
      dayKey,
      welcomeId: pair.welcome.id,
      encouragementId: pair.encouragement.id,
    });
  }
  return pair.encouragement;
}
