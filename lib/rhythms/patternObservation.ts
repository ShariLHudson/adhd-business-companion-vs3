/**
 * Pattern observation — Phase 3.
 * Observe and store only. Never modify schedules, reminders, or rhythms.
 * Full suggestion UI belongs to Phase 7.
 */

import { historyForRhythm, listRhythmHistory } from "./history";
import { listMemberRhythms } from "./store";
import type { MemberRhythm, RhythmHistoryEntry } from "./types";

export type PatternObservationKind =
  | "repeatedly_snoozed"
  | "consistently_completed_early"
  | "consistently_completed_late"
  | "repeatedly_skipped"
  | "preferred_work_time"
  | "preferred_writing_time"
  | "preferred_completion_time"
  | "recurring_work_period"
  | "repeated_similar_creation";

/** Internal only — do not surface raw scores in member UI unless already supported. */
export type PatternConfidence = "low" | "medium" | "high";

export type PatternObservation = {
  id: string;
  type: PatternObservationKind;
  /** @deprecated Prefer `type` — kept for existing callers. */
  kind: PatternObservationKind;
  sourceRecordId?: string;
  subjectId?: string;
  subjectTitle?: string;
  summary: string;
  supportingEventCount: number;
  /** @deprecated Prefer `supportingEventCount`. */
  evidenceCount: number;
  dateRange: { from: string; to: string };
  confidence: PatternConfidence;
  lastObserved: string;
  observedAt: string;
  dismissed?: boolean;
  suppressed?: boolean;
  meta?: Record<string, unknown>;
};

const STORE_KEY = "companion-pattern-observations-v1";
const MAX = 100;

