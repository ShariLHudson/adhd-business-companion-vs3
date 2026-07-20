/**
 * Authoritative Creation persistence — Supabase table companion_creation_workspaces.
 * Write → read-back → verify workspaceId + version. Only then durable:true.
 */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import {
  authoritativeToRow,
  rowToAuthoritative,
} from "./mapping";
import type {
  AuthoritativeCreationRecord,
  CreationDurableRow,
  DurableMutationResult,
} from "./types";
import {
  CREATION_DURABLE_TABLE,
  durableFail,
  durableOk,
} from "./types";
import { writeOptionalCreationCache } from "./optionalCache";
import { markWorkspaceAuthoritativelyDurable } from "./verifiedRegistry";

export type CreationDurableBackend = {
  upsertAndReadBack(
    record: AuthoritativeCreationRecord
  ): Promise<DurableMutationResult<AuthoritativeCreationRecord>>;
  fetchById(
    workspaceId: string,
    userId: string
  ): Promise<AuthoritativeCreationRecord | null>;
  listForUser(userId: string): Promise<AuthoritativeCreationRecord[]>;
};

/** In-memory backend for unit tests — still requires write + read-back verify. */
export function createMemoryCreationDurableBackend(): CreationDurableBackend {
  const map = new Map<string, AuthoritativeCreationRecord>();
  return {
    async upsertAndReadBack(record) {
      if (!record.workspaceId?.trim()) {
        return durableFail("INVALID_ID", "Workspace ID is required.", false);
      }
      if (!record.userId?.trim()) {
        return durableFail("AUTH_REQUIRED", "Sign in to save your work.", true);
      }
      const stored: AuthoritativeCreationRecord = {
        ...record,
        updatedAt: new Date().toISOString(),
      };
      map.set(stored.workspaceId, stored);
      const read = map.get(stored.workspaceId);
      if (
        !read ||
        read.workspaceId !== stored.workspaceId ||
        read.version !== stored.version
      ) {
        return durableFail(
          "VERIFY_MISMATCH",
          "Save could not be verified. Your work is still on screen — Retry.",
          true
        );
      }
      markWorkspaceAuthoritativelyDurable(
        read.workspaceId,
        read.version,
        read.updatedAt
      );
      writeOptionalCreationCache(read);
      return durableOk(read);
    },
    async fetchById(workspaceId, userId) {
      const row = map.get(workspaceId);
      if (!row || row.userId !== userId) return null;
      return row;
    },
    async listForUser(userId) {
      return [...map.values()]
        .filter((r) => r.userId === userId && r.status === "active")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    },
  };
}

let testBackend: CreationDurableBackend | null = null;

export function setCreationDurableBackendForTests(
  backend: CreationDurableBackend | null
): void {
  testBackend = backend;
}

async function resolveUserId(): Promise<
  | { ok: true; userId: string }
  | { ok: false; result: DurableMutationResult<never> }
> {
  if (testBackend) {
    return { ok: true, userId: "test-user" };
  }
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return {
      ok: false,
      result: durableFail(
        "CLIENT_UNAVAILABLE",
        "I can't reach the secure save layer yet. Sign in and try again.",
        true
      ),
    };
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return {
      ok: false,
      result: durableFail(
        "AUTH_REQUIRED",
        "Sign in so I can keep this work safe across refresh.",
        true
      ),
    };
  }
  return { ok: true, userId: data.user.id };
}

