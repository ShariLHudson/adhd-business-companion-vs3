/**
 * @vitest-environment jsdom
 * Durable member-record foundation (Beta Blocker 1, Step 1).
 * Memory backend stands in for Supabase — it still enforces write + read-back.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  DURABLE_ERROR,
  clearMemberRecordDurableMarksForTests,
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  fetchMemberRecord,
  isMemberRecordDurable,
  listMemberRecords,
  readLocalRecoveryCache,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
  softDeleteMemberRecord,
  upsertMemberRecord,
} from "./index";
import type { DurableRecordBackend } from "./index";

const DOMAIN = "saved_work";

type Doc = { title: string; body: string };

function brokenBackend(errorCode: string): DurableRecordBackend {
  return {
    async upsertAndReadBack() {
      return {
        ok: false,
        durable: false,
        errorCode,
        retryable: true,
        message: "Simulated failure — your work is still on screen.",
      };
    },
    async fetchById() {
      return null;
    },
    async listForDomain() {
      return [];
    },
  };
}

describe("durableRecords foundation", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("unauthenticated writes fail honestly (no durable success)", async () => {
    setDurableRecordAuthForTests(null);
    const res = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-1",
      payload: { title: "T", body: "B" },
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.durable).toBe(false);
    expect(res.errorCode).toBe(DURABLE_ERROR.AUTH_REQUIRED);
    expect(res.retryable).toBe(true);
    expect(res.message).toBeTruthy();
    expect(isMemberRecordDurable(DOMAIN, "sw-1")).toBe(false);
  });

  it("successful writes are read back and verified", async () => {
    const res = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-1",
      payload: { title: "Proposal", body: "Body" },
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.durable).toBe(true);
    expect(res.recordId).toBe("sw-1");
    expect(res.domain).toBe(DOMAIN);
    expect(res.version).toBe(1);
    expect(res.persistedAt).toBeTruthy();
    expect(res.record.payload.title).toBe("Proposal");
    expect(isMemberRecordDurable(DOMAIN, "sw-1")).toBe(true);

    const fetched = await fetchMemberRecord<Doc>(DOMAIN, "sw-1");
    expect(fetched?.payload.body).toBe("Body");
  });

  it("duplicate submission does not create duplicate records", async () => {
    await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-dupe",
      payload: { title: "One", body: "x" },
    });
    await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-dupe",
      payload: { title: "One again", body: "y" },
    });
    const list = await listMemberRecords<Doc>(DOMAIN);
    expect(list.filter((r) => r.recordId === "sw-dupe")).toHaveLength(1);
  });

  it("update increments version; expectedVersion guards conflict", async () => {
    const first = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-v",
      payload: { title: "v1", body: "" },
    });
    expect(first.ok && first.version).toBe(1);

    const second = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-v",
      payload: { title: "v2", body: "" },
      expectedVersion: 1,
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.version).toBe(2);

    // Stale expectedVersion → conflict, no lost work.
    const stale = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-v",
      payload: { title: "v3-stale", body: "" },
      expectedVersion: 1,
    });
    expect(stale.ok).toBe(false);
    if (stale.ok) return;
    expect(stale.errorCode).toBe(DURABLE_ERROR.VERSION_CONFLICT);
  });

  it("one member cannot access another member's record", async () => {
    setDurableRecordAuthForTests("user-a");
    await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-owned",
      payload: { title: "A only", body: "" },
    });

    setDurableRecordAuthForTests("user-b");
    const asB = await fetchMemberRecord<Doc>(DOMAIN, "sw-owned");
    expect(asB).toBeNull();
    const listB = await listMemberRecords<Doc>(DOMAIN);
    expect(listB).toHaveLength(0);

    setDurableRecordAuthForTests("user-a");
    const asA = await fetchMemberRecord<Doc>(DOMAIN, "sw-owned");
    expect(asA?.payload.title).toBe("A only");
  });

  it("failed writes never return durable success", async () => {
    setDurableRecordBackendForTests(
      brokenBackend(DURABLE_ERROR.DB_WRITE_FAILED),
    );
    const res = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-fail",
      payload: { title: "won't persist", body: "" },
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.durable).toBe(false);
    expect(res.errorCode).toBe(DURABLE_ERROR.DB_WRITE_FAILED);
    expect(isMemberRecordDurable(DOMAIN, "sw-fail")).toBe(false);
  });

  it("failed read-back never returns durable success", async () => {
    setDurableRecordBackendForTests(
      brokenBackend(DURABLE_ERROR.READBACK_FAILED),
    );
    const res = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-readback",
      payload: { title: "no confirm", body: "" },
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errorCode).toBe(DURABLE_ERROR.READBACK_FAILED);
    expect(isMemberRecordDurable(DOMAIN, "sw-readback")).toBe(false);
  });

  it("malformed payloads fail safely", async () => {
    const undef = await upsertMemberRecord({
      domain: DOMAIN,
      recordId: "sw-bad",
      // deliberately invalid
      payload: undefined as unknown as Doc,
    });
    expect(undef.ok).toBe(false);
    if (!undef.ok) expect(undef.errorCode).toBe(DURABLE_ERROR.INVALID_PAYLOAD);

    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const circ = await upsertMemberRecord({
      domain: DOMAIN,
      recordId: "sw-bad2",
      payload: circular as unknown as Doc,
    });
    expect(circ.ok).toBe(false);
    if (!circ.ok) expect(circ.errorCode).toBe(DURABLE_ERROR.INVALID_PAYLOAD);
  });

  it("missing identifier fails safely and non-retryably", async () => {
    const res = await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "   ",
      payload: { title: "x", body: "" },
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errorCode).toBe(DURABLE_ERROR.INVALID_ID);
    expect(res.retryable).toBe(false);
  });

  it("repository error results are stable and testable", async () => {
    // errorCode is a stable identifier callers can branch on.
    expect(DURABLE_ERROR.AUTH_REQUIRED).toBe("AUTH_REQUIRED");
    expect(DURABLE_ERROR.VERSION_CONFLICT).toBe("VERSION_CONFLICT");
    expect(DURABLE_ERROR.VERIFY_MISMATCH).toBe("VERIFY_MISMATCH");
    expect(DURABLE_ERROR.READBACK_FAILED).toBe("READBACK_FAILED");
  });

  it("local recovery cache is written on success but is not authoritative", async () => {
    await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-cache",
      payload: { title: "cached", body: "" },
    });
    // Cache exists for recovery...
    const cached = readLocalRecoveryCache<Doc>(DOMAIN, "sw-cache");
    expect(cached?.payload.title).toBe("cached");

    // ...but durability is proven only by the verified registry, not the cache.
    clearMemberRecordDurableMarksForTests();
    expect(readLocalRecoveryCache<Doc>(DOMAIN, "sw-cache")).not.toBeNull();
    expect(isMemberRecordDurable(DOMAIN, "sw-cache")).toBe(false);
  });

  it("soft delete marks status deleted and hides from active list", async () => {
    await upsertMemberRecord<Doc>({
      domain: DOMAIN,
      recordId: "sw-del",
      payload: { title: "bye", body: "" },
    });
    const del = await softDeleteMemberRecord<Doc>(DOMAIN, "sw-del");
    expect(del.ok).toBe(true);
    if (!del.ok) return;
    expect(del.record.status).toBe("deleted");
    const active = await listMemberRecords<Doc>(DOMAIN);
    expect(active.some((r) => r.recordId === "sw-del")).toBe(false);
  });
});
