/**
 * In-memory member + founder stores (v1 scaffold).
 * Production maps to companion persistence layer.
 */

import type { MemoryRecord, MemoryType } from "./types";

const memberStore = new Map<string, MemoryRecord[]>();
const founderStore = new Map<string, MemoryRecord[]>();

function bucket(userId: string, memoryType: MemoryType): MemoryRecord[] {
  const store = memoryType === "founder" ? founderStore : memberStore;
  if (!store.has(userId)) store.set(userId, []);
  return store.get(userId)!;
}

export function listRecords(
  userId: string,
  options?: { memoryType?: MemoryType; includeArchived?: boolean },
): MemoryRecord[] {
  const records = bucket(userId, options?.memoryType ?? "long_term_business");
  const all =
    options?.memoryType != null
      ? records
      : [...(memberStore.get(userId) ?? [])];
  if (options?.includeArchived) return [...all];
  return all.filter((r) => !r.archivedAt && r.confidence !== "archived");
}

export function listAllForUser(
  userId: string,
  includeArchived = false,
): MemoryRecord[] {
  const records = memberStore.get(userId) ?? [];
  if (includeArchived) return [...records];
  return records.filter((r) => !r.archivedAt && r.confidence !== "archived");
}

export function findByKey(
  userId: string,
  key: string,
  memoryType?: MemoryType,
): MemoryRecord | undefined {
  const records = memoryType
    ? bucket(userId, memoryType)
    : listAllForUser(userId);
  return records
    .filter((r) => !r.archivedAt && r.confidence !== "archived")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .find((r) => r.key === key);
}

export function getRecord(
  userId: string,
  recordId: string,
): MemoryRecord | undefined {
  return listAllForUser(userId, true).find((r) => r.id === recordId);
}

export function upsertRecord(record: MemoryRecord): MemoryRecord {
  const store = record.memoryType === "founder" ? founderStore : memberStore;
  const list = store.get(record.userId) ?? [];
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  store.set(record.userId, list);
  return record;
}

export function removeRecord(userId: string, recordId: string): boolean {
  const list = memberStore.get(userId);
  if (!list) return false;
  const next = list.filter((r) => r.id !== recordId);
  if (next.length === list.length) return false;
  memberStore.set(userId, next);
  return true;
}

export function touchRecord(userId: string, recordId: string): void {
  const record = getRecord(userId, recordId);
  if (!record) return;
  record.lastAccessedAt = new Date().toISOString();
  upsertRecord(record);
}

/** Test helper */
export function clearMemoryStore(): void {
  memberStore.clear();
  founderStore.clear();
}