function supabaseBackend(): CreationDurableBackend {
  return {
    async upsertAndReadBack(record) {
      const supabase = getCompanionSupabase();
      if (!supabase) {
        return durableFail(
          "CLIENT_UNAVAILABLE",
          "I can't reach the secure save layer yet. Try again in a moment.",
          true
        );
      }
      const row = authoritativeToRow(record);
      const { data, error } = await supabase
        .from(CREATION_DURABLE_TABLE)
        .upsert(row, { onConflict: "id" })
        .select("*")
        .single();

      if (error) {
        const code = error.code || "DB_WRITE_FAILED";
        const tableMissing =
          /relation|does not exist|42P01|PGRST/i.test(error.message || "") ||
          error.code === "42P01";
        return durableFail(
          tableMissing ? "TABLE_MISSING" : code,
          tableMissing
            ? "Secure Creation storage isn't set up yet. Apply the companion_creation_workspaces schema, then Retry."
            : "That didn't finish saving securely. Your work is still on screen — Retry.",
          true
        );
      }
      if (!data) {
        return durableFail(
          "DB_EMPTY_RETURN",
          "Save didn't return a confirmation. Your work is still on screen — Retry.",
          true
        );
      }
      const verified = rowToAuthoritative(data as CreationDurableRow);
      if (
        verified.workspaceId !== record.workspaceId ||
        verified.version !== record.version
      ) {
        return durableFail(
          "VERIFY_MISMATCH",
          "Save could not be verified. Your work is still on screen — Retry.",
          true
        );
      }
      // Optional second read-back
      const { data: readBack, error: readErr } = await supabase
        .from(CREATION_DURABLE_TABLE)
        .select("*")
        .eq("id", verified.workspaceId)
        .eq("user_id", verified.userId)
        .maybeSingle();
      if (readErr || !readBack) {
        return durableFail(
          "READBACK_FAILED",
          "I couldn't confirm the save yet. Your work is still on screen — Retry.",
          true
        );
      }
      const confirmed = rowToAuthoritative(readBack as CreationDurableRow);
      if (
        confirmed.workspaceId !== verified.workspaceId ||
        confirmed.version !== verified.version
      ) {
        return durableFail(
          "VERIFY_MISMATCH",
          "Save could not be verified. Your work is still on screen — Retry.",
          true
        );
      }
      markWorkspaceAuthoritativelyDurable(
        confirmed.workspaceId,
        confirmed.version,
        confirmed.updatedAt
      );
      writeOptionalCreationCache(confirmed);
      return durableOk(confirmed);
    },
    async fetchById(workspaceId, userId) {
      const supabase = getCompanionSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from(CREATION_DURABLE_TABLE)
        .select("*")
        .eq("id", workspaceId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToAuthoritative(data as CreationDurableRow);
    },
    async listForUser(userId) {
      const supabase = getCompanionSupabase();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from(CREATION_DURABLE_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error || !data) return [];
      return data.map((row) => rowToAuthoritative(row as CreationDurableRow));
    },
  };
}

function activeBackend(): CreationDurableBackend {
  return testBackend ?? supabaseBackend();
}

export async function getAuthenticatedCreationUserId(): Promise<string | null> {
  const resolved = await resolveUserId();
  return resolved.ok ? resolved.userId : null;
}

/**
 * Authoritative upsert with verify. Never returns ok when durable failed.
 */
export async function upsertAuthoritativeCreation(
  record: AuthoritativeCreationRecord
): Promise<DurableMutationResult<AuthoritativeCreationRecord>> {
  const auth = await resolveUserId();
  if (!auth.ok) return auth.result;
  const withUser: AuthoritativeCreationRecord = {
    ...record,
    userId: record.userId || auth.userId,
  };
  if (withUser.userId !== auth.userId && !testBackend) {
    return durableFail(
      "USER_MISMATCH",
      "This workspace belongs to a different account.",
      false
    );
  }
  return activeBackend().upsertAndReadBack({
    ...withUser,
    userId: auth.userId,
  });
}

export async function fetchAuthoritativeCreation(
  workspaceId: string
): Promise<AuthoritativeCreationRecord | null> {
  const auth = await resolveUserId();
  if (!auth.ok) return null;
  return activeBackend().fetchById(workspaceId, auth.userId);
}

export async function listAuthoritativeCreations(): Promise<
  AuthoritativeCreationRecord[]
> {
  const auth = await resolveUserId();
  if (!auth.ok) return [];
  return activeBackend().listForUser(auth.userId);
}
