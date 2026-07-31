/**
 * Saved Work / My Work durable domain adapter (Beta Blocker 1, vertical slice 1).
 *
 * Maps SavedWorkItem <-> the generic member-record store using the item's stable
 * id as record_id and domain "saved_work". Durable success only ever comes from
 * the verified repository (write -> read-back). localStorage remains a recovery
 * cache and migration source, never a durable-success signal.
 *
 * Lifecycle mapping:
 *   - Archive is a SavedWorkItem concern (payload.status === "archived"); the
 *     durable record stays status "active" so archived items still list and can
 *     be unarchived. Consumers filter on the item's own status, as today.
 *   - Soft-delete sets the durable record status to "deleted" (excluded from the
 *     active list; never hard-deleted — Constitution 117).
 */

import type { SavedWorkItem } from "@/lib/savedWorkStore";
import {
  fetchMemberRecord,
  listMemberRecords,
  softDeleteMemberRecord,
  upsertMemberRecord,
} from "../repository";
import type { DurableRecordResult } from "../types";

export const SAVED_WORK_DOMAIN = "saved_work";
export const SAVED_WORK_SCHEMA_VERSION = 1;

/** The durable payload is the full SavedWorkItem for lossless round-trip. */
export type SavedWorkPayload = SavedWorkItem;

export function upsertSavedWorkDurable(
  item: SavedWorkItem,
): Promise<DurableRecordResult<SavedWorkPayload>> {
  return upsertMemberRecord<SavedWorkPayload>({
    domain: SAVED_WORK_DOMAIN,
    recordId: item.id,
    schemaVersion: SAVED_WORK_SCHEMA_VERSION,
    payload: item,
    // Archive lives in the item payload; the record stays active until deleted.
    status: "active",
  });
}

export async function fetchSavedWorkDurable(
  id: string,
): Promise<SavedWorkItem | null> {
  const record = await fetchMemberRecord<SavedWorkPayload>(
    SAVED_WORK_DOMAIN,
    id,
  );
  if (!record || record.status === "deleted") return null;
  return record.payload;
}

export async function listSavedWorkDurable(): Promise<SavedWorkItem[]> {
  const records = await listMemberRecords<SavedWorkPayload>(SAVED_WORK_DOMAIN);
  // listMemberRecords already excludes soft-deleted (status !== "active").
  return records.map((r) => r.payload);
}

export function softDeleteSavedWorkDurable(
  id: string,
): Promise<DurableRecordResult<SavedWorkPayload>> {
  return softDeleteMemberRecord<SavedWorkPayload>(SAVED_WORK_DOMAIN, id);
}

// --- lightweight receipt trace (diagnostics only; Blocker 2 consumes these) ---

const lastReceiptByRecordId = new Map<
  string,
  DurableRecordResult<SavedWorkPayload>
>();

/** Diagnostics only — never member-facing. Blocker 2 reads the last receipt. */
export function noteSavedWorkReceipt(
  recordId: string,
  receipt: DurableRecordResult<SavedWorkPayload>,
): void {
  lastReceiptByRecordId.set(recordId, receipt);
}

export function getLastSavedWorkReceipt(
  recordId: string,
): DurableRecordResult<SavedWorkPayload> | undefined {
  return lastReceiptByRecordId.get(recordId);
}

export function clearSavedWorkReceiptsForTests(): void {
  lastReceiptByRecordId.clear();
}
