/**
 * Saved Spark durable domain adapter (Slice 1 — durable "Save This Spark").
 *
 * Maps a saved Spark Card to the generic member-record store using the Spark's
 * stable card id as record_id and domain "saved_spark". Durable success only
 * ever comes from the verified repository (write -> read-back). localStorage
 * remains an optimistic/offline cache, never a durable-success signal.
 *
 * No new table or migration: this reuses companion_member_records exactly as
 * the saved_work domain does. The payload is a light, device-independent
 * snapshot (id + save date + title/category) so the collection can render even
 * if the static catalog later changes; the collection still prefers live
 * catalog hydration by id.
 *
 * Unsave is a soft-delete (status "deleted"; never hard-deleted — Constitution 117).
 */

import {
  fetchMemberRecord,
  listMemberRecords,
  softDeleteMemberRecord,
  upsertMemberRecord,
} from "../repository";
import type { DurableRecordResult } from "../types";

export const SAVED_SPARK_DOMAIN = "saved_spark";
export const SAVED_SPARK_SCHEMA_VERSION = 1;

/** The durable payload — a lossless-enough snapshot to render device-independently. */
export type SavedSparkPayload = {
  /** Spark Card id — also the record_id within the domain. */
  sparkId: string;
  /** ISO timestamp the member saved this Spark. Preserved across devices. */
  savedAtIso: string;
  /** Snapshot fields (render fallback if the catalog entry is gone). */
  title: string;
  category: string;
  categoryLabel: string;
  /**
   * The member's own note for this Spark ("My notes and ideas"). Optional and
   * additive — older records simply have none. Preserved across devices.
   */
  note?: string;
};

export function upsertSavedSparkDurable(
  payload: SavedSparkPayload,
): Promise<DurableRecordResult<SavedSparkPayload>> {
  return upsertMemberRecord<SavedSparkPayload>({
    domain: SAVED_SPARK_DOMAIN,
    recordId: payload.sparkId,
    schemaVersion: SAVED_SPARK_SCHEMA_VERSION,
    payload,
    status: "active",
  });
}

export async function fetchSavedSparkDurable(
  sparkId: string,
): Promise<SavedSparkPayload | null> {
  const record = await fetchMemberRecord<SavedSparkPayload>(
    SAVED_SPARK_DOMAIN,
    sparkId,
  );
  if (!record || record.status === "deleted") return null;
  return record.payload;
}

export async function listSavedSparkDurable(): Promise<SavedSparkPayload[]> {
  const records = await listMemberRecords<SavedSparkPayload>(SAVED_SPARK_DOMAIN);
  // listMemberRecords already excludes soft-deleted records.
  return records.map((r) => r.payload);
}

export function softDeleteSavedSparkDurable(
  sparkId: string,
): Promise<DurableRecordResult<SavedSparkPayload>> {
  return softDeleteMemberRecord<SavedSparkPayload>(SAVED_SPARK_DOMAIN, sparkId);
}
