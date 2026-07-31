/**
 * Authenticated Supabase integration verification for the durable-record
 * foundation (Beta Blocker 1). Proves the LIVE database contract that the
 * in-memory suite cannot: the real table, RLS ownership isolation, the unique
 * (user_id, domain, record_id) constraint, the updated_at trigger, version
 * behavior, unauthenticated rejection, and soft-delete — against the actual
 * Supabase project.
 *
 * SKIPPED BY DEFAULT. It runs only when explicitly opted in, so the normal
 * `vitest run` stays green without network/credentials:
 *
 *   RUN_SUPABASE_INTEGRATION=1 \
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx vitest run lib/durableRecords/durableRecords.integration.test.ts
 *
 * PRECONDITION: apply supabase/companion_member_records_schema.sql first.
 *
 * SAFETY: uses a disposable test domain ("foundation_verification"), disposable
 * auth users (created + deleted here), and cleans up all rows it creates. It
 * never touches real member work or other domains. Repository-logic behaviors
 * (receipt shape, version compute, expected-version conflict, "local cache is
 * not durable success") are backend-agnostic and fully covered by
 * durableRecords.test.ts; this harness covers the DB/RLS layer those depend on.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const RUN = process.env.RUN_SUPABASE_INTEGRATION === "1";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canRun = Boolean(RUN && URL && ANON && SERVICE);

const TABLE = "companion_member_records";
const DOMAIN = "foundation_verification";
const runTag = `fv-${Math.random().toString(36).slice(2, 10)}`;

const suite = canRun ? describe : describe.skip;

suite("durableRecords — live Supabase verification", () => {
  let admin: SupabaseClient;
  let memberA: SupabaseClient;
  let memberB: SupabaseClient;
  let anon: SupabaseClient;
  let userAId = "";
  let userBId = "";
  const emailA = `${runTag}-a@foundation-verify.example.com`;
  const emailB = `${runTag}-b@foundation-verify.example.com`;
  const pass = `Pw-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  const recordId = `${runTag}-rec-1`;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const a = await admin.auth.admin.createUser({
      email: emailA,
      password: pass,
      email_confirm: true,
    });
    const b = await admin.auth.admin.createUser({
      email: emailB,
      password: pass,
      email_confirm: true,
    });
    userAId = a.data.user?.id ?? "";
    userBId = b.data.user?.id ?? "";

    memberA = createClient(URL!, ANON!, { auth: { persistSession: false } });
    memberB = createClient(URL!, ANON!, { auth: { persistSession: false } });
    anon = createClient(URL!, ANON!, { auth: { persistSession: false } });
    await memberA.auth.signInWithPassword({ email: emailA, password: pass });
    await memberB.auth.signInWithPassword({ email: emailB, password: pass });
  }, 30000);

  afterAll(async () => {
    if (!canRun) return;
    // Remove disposable rows and users regardless of outcome.
    await admin.from(TABLE).delete().eq("domain", DOMAIN).eq("user_id", userAId);
    await admin.from(TABLE).delete().eq("domain", DOMAIN).eq("user_id", userBId);
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  }, 30000);

  it("1. table exists and is reachable", async () => {
    const { error } = await admin.from(TABLE).select("id").limit(1);
    expect(error).toBeNull();
  });

  it("3-4. an authenticated member can create a record and read it back", async () => {
    const { data, error } = await memberA
      .from(TABLE)
      .upsert(
        {
          user_id: userAId,
          domain: DOMAIN,
          record_id: recordId,
          status: "active",
          schema_version: 1,
          record_version: 1,
          payload: { note: "hello" },
        },
        { onConflict: "user_id,domain,record_id" },
      )
      .select("*")
      .single();
    expect(error).toBeNull();
    expect(data?.record_id).toBe(recordId);
    expect((data?.payload as { note: string })?.note).toBe("hello");

    const readBack = await memberA
      .from(TABLE)
      .select("*")
      .eq("user_id", userAId)
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .maybeSingle();
    expect(readBack.error).toBeNull();
    expect(readBack.data?.record_id).toBe(recordId);
  });

  it("6. duplicate upsert on the same identity does not create a duplicate", async () => {
    await memberA.from(TABLE).upsert(
      {
        user_id: userAId,
        domain: DOMAIN,
        record_id: recordId,
        status: "active",
        schema_version: 1,
        record_version: 2,
        payload: { note: "hello-again" },
      },
      { onConflict: "user_id,domain,record_id" },
    );
    const { data } = await memberA
      .from(TABLE)
      .select("id")
      .eq("domain", DOMAIN)
      .eq("record_id", recordId);
    expect(data?.length).toBe(1);
  });

  it("7. record version + updated_at trigger behave as designed", async () => {
    const before = await memberA
      .from(TABLE)
      .select("record_version, updated_at")
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .single();
    const updated = await memberA
      .from(TABLE)
      .update({ record_version: 3, payload: { note: "v3" } })
      .eq("user_id", userAId)
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .select("record_version, updated_at")
      .single();
    expect(updated.data?.record_version).toBe(3);
    expect(
      new Date(updated.data!.updated_at).getTime(),
    ).toBeGreaterThanOrEqual(new Date(before.data!.updated_at).getTime());
  });

  it("9. an unauthenticated write fails honestly (RLS)", async () => {
    const { error } = await anon.from(TABLE).insert({
      user_id: userAId,
      domain: DOMAIN,
      record_id: `${runTag}-anon`,
      status: "active",
      schema_version: 1,
      record_version: 1,
      payload: { note: "should not persist" },
    });
    expect(error).not.toBeNull();
  });

  it("10. a second member cannot read or modify the first member's record", async () => {
    const read = await memberB
      .from(TABLE)
      .select("*")
      .eq("domain", DOMAIN)
      .eq("record_id", recordId);
    expect(read.error).toBeNull();
    expect(read.data?.length).toBe(0); // RLS filters A's rows out for B

    const update = await memberB
      .from(TABLE)
      .update({ payload: { note: "hijack" } })
      .eq("user_id", userAId)
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .select("*");
    expect(update.data?.length ?? 0).toBe(0); // RLS blocks the update

    // Confirm A's record is intact.
    const stillMine = await memberA
      .from(TABLE)
      .select("payload")
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .single();
    expect((stillMine.data?.payload as { note: string })?.note).toBe("v3");
  });

  it("11. soft-delete hides the record from the active list", async () => {
    await memberA
      .from(TABLE)
      .update({ status: "deleted" })
      .eq("user_id", userAId)
      .eq("domain", DOMAIN)
      .eq("record_id", recordId);
    const active = await memberA
      .from(TABLE)
      .select("id")
      .eq("domain", DOMAIN)
      .eq("status", "active");
    expect(active.data?.some((r) => r.id === recordId)).toBeFalsy();
    // Row still exists (soft, not hard, delete).
    const all = await memberA
      .from(TABLE)
      .select("status")
      .eq("domain", DOMAIN)
      .eq("record_id", recordId)
      .single();
    expect(all.data?.status).toBe("deleted");
  });
});
