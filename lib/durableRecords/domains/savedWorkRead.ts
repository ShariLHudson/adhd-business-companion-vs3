/**
 * Durable-first Saved Work retrieval (Beta Blocker 1, vertical slice 1).
 *
 * Reads authoritative durable records for the authenticated member and merges in
 * local recovery items that are not yet durable (dedup by id, durable wins), so
 * migrated work never displays twice. Behaves honestly when auth/network is
 * unavailable by falling back to the local recovery copy. Triggers the one-time
 * per-member migration on first authenticated read.
 *
 * Lives outside savedWorkStore to avoid an import cycle (store <- migration).
 */

import { getSavedWork } from "@/lib/savedWorkStore";
import type { SavedWorkItem } from "@/lib/savedWorkStore";
import { getAuthenticatedMemberId } from "../repository";
import { listSavedWorkDurable } from "./savedWork";
import {
  ensureSavedWorkMigrated,
  localSavedWorkBelongsToMember,
} from "./savedWorkMigration";

function byUpdatedDesc(a: SavedWorkItem, b: SavedWorkItem): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export async function loadSavedWorkMerged(): Promise<SavedWorkItem[]> {
  const userId = await getAuthenticatedMemberId();
  // Honest fallback: signed out / no client -> show the local recovery copy.
  if (!userId) return getSavedWork();

  try {
    await ensureSavedWorkMigrated();
  } catch {
    // Migration is best-effort on read; never block retrieval on it.
  }

  let durable: SavedWorkItem[] = [];
  try {
    durable = await listSavedWorkDurable();
  } catch {
    // Network/DB unavailable -> honest local fallback.
    return getSavedWork();
  }

  const durableIds = new Set(durable.map((i) => i.id));
  // Local recovery items not yet durable — only if this browser's local Saved
  // Work belongs to this member (shared-browser isolation).
  const localPending = localSavedWorkBelongsToMember(userId)
    ? getSavedWork().filter((i) => !durableIds.has(i.id))
    : [];

  return [...durable, ...localPending].sort(byUpdatedDesc);
}

export async function loadActiveSavedWorkMerged(): Promise<SavedWorkItem[]> {
  return (await loadSavedWorkMerged()).filter((i) => i.status !== "archived");
}

export async function loadArchivedSavedWorkMerged(): Promise<SavedWorkItem[]> {
  return (await loadSavedWorkMerged()).filter((i) => i.status === "archived");
}
