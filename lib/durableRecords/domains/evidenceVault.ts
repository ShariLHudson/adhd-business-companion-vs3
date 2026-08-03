/**
 * Evidence Vault durable domain adapter.
 *
 * Maps an EvidenceEntry <-> the generic member-record store using the entry's
 * stable id as record_id and domain "evidence_vault". Durable success only ever
 * comes from the verified repository (write -> read-back). localStorage remains
 * a recovery cache, never a durable-success signal (mirrors saved_work/saved_spark).
 *
 * No new table or migration: reuses companion_member_records exactly as the
 * other domains do. The payload is the full EvidenceEntry for a lossless
 * round-trip — proof entries carry many optional fields (source, emotion,
 * project/person, attachments) that a lightweight snapshot would drop.
 *
 * Delete is a soft-delete (status "deleted"; never hard-deleted — Constitution 117).
 */

import type { EvidenceEntry } from "@/lib/evidenceBankStore";
import {
  fetchMemberRecord,
  listMemberRecords,
  softDeleteMemberRecord,
  upsertMemberRecord,
} from "../repository";
import type { DurableRecordResult } from "../types";

export const EVIDENCE_VAULT_DOMAIN = "evidence_vault";
export const EVIDENCE_VAULT_SCHEMA_VERSION = 1;

/** The durable payload is the full EvidenceEntry for lossless round-trip. */
export type EvidenceVaultPayload = EvidenceEntry;

export function upsertEvidenceVaultDurable(
  entry: EvidenceEntry,
): Promise<DurableRecordResult<EvidenceVaultPayload>> {
  return upsertMemberRecord<EvidenceVaultPayload>({
    domain: EVIDENCE_VAULT_DOMAIN,
    recordId: entry.id,
    schemaVersion: EVIDENCE_VAULT_SCHEMA_VERSION,
    payload: entry,
    status: "active",
  });
}

export async function fetchEvidenceVaultDurable(
  id: string,
): Promise<EvidenceEntry | null> {
  const record = await fetchMemberRecord<EvidenceVaultPayload>(
    EVIDENCE_VAULT_DOMAIN,
    id,
  );
  if (!record || record.status === "deleted") return null;
  return record.payload;
}

export async function listEvidenceVaultDurable(): Promise<EvidenceEntry[]> {
  const records = await listMemberRecords<EvidenceVaultPayload>(
    EVIDENCE_VAULT_DOMAIN,
  );
  // listMemberRecords already excludes soft-deleted records.
  return records.map((r) => r.payload);
}

export function softDeleteEvidenceVaultDurable(
  id: string,
): Promise<DurableRecordResult<EvidenceVaultPayload>> {
  return softDeleteMemberRecord<EvidenceVaultPayload>(EVIDENCE_VAULT_DOMAIN, id);
}
