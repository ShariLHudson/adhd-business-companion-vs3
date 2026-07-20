/**
 * P0 — Immediate Discovery persistence + Sprint 3 continuity.
 * Survives refresh, tab close, and return tomorrow (localStorage).
 */

import type { EventRecord } from "@/lib/eventsIntelligence/types";
import {
  getActiveEventRecord,
  getEventRecord,
  upsertEventRecord,
} from "@/lib/eventsIntelligence/eventRecordStore";
import { recommendForEventWorkspace } from "@/lib/intelligentRecommendation";

const CONTINUITY_KEY = "companion-creation-continuity-v1";

export type CreationContinuityHint = {
  eventRecordId: string;
  lastUserText: string | null;
  lastAssistantReply: string | null;
  currentFocusTitle: string | null;
  lastCompletedHint: string | null;
  updatedAt: string;
};

export type DiscoveryPersistResult = {
  persisted: boolean;
  eventRecordId: string | null;
  record: EventRecord | null;
};

function writeContinuityHint(hint: CreationContinuityHint): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(hint);
    // sessionStorage for same-tab; localStorage for tomorrow / restart
    sessionStorage.setItem(CONTINUITY_KEY, raw);
    localStorage.setItem(CONTINUITY_KEY, raw);
  } catch {
    /* quota */
  }
}

function inferCompletedHint(record: EventRecord): string | null {
  const agenda = record.sections.find((s) => s.id === "agenda")?.content.trim();
  if (agenda) return "agenda";
  if (record.audience.trim()) return "audience";
  if (record.outcomes.trim()) return "outcomes";
  if (record.purpose.trim()) return "purpose";
  return null;
}

/**
 * Persist conversation context + continuity snapshot on every Discovery turn.
 */
export function persistDiscoveryTurn(input: {
  eventRecordId?: string | null;
  userText: string;
  assistantReply?: string | null;
}): DiscoveryPersistResult {
  const record =
    (input.eventRecordId ? getEventRecord(input.eventRecordId) : null) ??
    getActiveEventRecord();
  if (!record) {
    return { persisted: false, eventRecordId: null, record: null };
  }

  const note = input.userText.trim();
  let next = record;
  if (note) {
    const prior = record.conversationContext?.trim() ?? "";
    const nextContext =
      prior && !prior.includes(note)
        ? `${prior}\n— ${note}`.slice(0, 4000)
        : prior || note;
    next = upsertEventRecord({
      ...record,
      conversationContext: nextContext,
    });
  }

  const pack = recommendForEventWorkspace(next, { returningSession: true });
  writeContinuityHint({
    eventRecordId: next.id,
    lastUserText: note || null,
    lastAssistantReply: input.assistantReply?.trim() ?? null,
    currentFocusTitle: pack.primary.title,
    lastCompletedHint: inferCompletedHint(next),
    updatedAt: next.updatedAt,
  });

  return {
    persisted: true,
    eventRecordId: next.id,
    record: next,
  };
}

/** Snapshot continuity after any workspace-significant action (agenda, type change). */
export function persistCreationContinuitySnapshot(
  record: EventRecord,
  assistantReply?: string | null,
): void {
  const pack = recommendForEventWorkspace(record, { returningSession: true });
  writeContinuityHint({
    eventRecordId: record.id,
    lastUserText: null,
    lastAssistantReply: assistantReply?.trim() ?? null,
    currentFocusTitle: pack.primary.title,
    lastCompletedHint: inferCompletedHint(record),
    updatedAt: record.updatedAt,
  });
}

export function readCreationContinuityHint(): CreationContinuityHint | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(CONTINUITY_KEY) ??
      localStorage.getItem(CONTINUITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreationContinuityHint>;
    if (!parsed.eventRecordId) return null;
    return {
      eventRecordId: parsed.eventRecordId,
      lastUserText: parsed.lastUserText ?? null,
      lastAssistantReply: parsed.lastAssistantReply ?? null,
      currentFocusTitle: parsed.currentFocusTitle ?? null,
      lastCompletedHint: parsed.lastCompletedHint ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