function uid(): string {
  return `po-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function confidenceFromCount(count: number): PatternConfidence {
  if (count >= 6) return "high";
  if (count >= 3) return "medium";
  return "low";
}

function dateRangeFrom(entries: RhythmHistoryEntry[]): {
  from: string;
  to: string;
} {
  if (entries.length === 0) {
    const now = new Date().toISOString();
    return { from: now, to: now };
  }
  const times = entries.map((e) => e.at).sort();
  return { from: times[0]!, to: times[times.length - 1]! };
}

function readAll(): PatternObservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PatternObservation[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeObservation);
  } catch {
    return [];
  }
}

function normalizeObservation(o: PatternObservation): PatternObservation {
  const kind = o.kind ?? o.type;
  const count = o.supportingEventCount ?? o.evidenceCount ?? 0;
  const lastObserved = o.lastObserved ?? o.observedAt;
  return {
    ...o,
    type: kind,
    kind,
    supportingEventCount: count,
    evidenceCount: count,
    dateRange: o.dateRange ?? {
      from: lastObserved,
      to: lastObserved,
    },
    confidence: o.confidence ?? confidenceFromCount(count),
    lastObserved,
    observedAt: o.observedAt ?? lastObserved,
    dismissed: Boolean(o.dismissed),
    suppressed: Boolean(o.suppressed),
  };
}

function writeAll(entries: PatternObservation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function listPatternObservations(limit = 50): PatternObservation[] {
  return readAll()
    .filter((o) => !o.dismissed && !o.suppressed)
    .slice(0, limit);
}

export function listAllPatternObservations(limit = 50): PatternObservation[] {
  return readAll().slice(0, limit);
}

export function clearPatternObservations(): void {
  writeAll([]);
}

export function dismissPatternObservation(id: string): void {
  writeAll(
    readAll().map((o) =>
      o.id === id
        ? { ...o, dismissed: true, suppressed: true, lastObserved: o.lastObserved }
        : o,
    ),
  );
}

/**
 * Upsert by kind+subject — refreshes evidence, never changes schedules.
 * Does not overwrite dismissed/suppressed until evidence grows further
 * (caller may clear dismiss via clearPatternObservations in tests).
 */
export function recordPatternObservation(input: {
  kind: PatternObservationKind;
  subjectId?: string;
  subjectTitle?: string;
  summary: string;
  evidenceCount: number;
  dateRange?: { from: string; to: string };
  confidence?: PatternConfidence;
  meta?: Record<string, unknown>;
}): PatternObservation {
  const existing = readAll();
  const keyMatch = (o: PatternObservation) =>
    o.kind === input.kind &&
    (o.subjectId ?? "") === (input.subjectId ?? "");

  const prior = existing.find(keyMatch);
  const count = input.evidenceCount;
  const now = new Date().toISOString();
  const next: PatternObservation = {
    id: prior?.id ?? uid(),
    type: input.kind,
    kind: input.kind,
    sourceRecordId: input.subjectId,
    subjectId: input.subjectId,
    subjectTitle: input.subjectTitle,
    summary: input.summary,
    supportingEventCount: count,
    evidenceCount: count,
    dateRange:
      input.dateRange ??
      prior?.dateRange ?? { from: now, to: now },
    confidence: input.confidence ?? confidenceFromCount(count),
    lastObserved: now,
    observedAt: now,
    dismissed: prior?.dismissed,
    suppressed: prior?.suppressed,
    meta: input.meta,
  };

  // Insufficient data does not create a stored observation.
  if (count < 3) {
    return next;
  }

  writeAll([next, ...existing.filter((o) => !keyMatch(o))]);
  return next;
}

function scheduledHour(rhythm: MemberRhythm): number | null {
  const exact = rhythm.schedule.exactTime;
  if (exact) {
    const [h] = exact.split(":").map(Number);
    return Number.isFinite(h) ? h! : null;
  }
  return null;
}

function analyzeRhythm(
  rhythm: MemberRhythm,
  history: RhythmHistoryEntry[],
): PatternObservation[] {
  const found: PatternObservation[] = [];
  const snoozed = history.filter((h) => h.action === "snoozed");
  const skipped = history.filter((h) => h.action === "skipped");
  const completed = history.filter((h) => h.action === "completed");
  const now = new Date().toISOString();

  if (snoozed.length >= 3) {
    found.push({
      id: uid(),
      type: "repeatedly_snoozed",
      kind: "repeatedly_snoozed",
      sourceRecordId: rhythm.id,
      subjectId: rhythm.id,
      subjectTitle: rhythm.title,
      summary: `“${rhythm.title}” has been snoozed repeatedly.`,
      supportingEventCount: snoozed.length,
      evidenceCount: snoozed.length,
      dateRange: dateRangeFrom(snoozed),
      confidence: confidenceFromCount(snoozed.length),
      lastObserved: now,
      observedAt: now,
    });
  }

  if (skipped.length >= 3) {
    found.push({
      id: uid(),
      type: "repeatedly_skipped",
      kind: "repeatedly_skipped",
      sourceRecordId: rhythm.id,
      subjectId: rhythm.id,
      subjectTitle: rhythm.title,
      summary: `“${rhythm.title}” has been skipped repeatedly.`,
      supportingEventCount: skipped.length,
      evidenceCount: skipped.length,
      dateRange: dateRangeFrom(skipped),
      confidence: confidenceFromCount(skipped.length),
      lastObserved: now,
      observedAt: now,
    });
  }

  const expectedHour = scheduledHour(rhythm);
  if (expectedHour != null && completed.length >= 3) {
    const early = completed.filter(
      (h) => new Date(h.at).getHours() < expectedHour,
    );
    const late = completed.filter(
      (h) => new Date(h.at).getHours() > expectedHour,
    );
    if (early.length >= 3) {
      found.push({
        id: uid(),
        type: "consistently_completed_early",
        kind: "consistently_completed_early",
        sourceRecordId: rhythm.id,
        subjectId: rhythm.id,
        subjectTitle: rhythm.title,
        summary: `“${rhythm.title}” is often completed earlier than scheduled.`,
        supportingEventCount: early.length,
        evidenceCount: early.length,
        dateRange: dateRangeFrom(early),
        confidence: confidenceFromCount(early.length),
        lastObserved: now,
        observedAt: now,
        meta: { expectedHour },
      });
    }
    if (late.length >= 3) {
      found.push({
        id: uid(),
        type: "consistently_completed_late",
        kind: "consistently_completed_late",
        sourceRecordId: rhythm.id,
        subjectId: rhythm.id,
        subjectTitle: rhythm.title,
        summary: `“${rhythm.title}” is often completed later than scheduled.`,
        supportingEventCount: late.length,
        evidenceCount: late.length,
        dateRange: dateRangeFrom(late),
        confidence: confidenceFromCount(late.length),
        lastObserved: now,
        observedAt: now,
        meta: { expectedHour },
      });
    }
  }

  if (completed.length >= 4) {
    const hours = completed.map((h) => new Date(h.at).getHours());
    const buckets = new Array(24).fill(0) as number[];
    for (const h of hours) buckets[h]!++;
    let best = 0;
    for (let i = 1; i < 24; i++) {
      if (buckets[i]! > buckets[best]!) best = i;
    }
    if (buckets[best]! >= 3) {
      const writingish = /writ|journal|draft|blog|content/i.test(rhythm.title);
      const kind: PatternObservationKind = writingish
        ? "preferred_writing_time"
        : "preferred_completion_time";
      found.push({
        id: uid(),
        type: kind,
        kind,
        sourceRecordId: rhythm.id,
        subjectId: rhythm.id,
        subjectTitle: rhythm.title,
        summary: writingish
          ? `Preferred writing time appears around ${String(best).padStart(2, "0")}:00.`
          : `Preferred completion time appears around ${String(best).padStart(2, "0")}:00.`,
        supportingEventCount: buckets[best]!,
        evidenceCount: buckets[best]!,
        dateRange: dateRangeFrom(completed),
        confidence: confidenceFromCount(buckets[best]!),
        lastObserved: now,
        observedAt: now,
        meta: { preferredHour: best },
      });
    }
  }

  return found;
}

/**
 * Scan history and store observations only.
 * Guarantees: does not call schedule mutation APIs.
 */
export function observePatternsFromHistory(): PatternObservation[] {
  const rhythms = listMemberRhythms();
  const observed: PatternObservation[] = [];

  for (const rhythm of rhythms) {
    const history = historyForRhythm(rhythm.id, 80);
    for (const obs of analyzeRhythm(rhythm, history)) {
      if (obs.supportingEventCount < 3) continue;
      observed.push(
        recordPatternObservation({
          kind: obs.kind,
          subjectId: obs.subjectId,
          subjectTitle: obs.subjectTitle,
          summary: obs.summary,
          evidenceCount: obs.evidenceCount,
          dateRange: obs.dateRange,
          confidence: obs.confidence,
          meta: obs.meta,
        }),
      );
    }
  }

  // Global preferred-hour signal from mixed completion history (no subject).
  const recentCompleted = listRhythmHistory(80).filter(
    (h) => h.action === "completed",
  );
  if (recentCompleted.length >= 5) {
    const hours = recentCompleted.map((h) => new Date(h.at).getHours());
    const buckets = new Array(24).fill(0) as number[];
    for (const h of hours) buckets[h]!++;
    let best = 0;
    for (let i = 1; i < 24; i++) {
      if (buckets[i]! > buckets[best]!) best = i;
    }
    if (buckets[best]! >= 3) {
      observed.push(
        recordPatternObservation({
          kind: "recurring_work_period",
          summary: `Overall preferred work time appears around ${String(best).padStart(2, "0")}:00.`,
          evidenceCount: buckets[best]!,
          dateRange: dateRangeFrom(recentCompleted),
          confidence: confidenceFromCount(buckets[best]!),
          meta: { preferredHour: best, scope: "global" },
        }),
      );
    }
  }

  return observed;
}

/** Explicit Phase 3 contract for tests and callers. */
export const PATTERN_OBSERVATION_MAY_CHANGE_SCHEDULES = false as const;
