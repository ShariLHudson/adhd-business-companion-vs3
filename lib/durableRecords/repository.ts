/**
 * Authoritative member-record persistence — Supabase companion_member_records.
 * Write → read-back → verify ownership + recordId + version. Only then ok:true.
 *
 * Generic foundation modeled on lib/creationDurable/repository.ts. Domains
 * (saved_work, business_profile, ...) persist through this one verified path.
 */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import {
  DURABLE_ERROR,
  MEMBER_RECORDS_TABLE,
  durableRecordFail,
  durableRecordOk,
  memberRecordToRow,
  rowToMemberRecord,
} from "./types";
import type {
  DurableRecordResult,
  MemberRecord,
  MemberRecordRow,
  MemberRecordStatus,
} from "./types";
import { markMemberRecordDurable } from "./verifiedRegistry";
import { writeLocalRecoveryCache } from "./localRecoveryCache";

export type DurableRecordBackend = {
  upsertAndReadBack<T>(
    record: MemberRecord<T>,
  ): Promise<DurableRecordResult<T>>;
  fetchById<T>(
    domain: string,
    recordId: string,
    userId: string,
  ): Promise<MemberRecord<T> | null>;
  listForDomain<T>(
    domain: string,
    userId: string,
  ): Promise<MemberRecord<T>[]>;
};

// ---------------------------------------------------------------------------
// Test seams
// ---------------------------------------------------------------------------

let testBackend: DurableRecordBackend | null = null;

export function setDurableRecordBackendForTests(
  backend: DurableRecordBackend | null,
): void {
  testBackend = backend;
}

type UserResolution =
  | { ok: true; userId: string }
  | { ok: false; result: DurableRecordResult<never> };

let testUserResolver: (() => UserResolution) | null = null;

/**
 * Inject the authenticated user for tests. Pass a userId to simulate a signed-in
 * member, or null to simulate "signed out" (AUTH_REQUIRED). Pass undefined to
 * clear the seam and fall back to the real Supabase resolver.
 */
export function setDurableRecordAuthForTests(userId: string | null): void {
  if (userId === null) {
    testUserResolver = () => ({
      ok: false,
      result: durableRecordFail(
        DURABLE_ERROR.AUTH_REQUIRED,
        "Sign in so I can keep this safe across your devices. It's still here on screen.",
        true,
      ),
    });
    return;
  }
  testUserResolver = () => ({ ok: true, userId });
}

export function clearDurableRecordAuthForTests(): void {
  testUserResolver = null;
}

// ---------------------------------------------------------------------------
// Memory backend — used by tests; STILL enforces write + read-back verify.
// ---------------------------------------------------------------------------

function memoryKey(userId: string, domain: string, recordId: string): string {
  return `${userId}::${domain}::${recordId}`;
}

