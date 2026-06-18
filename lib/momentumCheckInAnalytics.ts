/**
 * Momentum Appointment check-in analytics — patterns only, never shame.
 * Used internally to improve recommendations (duration, timing, resistance).
 */

import type { MomentumCheckInOutcome } from "./momentumAppointment";

const CHECKINS_KEY = "companion-momentum-checkins-v1";

export type MomentumCheckInRecord = {
  blockId: string;
  title: string;
  outcome: MomentumCheckInOutcome;
  durationMin: number;
  at: string;
  whatGotAttention?: string;
};

export type MomentumPatternSummary = {
  total: number;
  finished: number;
  progress: number;
  otherImportant: number;
  notToday: number;
  avgPostponedDurationMin: number | null;
};

function readCheckins(): MomentumCheckInRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCheckins(list: MomentumCheckInRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    /* noop */
  }
}

export function recordMomentumCheckIn(
  record: Omit<MomentumCheckInRecord, "at"> & { at?: string },
): void {
  writeCheckins([
    ...readCheckins(),
    { ...record, at: record.at ?? new Date().toISOString() },
  ]);
}

/** Internal pattern view — never surface as failure metrics to users. */
export function summarizeMomentumPatterns(): MomentumPatternSummary {
  const list = readCheckins();
  const postponed = list.filter(
    (r) => r.outcome === "not-today" || r.outcome === "other-important",
  );
  return {
    total: list.length,
    finished: list.filter((r) => r.outcome === "finished").length,
    progress: list.filter((r) => r.outcome === "progress").length,
    otherImportant: list.filter((r) => r.outcome === "other-important").length,
    notToday: list.filter((r) => r.outcome === "not-today").length,
    avgPostponedDurationMin:
      postponed.length > 0
        ? Math.round(
            postponed.reduce((s, r) => s + r.durationMin, 0) / postponed.length,
          )
        : null,
  };
}
