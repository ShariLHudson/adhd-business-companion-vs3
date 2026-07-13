/**
 * Rhythm Health — Phase 3 informational status only.
 * Never auto-pauses, archives, or reschedules.
 */

import { historyForRhythm } from "./history";
import { listMemberRhythms } from "./store";
import type { MemberRhythm } from "./types";

export type RhythmHealthState =
  | "healthy"
  | "needs_attention"
  | "frequently_snoozed"
  | "frequently_skipped"
  | "paused"
  | "dormant"
  | "archived";

export type RhythmHealthReport = {
  rhythmId: string;
  title: string;
  state: RhythmHealthState;
  /** Informational — never auto-applied. */
  informationalOnly: true;
  evidence: {
    snoozed: number;
    skipped: number;
    completed: number;
    prompted: number;
    daysSinceUpdate: number;
  };
};

const DAY_MS = 86_400_000;
const DORMANT_DAYS = 21;

function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
}

export function assessRhythmHealth(
  rhythm: MemberRhythm,
  now = new Date(),
): RhythmHealthReport {
  if (rhythm.status === "archived") {
    return {
      rhythmId: rhythm.id,
      title: rhythm.title,
      state: "archived",
      informationalOnly: true,
      evidence: {
        snoozed: 0,
        skipped: 0,
        completed: 0,
        prompted: 0,
        daysSinceUpdate: daysSince(rhythm.updatedAt, now),
      },
    };
  }

  if (rhythm.status === "paused") {
    return {
      rhythmId: rhythm.id,
      title: rhythm.title,
      state: "paused",
      informationalOnly: true,
      evidence: {
        snoozed: 0,
        skipped: 0,
        completed: 0,
        prompted: 0,
        daysSinceUpdate: daysSince(rhythm.updatedAt, now),
      },
    };
  }

  const history = historyForRhythm(rhythm.id, 60);
  const snoozed = history.filter((h) => h.action === "snoozed").length;
  const skipped = history.filter((h) => h.action === "skipped").length;
  const completed = history.filter((h) => h.action === "completed").length;
  const prompted = history.filter((h) => h.action === "prompted").length;
  const days = daysSince(rhythm.updatedAt, now);

  let state: RhythmHealthState = "healthy";

  if (days >= DORMANT_DAYS && completed === 0 && prompted === 0) {
    state = "dormant";
  } else if (snoozed >= 3 && snoozed >= skipped) {
    state = "frequently_snoozed";
  } else if (skipped >= 3) {
    state = "frequently_skipped";
  } else if (snoozed >= 2 || skipped >= 2) {
    state = "needs_attention";
  }

  return {
    rhythmId: rhythm.id,
    title: rhythm.title,
    state,
    informationalOnly: true,
    evidence: {
      snoozed,
      skipped,
      completed,
      prompted,
      daysSinceUpdate: days,
    },
  };
}

export function listRhythmHealthReports(now = new Date()): RhythmHealthReport[] {
  return listMemberRhythms().map((r) => assessRhythmHealth(r, now));
}

export const RHYTHM_HEALTH_MAY_CHANGE_SCHEDULES = false as const;
