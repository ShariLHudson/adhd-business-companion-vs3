/**
 * Durable-first Evidence Vault retrieval.
 *
 * Reads authoritative durable records for the authenticated member and merges
 * in local recovery entries that are not yet durable (dedup by id, durable
 * wins), so migrated evidence never displays twice. Behaves honestly when
 * auth/network is unavailable by falling back to the local recovery copy.
 * Triggers the one-time per-member migration on first authenticated read.
 * Mirrors savedWorkRead.ts.
 *
 * Lives outside evidenceBankStore to avoid an import cycle (store <- migration).
 */

import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import type { EvidenceEntry } from "@/lib/evidenceBankStore";
import { getAuthenticatedMemberId } from "../repository";
import { listEvidenceVaultDurable } from "./evidenceVault";
import {
  ensureEvidenceVaultMigrated,
  localEvidenceVaultBelongsToMember,
} from "./evidenceVaultMigration";

function byCreatedDesc(a: EvidenceEntry, b: EvidenceEntry): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export async function loadEvidenceVaultMerged(): Promise<EvidenceEntry[]> {
  const userId = await getAuthenticatedMemberId();
  // Honest fallback: signed out / no client -> show the local recovery copy.
  if (!userId) return getEvidenceEntries();

  try {
    await ensureEvidenceVaultMigrated();
  } catch {
    // Migration is best-effort on read; never block retrieval on it.
  }

  let durable: EvidenceEntry[] = [];
  try {
    durable = await listEvidenceVaultDurable();
  } catch {
    // Network/DB unavailable -> honest local fallback.
    return getEvidenceEntries();
  }

  const durableIds = new Set(durable.map((e) => e.id));
  // Local recovery entries not yet durable — only if this browser's local
  // Evidence Vault belongs to this member (shared-browser isolation).
  const localPending = localEvidenceVaultBelongsToMember(userId)
    ? getEvidenceEntries().filter((e) => !durableIds.has(e.id))
    : [];

  return [...durable, ...localPending].sort(byCreatedDesc);
}