export function createMemoryDurableRecordBackend(): DurableRecordBackend {
  const store = new Map<string, MemberRecord>();
  return {
    async upsertAndReadBack<T>(record: MemberRecord<T>) {
      if (!record.recordId?.trim()) {
        return durableRecordFail(
          DURABLE_ERROR.INVALID_ID,
          "That couldn't be saved — it's missing an identifier. Your work is still here.",
          false,
        );
      }
      if (!record.userId?.trim()) {
        return durableRecordFail(
          DURABLE_ERROR.AUTH_REQUIRED,
          "Sign in so I can keep this safe. It's still here on screen.",
          true,
        );
      }
      const stored: MemberRecord<T> = {
        ...record,
        updatedAt: new Date().toISOString(),
      };
      store.set(
        memoryKey(stored.userId, stored.domain, stored.recordId),
        stored as MemberRecord,
      );
      const read = store.get(
        memoryKey(stored.userId, stored.domain, stored.recordId),
      ) as MemberRecord<T> | undefined;
      if (
        !read ||
        read.recordId !== stored.recordId ||
        read.userId !== stored.userId ||
        read.version !== stored.version
      ) {
        return durableRecordFail(
          DURABLE_ERROR.VERIFY_MISMATCH,
          "Save could not be verified. Your work is still on screen — Retry.",
          true,
        );
      }
      markMemberRecordDurable(
        read.domain,
        read.recordId,
        read.version,
        read.updatedAt,
      );
      writeLocalRecoveryCache(read);
      return durableRecordOk(read);
    },
    async fetchById<T>(domain: string, recordId: string, userId: string) {
      const row = store.get(memoryKey(userId, domain, recordId));
      if (!row || row.userId !== userId) return null;
      return row as MemberRecord<T>;
    },
    async listForDomain<T>(domain: string, userId: string) {
      return [...store.values()]
        .filter(
          (r) =>
            r.userId === userId &&
            r.domain === domain &&
            r.status === "active",
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ) as MemberRecord<T>[];
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase backend
// ---------------------------------------------------------------------------

function supabaseBackend(): DurableRecordBackend {
  return {
    async upsertAndReadBack<T>(record: MemberRecord<T>) {
      const supabase = getCompanionSupabase();
      if (!supabase) {
        return durableRecordFail(
          DURABLE_ERROR.CLIENT_UNAVAILABLE,
          "I can't reach the secure save layer just now. Your work is right here — try again in a moment.",
          true,
        );
      }
      const row = memberRecordToRow(record as MemberRecord);
      const { data, error } = await supabase
        .from(MEMBER_RECORDS_TABLE)
        .upsert(row, { onConflict: "user_id,domain,record_id" })
        .select("*")
        .single();

      if (error) {
        const tableMissing =
          error.code === "42P01" ||
          /relation|does not exist|42P01|PGRST/i.test(error.message || "");
        return durableRecordFail(
          tableMissing ? DURABLE_ERROR.TABLE_MISSING : DURABLE_ERROR.DB_WRITE_FAILED,
          tableMissing
            ? "Secure storage isn't set up yet. Apply the companion_member_records schema, then Retry."
            : "That didn't finish saving securely. Your work is still on screen — Retry.",
          true,
          error.message,
        );
      }
      if (!data) {
        return durableRecordFail(
          DURABLE_ERROR.DB_EMPTY_RETURN,
          "Save didn't return a confirmation. Your work is still on screen — Retry.",
          true,
        );
      }
      const verified = rowToMemberRecord<T>(data as MemberRecordRow);
      if (
        verified.recordId !== record.recordId ||
        verified.userId !== record.userId ||
        verified.version !== record.version
      ) {
        return durableRecordFail(
          DURABLE_ERROR.VERIFY_MISMATCH,
          "Save could not be verified. Your work is still on screen — Retry.",
          true,
        );
      }
      // Second, independent read-back scoped by ownership.
      const { data: readBack, error: readErr } = await supabase
        .from(MEMBER_RECORDS_TABLE)
        .select("*")
        .eq("user_id", verified.userId)
        .eq("domain", verified.domain)
        .eq("record_id", verified.recordId)
        .maybeSingle();
      if (readErr || !readBack) {
        return durableRecordFail(
          DURABLE_ERROR.READBACK_FAILED,
          "I couldn't confirm the save yet. Your work is still on screen — Retry.",
          true,
          readErr?.message,
        );
      }
      const confirmed = rowToMemberRecord<T>(readBack as MemberRecordRow);
      if (
        confirmed.recordId !== verified.recordId ||
        confirmed.version !== verified.version
      ) {
        return durableRecordFail(
          DURABLE_ERROR.VERIFY_MISMATCH,
          "Save could not be verified. Your work is still on screen — Retry.",
          true,
        );
      }
      markMemberRecordDurable(
        confirmed.domain,
        confirmed.recordId,
        confirmed.version,
        confirmed.updatedAt,
      );
      writeLocalRecoveryCache(confirmed);
      return durableRecordOk(confirmed);
    },
    async fetchById<T>(domain: string, recordId: string, userId: string) {
      const supabase = getCompanionSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from(MEMBER_RECORDS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("domain", domain)
        .eq("record_id", recordId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToMemberRecord<T>(data as MemberRecordRow);
    },
    async listForDomain<T>(domain: string, userId: string) {
      const supabase = getCompanionSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from(MEMBER_RECORDS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("domain", domain)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (error || !data) return [];
      return (data as MemberRecordRow[]).map((r) => rowToMemberRecord<T>(r));
    },
  };
}

function activeBackend(): DurableRecordBackend {
  return testBackend ?? supabaseBackend();
}

// ---------------------------------------------------------------------------
// User resolution
// ---------------------------------------------------------------------------

async function resolveUserId(): Promise<UserResolution> {
  if (testUserResolver) return testUserResolver();
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return {
      ok: false,
      result: durableRecordFail(
        DURABLE_ERROR.CLIENT_UNAVAILABLE,
        "I can't reach the secure save layer yet. Sign in and try again — your work is still here.",
        true,
      ),
    };
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return {
      ok: false,
      result: durableRecordFail(
        DURABLE_ERROR.AUTH_REQUIRED,
        "Sign in so I can keep this safe across your devices. It's still here on screen.",
        true,
      ),
    };
  }
  return { ok: true, userId: data.user.id };
}

export async function getAuthenticatedMemberId(): Promise<string | null> {
  const resolved = await resolveUserId();
  return resolved.ok ? resolved.userId : null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function payloadIsPersistable(payload: unknown): boolean {
  if (payload === undefined || payload === null) return false;
  if (typeof payload !== "object") return false;
  try {
    JSON.stringify(payload);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// High-level mutators
// ---------------------------------------------------------------------------

export type UpsertMemberRecordInput<T> = {
  domain: string;
  recordId: string;
  payload: T;
  schemaVersion?: number;
  status?: MemberRecordStatus;
  /**
   * Optimistic-concurrency guard. When provided, the write fails with
   * VERSION_CONFLICT unless it matches the currently persisted version.
   */
  expectedVersion?: number;
};

/**
 * Upsert a member record with verified durable persistence.
 * Idempotent by (user, domain, recordId): re-submitting the same recordId
 * updates the same row — it never creates a duplicate.
 */
export async function upsertMemberRecord<T>(
  input: UpsertMemberRecordInput<T>,
): Promise<DurableRecordResult<T>> {
  const domain = input.domain?.trim();
  const recordId = input.recordId?.trim();
  if (!domain || !recordId) {
    return durableRecordFail(
      DURABLE_ERROR.INVALID_ID,
      "That couldn't be saved — it's missing an identifier. Your work is still here.",
      false,
    );
  }
  if (!payloadIsPersistable(input.payload)) {
    return durableRecordFail(
      DURABLE_ERROR.INVALID_PAYLOAD,
      "Something about this couldn't be saved safely. Your work is still on screen.",
      false,
    );
  }

  const auth = await resolveUserId();
  if (!auth.ok) return auth.result;

  const previous = await activeBackend().fetchById<T>(
    domain,
    recordId,
    auth.userId,
  );

  const currentVersion = previous?.version ?? 0;
  if (
    input.expectedVersion !== undefined &&
    input.expectedVersion !== currentVersion
  ) {
    return durableRecordFail(
      DURABLE_ERROR.VERSION_CONFLICT,
      "This was updated somewhere else. Your work is safe — I've kept it so nothing is lost.",
      true,
    );
  }

  const now = new Date().toISOString();
  const record: MemberRecord<T> = {
    userId: auth.userId,
    domain,
    recordId,
    status: input.status ?? previous?.status ?? "active",
    schemaVersion: input.schemaVersion ?? previous?.schemaVersion ?? 1,
    version: currentVersion + 1,
    payload: input.payload,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  return activeBackend().upsertAndReadBack(record);
}

export async function fetchMemberRecord<T>(
  domain: string,
  recordId: string,
): Promise<MemberRecord<T> | null> {
  const auth = await resolveUserId();
  if (!auth.ok) return null;
  return activeBackend().fetchById<T>(domain, recordId, auth.userId);
}

export async function listMemberRecords<T>(
  domain: string,
): Promise<MemberRecord<T>[]> {
  const auth = await resolveUserId();
  if (!auth.ok) return [];
  return activeBackend().listForDomain<T>(domain, auth.userId);
}

/** Soft-delete: sets status to "deleted" (never hard-deletes; Constitution 117). */
export async function softDeleteMemberRecord<T>(
  domain: string,
  recordId: string,
): Promise<DurableRecordResult<T>> {
  const auth = await resolveUserId();
  if (!auth.ok) return auth.result;
  const previous = await activeBackend().fetchById<T>(
    domain.trim(),
    recordId.trim(),
    auth.userId,
  );
  if (!previous) {
    return durableRecordFail(
      DURABLE_ERROR.NOT_FOUND,
      "I couldn't find that to remove — it may already be gone.",
      false,
    );
  }
  return upsertMemberRecord<T>({
    domain: domain.trim(),
    recordId: recordId.trim(),
    payload: previous.payload,
    schemaVersion: previous.schemaVersion,
    status: "deleted",
  });
}
