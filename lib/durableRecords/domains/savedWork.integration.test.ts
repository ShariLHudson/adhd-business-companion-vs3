/**
 * @vitest-environment jsdom
 * Live Supabase certification for the Saved Work durable slice.
 *
 * Drives the REAL saved_work code paths (migration, adapter, store durable
 * writes, durable-first merged read) against the actual Supabase project, using
 * an injected member-scoped backend so writes/reads/RLS/constraint are all real.
 * (The production supabaseBackend wrapper itself is covered by the foundation
 * harness durableRecords.integration.test.ts.)
 *
 * SKIPPED BY DEFAULT. Runs only with:
 *   RUN_SUPABASE_INTEGRATION=1 NEXT_PUBLIC_SUPABASE_URL=... \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx vitest run lib/durableRecords/domains/savedWork.integration.test.ts
 *
 * SAFETY: disposable auth users only; every row created is under those users and
 * is deleted in afterAll. No real member work is touched.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSavedWork, getSavedWorkById } from "@/lib/savedWorkStore";
import {
  MEMBER_RECORDS_TABLE,
  durableRecordFail,
  durableRecordOk,
  markMemberRecordDurable,
  memberRecordToRow,
  rowToMemberRecord,
  clearMemberRecordDurableMarksForTests,
} from "../index";
import type { DurableRecordBackend } from "../repository";
import {
  clearDurableRecordAuthForTests,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import {
  archiveSavedWorkDurable,
  createSavedWorkDurable,
  deleteSavedWorkDurable,
  updateSavedWorkDurable,
} from "@/lib/savedWorkStore";
import { fetchSavedWorkDurable, listSavedWorkDurable } from "./savedWork";
import {
  migrateSavedWorkForMember,
  resetSavedWorkMigrationSessionForTests,
} from "./savedWorkMigration";
import { loadSavedWorkMerged } from "./savedWorkRead";

const RUN = process.env.RUN_SUPABASE_INTEGRATION === "1";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canRun = Boolean(RUN && URL && ANON && SERVICE);
const suite = canRun ? describe : describe.skip;

/** Member-scoped live backend over a real Supabase client (RLS enforced). */
function liveBackend(client: SupabaseClient): DurableRecordBackend {
  return {
    async upsertAndReadBack(record) {
      const { data, error } = await client
        .from(MEMBER_RECORDS_TABLE)
        .upsert(memberRecordToRow(record), {
          onConflict: "user_id,domain,record_id",
        })
        .select("*")
        .single();
      if (error) {
        return durableRecordFail("DB_WRITE_FAILED", "live fail", true, error.message);
      }
      if (!data) return durableRecordFail("DB_EMPTY_RETURN", "live empty", true);
      const verified = rowToMemberRecord(data as never);
      if (
        verified.recordId !== record.recordId ||
        verified.userId !== record.userId ||
        verified.version !== record.version
      ) {
        return durableRecordFail("VERIFY_MISMATCH", "live verify", true);
      }
      markMemberRecordDurable(
        verified.domain,
        verified.recordId,
        verified.version,
        verified.updatedAt,
      );
      return durableRecordOk(verified);
    },
    async fetchById(domain, recordId, userId) {
      const { data, error } = await client
        .from(MEMBER_RECORDS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("domain", domain)
        .eq("record_id", recordId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToMemberRecord(data as never);
    },
    async listForDomain(domain, userId) {
      const { data, error } = await client
        .from(MEMBER_RECORDS_TABLE)
        .select("*")
        .eq("user_id", userId)
        .eq("domain", domain)
        .eq("status", "active")
        .order("updated_at", { ascending: false });
      if (error || !data) return [];
      return (data as unknown[]).map((r) => rowToMemberRecord(r as never));
    },
  };
}

suite("Saved Work durable slice — live Supabase certification", () => {
  let admin: SupabaseClient;
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;
  let userAId = "";
  let userBId = "";
  const tag = `swtest-${Math.random().toString(36).slice(2, 8)}`;
  const pass = `Pw-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, { auth: { persistSession: false } });
    const a = await admin.auth.admin.createUser({
      email: `${tag}-a@foundation-verify.example.com`,
      password: pass,
      email_confirm: true,
    });
    const b = await admin.auth.admin.createUser({
      email: `${tag}-b@foundation-verify.example.com`,
      password: pass,
      email_confirm: true,
    });
    userAId = a.data.user?.id ?? "";
    userBId = b.data.user?.id ?? "";
    clientA = createClient(URL!, ANON!, { auth: { persistSession: false } });
    clientB = createClient(URL!, ANON!, { auth: { persistSession: false } });
    await clientA.auth.signInWithPassword({
      email: `${tag}-a@foundation-verify.example.com`,
      password: pass,
    });
    await clientB.auth.signInWithPassword({
      email: `${tag}-b@foundation-verify.example.com`,
      password: pass,
    });
  }, 30000);

  afterAll(async () => {
    if (!canRun) return;
    if (userAId) {
      await admin.from(MEMBER_RECORDS_TABLE).delete().eq("user_id", userAId);
      await admin.auth.admin.deleteUser(userAId);
    }
    if (userBId) {
      await admin.from(MEMBER_RECORDS_TABLE).delete().eq("user_id", userBId);
      await admin.auth.admin.deleteUser(userBId);
    }
  }, 30000);

  function useMemberA() {
    setDurableRecordBackendForTests(liveBackend(clientA));
    setDurableRecordAuthForTests(userAId);
  }

  it("migrates local -> durable, retrieves authoritatively, no dup on rerun", async () => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    resetSavedWorkMigrationSessionForTests();
    useMemberA();

    createSavedWork({ title: `${tag} One`, artifactType: "SOP", body: "a" });
    createSavedWork({ title: `${tag} Two`, artifactType: "Email", body: "b" });

    const first = await migrateSavedWorkForMember();
    expect(first.complete).toBe(true);
    expect(first.migrated).toBe(2);

    const merged = await loadSavedWorkMerged();
    expect(merged.filter((i) => i.title.startsWith(tag)).length).toBe(2);

    // Rerun: idempotent, no duplicates in the live table.
    resetSavedWorkMigrationSessionForTests();
    const second = await migrateSavedWorkForMember();
    expect(second.reason).toBe("already_complete");
    const durable = await listSavedWorkDurable();
    expect(durable.filter((i) => i.title.startsWith(tag))).toHaveLength(2);
  });

  it("update preserves identity/version without duplicating", async () => {
    useMemberA();
    const { item } = await createSavedWorkDurable({
      title: `${tag} Upd`,
      artifactType: "SOP",
      body: "v1",
    });
    const upd = await updateSavedWorkDurable(item.id, { title: `${tag} Upd v2` });
    expect(upd.receipt.ok).toBe(true);
    expect((await fetchSavedWorkDurable(item.id))?.title).toBe(`${tag} Upd v2`);
    const list = await listSavedWorkDurable();
    expect(list.filter((i) => i.id === item.id)).toHaveLength(1);
  });

  it("archive stays listed; soft-delete removes from list and local", async () => {
    useMemberA();
    const { item } = await createSavedWorkDurable({
      title: `${tag} Life`,
      artifactType: "SOP",
      body: "a",
    });
    const arch = await archiveSavedWorkDurable(item.id);
    expect(arch.receipt.ok).toBe(true);
    expect((await fetchSavedWorkDurable(item.id))?.status).toBe("archived");

    const del = await deleteSavedWorkDurable(item.id);
    expect(del.ok).toBe(true);
    expect(await fetchSavedWorkDurable(item.id)).toBeNull();
    expect(getSavedWorkById(item.id)).toBeUndefined();
  });

  it("member isolation: member B cannot see member A's saved work", async () => {
    useMemberA();
    await createSavedWorkDurable({
      title: `${tag} A-secret`,
      artifactType: "SOP",
      body: "a",
    });

    setDurableRecordBackendForTests(liveBackend(clientB));
    setDurableRecordAuthForTests(userBId);
    const bList = await listSavedWorkDurable();
    expect(bList.some((i) => i.title.includes("A-secret"))).toBe(false);
  });
});
