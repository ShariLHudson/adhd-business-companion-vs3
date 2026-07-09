/**
 * Shared recognition_records store.
 * Phase 1 foundation — adapters to legacy stores come later.
 * Does not delete or migrate evidence/wins/journal yet.
 */

import { assertNeverAutoInduct, canTransitionLifecycle } from "./lifecycle";
import type {
  HallCandidateStatus,
  HallExhibit,
  RecognitionLifecycleStatus,
  RecognitionRecord,
  RecognitionRecordType,
  RecognitionTone,
} from "./types";

export const RECOGNITION_RECORDS_STORAGE_KEY =
  "companion-recognition-records-v1" as const;

export const HALL_EXHIBITS_STORAGE_KEY =
  "companion-hall-exhibits-v1" as const;

export const RECOGNITION_RECORDS_UPDATED_EVENT =
  "companion-recognition-records-updated" as const;

type RecognitionStoreSnapshot = {
  records: RecognitionRecord[];
  exhibits: HallExhibit[];
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(RECOGNITION_RECORDS_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

function readRecords(): RecognitionRecord[] {
  const list = readJson<RecognitionRecord[]>(RECOGNITION_RECORDS_STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeRecords(list: RecognitionRecord[]): void {
  writeJson(RECOGNITION_RECORDS_STORAGE_KEY, list);
}

function readExhibits(): HallExhibit[] {
  const list = readJson<HallExhibit[]>(HALL_EXHIBITS_STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeExhibits(list: HallExhibit[]): void {
  writeJson(HALL_EXHIBITS_STORAGE_KEY, list);
}

export function getRecognitionStoreSnapshot(): RecognitionStoreSnapshot {
  return { records: readRecords(), exhibits: readExhibits() };
}

export function listRecognitionRecords(): RecognitionRecord[] {
  return readRecords().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getRecognitionRecord(
  id: string,
): RecognitionRecord | null {
  return readRecords().find((r) => r.id === id) ?? null;
}

export type CreateRecognitionRecordInput = {
  recordType: RecognitionRecordType;
  title: string;
  description?: string;
  body?: string;
  date?: string;
  sourceContext?: string;
  sourceRoom?: string;
  lifecycleStatus?: RecognitionLifecycleStatus;
  tone?: RecognitionTone;
  tags?: string[];
  people?: string[];
  projectId?: string;
  attachmentIds?: string[];
  relatedRecordIds?: string[];
  hallCandidateStatus?: HallCandidateStatus;
  userId?: string;
};

export function createRecognitionRecord(
  input: CreateRecognitionRecordInput,
): RecognitionRecord {
  const now = new Date().toISOString();
  const record: RecognitionRecord = {
    id: newId("rec"),
    userId: input.userId,
    recordType: input.recordType,
    title: input.title.trim() || "Untitled moment",
    description: input.description,
    body: input.body,
    date: input.date ?? now.slice(0, 10),
    sourceContext: input.sourceContext,
    sourceRoom: input.sourceRoom,
    lifecycleStatus: input.lifecycleStatus ?? "captured",
    tone: input.tone,
    tags: input.tags ?? [],
    people: input.people ?? [],
    projectId: input.projectId,
    attachmentIds: input.attachmentIds ?? [],
    relatedRecordIds: input.relatedRecordIds ?? [],
    hallCandidateStatus: input.hallCandidateStatus ?? "none",
    createdAt: now,
    updatedAt: now,
  };
  const list = readRecords();
  list.unshift(record);
  writeRecords(list);
  return record;
}

export function updateRecognitionRecord(
  id: string,
  patch: Partial<
    Omit<RecognitionRecord, "id" | "createdAt" | "userId">
  >,
): RecognitionRecord | null {
  const list = readRecords();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;

  if (
    patch.lifecycleStatus &&
    !canTransitionLifecycle(list[idx].lifecycleStatus, patch.lifecycleStatus)
  ) {
    throw new Error(
      `Invalid lifecycle transition: ${list[idx].lifecycleStatus} → ${patch.lifecycleStatus}`,
    );
  }

  const next: RecognitionRecord = {
    ...list[idx],
    ...patch,
    id: list[idx].id,
    createdAt: list[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = next;
  writeRecords(list);
  return next;
}

export function markHallCandidate(id: string): RecognitionRecord | null {
  return updateRecognitionRecord(id, {
    hallCandidateStatus: "marked",
    lifecycleStatus: "hall_candidate",
  });
}

export function clearHallCandidate(id: string): RecognitionRecord | null {
  return updateRecognitionRecord(id, {
    hallCandidateStatus: "none",
  });
}

/**
 * Create a Hall exhibit as its own record and link the source.
 * Requires explicit member confirmation.
 */
export function inductHallExhibit(input: {
  sourceRecordId: string;
  title: string;
  story?: string;
  userConfirmedHall: boolean;
}): HallExhibit {
  assertNeverAutoInduct("hall_exhibit", input.userConfirmedHall);
  if (!input.userConfirmedHall) {
    throw new Error("Hall induction requires explicit member confirmation.");
  }

  const source = getRecognitionRecord(input.sourceRecordId);
  if (!source) {
    throw new Error(`Source recognition record not found: ${input.sourceRecordId}`);
  }

  const now = new Date().toISOString();
  const exhibit: HallExhibit = {
    id: newId("hall"),
    title: input.title.trim() || source.title,
    date: source.date,
    story: input.story ?? source.body,
    tags: [...source.tags],
    attachmentIds: [...source.attachmentIds],
    relatedEvidenceIds:
      source.recordType === "discovery" ? [source.id] : [],
    relatedJournalIds:
      source.recordType === "legacy_story" ? [source.id] : [],
    relatedCelebrationIds:
      source.recordType === "quiet_celebration" ||
      source.recordType === "festive_celebration"
        ? [source.id]
        : [],
    relatedLegacyStoryIds:
      source.recordType === "legacy_story" ? [source.id] : [],
    inductionDate: now,
    createdAt: now,
    updatedAt: now,
  };

  const exhibits = readExhibits();
  exhibits.unshift(exhibit);
  writeExhibits(exhibits);

  updateRecognitionRecord(source.id, {
    lifecycleStatus: "hall_exhibit",
    hallCandidateStatus: "marked",
    hallExhibitId: exhibit.id,
  });

  return exhibit;
}

export function listHallExhibits(): HallExhibit[] {
  return readExhibits().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function removeHallExhibit(exhibitId: string): boolean {
  const exhibits = readExhibits();
  const next = exhibits.filter((e) => e.id !== exhibitId);
  if (next.length === exhibits.length) return false;
  writeExhibits(next);

  const records = readRecords().map((r) =>
    r.hallExhibitId === exhibitId
      ? {
          ...r,
          hallExhibitId: undefined,
          lifecycleStatus:
            r.lifecycleStatus === "hall_exhibit"
              ? ("hall_candidate" as const)
              : r.lifecycleStatus,
          updatedAt: new Date().toISOString(),
        }
      : r,
  );
  writeRecords(records);
  return true;
}

export function searchRecognitionRecords(query: string): RecognitionRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listRecognitionRecords();
  return listRecognitionRecords().filter((r) => {
    const hay = [
      r.title,
      r.description,
      r.body,
      r.tone,
      r.sourceRoom,
      r.lifecycleStatus,
      r.recordType,
      ...r.tags,
      ...r.people,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function resetRecognitionStoreForTests(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(RECOGNITION_RECORDS_STORAGE_KEY);
  localStorage.removeItem(HALL_EXHIBITS_STORAGE_KEY);
}
