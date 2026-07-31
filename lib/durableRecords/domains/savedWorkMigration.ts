/**
 * Saved Work local -> durable migration (Beta Blocker 1, vertical slice 1).
 *
 * On the first eligible authenticated use, existing browser-only Saved Work is
 * backed up to the durable store. The migration is:
 *   - idempotent (skips items already durable; re-runs never duplicate)
 *   - retryable (transient failures leave status "partial"; local is preserved)
 *   - honest (never marks complete after a failure; never discards a bad record)
 *   - member-specific (versioned marker keyed by Supabase user id)
 *
 * Member isolation on a shared browser: the local Saved Work key
 * (companion-saved-work-v1) is global, not per-user. A browser-level claim marker
 * records which member's local data this browser holds, so a second member who
 * signs in on the same browser never absorbs the first member's local items.
 *
 * Local records are NEVER deleted here — localStorage remains recovery until the
 * slice is certified end-to-end (a later, separate cleanup step).
 */

import { getSavedWork } from "@/lib/savedWorkStore";
import type { SavedWorkItem } from "@/lib/savedWorkStore";
import { getAuthenticatedMemberId } from "../repository";
import { fetchSavedWorkDurable, upsertSavedWorkDurable } from "./savedWork";

const MARKER_PREFIX = "spark.durableMigration.saved_work.v1:";
const LOCAL_CLAIM_KEY = "spark.durableMigration.saved_work.claim.v1";

export type SavedWorkMigrationMarker = {
  version: 1;
  status: "complete" | "partial";
  migratedIds: string[];
  failedIds: string[];
  invalidIds: string[];
  updatedAt: string;
};

export type SavedWorkMigrationResult = {
  ran: boolean;
  reason?: "unauthenticated" | "already_complete" | "foreign_local";
  migrated: number;
  alreadyDurable: number;
  failed: { id: string; errorCode: string; retryable: boolean }[];
  invalid: { id: string; reason: string }[];
  complete: boolean;
  /** Calm, member-safe summary — NOT surfaced yet (Blocker 2 consumes it). */
  memberMessage: string;
};

function markerKey(userId: string): string {
  return `${MARKER_PREFIX}${userId}`;
}

function readMarker(userId: string): SavedWorkMigrationMarker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(markerKey(userId));
    return raw ? (JSON.parse(raw) as SavedWorkMigrationMarker) : null;
  } catch {
    return null;
  }
}

function writeMarker(userId: string, marker: SavedWorkMigrationMarker): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(markerKey(userId), JSON.stringify(marker));
  } catch {
    // Marker loss only causes a safe (idempotent) re-run — never data loss.
  }
}

function readLocalClaim(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_CLAIM_KEY);
  } catch {
    return null;
  }
}

function writeLocalClaim(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_CLAIM_KEY, userId);
  } catch {
    /* best-effort */
  }
}

/** True when this member may treat the browser's local Saved Work as their own. */
export function localSavedWorkBelongsToMember(userId: string): boolean {
  const claim = readLocalClaim();
  return !claim || claim === userId;
}

function validateSavedWork(
  item: SavedWorkItem,
): { ok: true } | { ok: false; reason: string } {
  if (!item || typeof item.id !== "string" || !item.id.trim()) {
    return { ok: false, reason: "missing_id" };
  }
  const hasContent =
    (typeof item.title === "string" && item.title.trim().length > 0) ||
    (typeof item.body === "string" && item.body.trim().length > 0);
  if (!hasContent) return { ok: false, reason: "empty_content" };
  return { ok: true };
}

export async function migrateSavedWorkForMember(): Promise<SavedWorkMigrationResult> {
  const userId = await getAuthenticatedMemberId();
  if (!userId) {
    return {
      ran: false,
      reason: "unauthenticated",
      migrated: 0,
      alreadyDurable: 0,
      failed: [],
      invalid: [],
      complete: false,
      memberMessage:
        "Your saved work is here on this device. Sign in and I'll keep it safe across your devices.",
    };
  }

  const existingMarker = readMarker(userId);
  if (existingMarker?.status === "complete") {
    return {
      ran: false,
      reason: "already_complete",
      migrated: 0,
      alreadyDurable: existingMarker.migratedIds.length,
      failed: [],
      invalid: existingMarker.invalidIds.map((id) => ({
        id,
        reason: "recorded_previously",
      })),
      complete: true,
      memberMessage: "Your saved work is backed up.",
    };
  }

  // Member isolation: never ingest another member's local items on a shared browser.
  const claim = readLocalClaim();
  if (claim && claim !== userId) {
    writeMarker(userId, {
      version: 1,
      status: "complete",
      migratedIds: [],
      failedIds: [],
      invalidIds: [],
      updatedAt: new Date().toISOString(),
    });
    return {
      ran: true,
      reason: "foreign_local",
      migrated: 0,
      alreadyDurable: 0,
      failed: [],
      invalid: [],
      complete: true,
      memberMessage: "Your saved work is ready.",
    };
  }

  const localItems = getSavedWork();
  const migrated: string[] = [];
  const alreadyDurable: string[] = [];
  const failed: { id: string; errorCode: string; retryable: boolean }[] = [];
  const invalid: { id: string; reason: string }[] = [];

  for (const item of localItems) {
    const valid = validateSavedWork(item);
    if (!valid.ok) {
      invalid.push({ id: item?.id ?? "(no id)", reason: valid.reason });
      continue; // never discard — local copy stays for review
    }
    const existing = await fetchSavedWorkDurable(item.id);
    if (existing) {
      alreadyDurable.push(item.id);
      continue; // idempotent — no duplicate upsert
    }
    const receipt = await upsertSavedWorkDurable(item);
    if (receipt.ok) {
      migrated.push(item.id);
    } else {
      failed.push({
        id: item.id,
        errorCode: receipt.errorCode,
        retryable: receipt.retryable,
      });
    }
  }

  // Claim the browser's local Saved Work for this member once we've engaged it.
  writeLocalClaim(userId);

  // Never mark complete after a transient failure. Invalid (structurally
  // unmigratable) records are recorded, not treated as blocking failures.
  const complete = failed.length === 0;
  const priorMigrated = existingMarker?.migratedIds ?? [];
  writeMarker(userId, {
    version: 1,
    status: complete ? "complete" : "partial",
    migratedIds: Array.from(
      new Set([...priorMigrated, ...migrated, ...alreadyDurable]),
    ),
    failedIds: failed.map((f) => f.id),
    invalidIds: invalid.map((i) => i.id),
    updatedAt: new Date().toISOString(),
  });

  const memberMessage = complete
    ? "Your saved work is backed up."
    : "Most of your saved work is backed up — I'll keep it here and try the rest. Nothing is lost.";

  return {
    ran: true,
    migrated: migrated.length,
    alreadyDurable: alreadyDurable.length,
    failed,
    invalid,
    complete,
    memberMessage,
  };
}

// Run at most once per session for a given member unless the marker is complete.
const attemptedThisSession = new Set<string>();

export async function ensureSavedWorkMigrated(): Promise<SavedWorkMigrationResult | null> {
  const userId = await getAuthenticatedMemberId();
  if (!userId) return null;
  if (readMarker(userId)?.status === "complete") return null;
  if (attemptedThisSession.has(userId)) return null;
  attemptedThisSession.add(userId);
  return migrateSavedWorkForMember();
}

export function resetSavedWorkMigrationSessionForTests(): void {
  attemptedThisSession.clear();
}
