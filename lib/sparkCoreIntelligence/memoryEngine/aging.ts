/**
 * Memory aging — archive stale records; short-term expires naturally.
 */

import { listAllForUser, upsertRecord } from "./store";
import type { MemoryConfidence, MemoryRecord, MemoryType } from "./types";

const DEFAULT_TTL_MS: Partial<Record<MemoryType, number>> = {
  short_term_conversation: 24 * 60 * 60 * 1000,
  communication_preference: 180 * 24 * 60 * 60 * 1000,
  project: 90 * 24 * 60 * 60 * 1000,
  goal: 365 * 24 * 60 * 60 * 1000,
  estate: 180 * 24 * 60 * 60 * 1000,
};

const STALE_WITHOUT_ACCESS_MS = 120 * 24 * 60 * 60 * 1000;

export function applyMemoryAging(userId: string, now = Date.now()): {
  archived: string[];
  expired: string[];
} {
  const archived: string[] = [];
  const expired: string[] = [];
  const records = listAllForUser(userId, true);

  for (const record of records) {
    if (record.archivedAt || record.confidence === "archived") continue;

    const ttl = DEFAULT_TTL_MS[record.memoryType];
    const created = new Date(record.createdAt).getTime();
    const lastAccess = record.lastAccessedAt
      ? new Date(record.lastAccessedAt).getTime()
      : new Date(record.updatedAt).getTime();

    if (ttl && now - created > ttl) {
      if (record.memoryType === "short_term_conversation") {
        expired.push(record.id);
        upsertRecord({
          ...record,
          archivedAt: new Date(now).toISOString(),
          confidence: "archived",
          updatedAt: new Date(now).toISOString(),
        });
        continue;
      }
    }

    if (now - lastAccess > STALE_WITHOUT_ACCESS_MS && record.confidence === "observed") {
      archived.push(record.id);
      upsertRecord({
        ...record,
        confidence: "needs_confirmation",
        updatedAt: new Date(now).toISOString(),
      });
    }
  }

  return { archived, expired };
}

export function isStale(record: MemoryRecord, now = Date.now()): boolean {
  if (record.confidence === "needs_confirmation" || record.confidence === "archived") {
    return true;
  }
  const lastAccess = record.lastAccessedAt
    ? new Date(record.lastAccessedAt).getTime()
    : new Date(record.updatedAt).getTime();
  return now - lastAccess > STALE_WITHOUT_ACCESS_MS && record.confidence === "observed";
}

export function confidenceAfterConfirm(
  current: MemoryConfidence,
): MemoryConfidence {
  if (current === "observed" || current === "needs_confirmation") return "confirmed";
  if (current === "confirmed") return "high_confidence";
  return current;
}
