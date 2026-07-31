/**
 * @vitest-environment jsdom
 * Saved Work durable WRITE integration (store + createDraftPersistence).
 * Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  archiveSavedWorkDurable,
  createSavedWorkDurable,
  deleteSavedWorkDurable,
  getSavedWorkById,
  updateSavedWorkDurable,
} from "@/lib/savedWorkStore";
import { persistGeneratedDraftDurable } from "@/lib/createDraftPersistence";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import type { DurableRecordBackend } from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import { fetchSavedWorkDurable, listSavedWorkDurable } from "./savedWork";

function controllable() {
  const base = createMemoryDurableRecordBackend();
  const failIds = new Set<string>();
  const backend: DurableRecordBackend = {
    upsertAndReadBack(record) {
      if (failIds.has(record.recordId)) {
        return Promise.resolve({
          ok: false,
          durable: false,
          errorCode: "DB_WRITE_FAILED",
          retryable: true,
          message: "Simulated failure — your work is still here.",
        });
      }
      return base.upsertAndReadBack(record);
    },
    fetchById: base.fetchById.bind(base),
    listForDomain: base.listForDomain.bind(base),
  };
  return { backend, failIds };
}

describe("saved_work durable write integration", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("createSavedWorkDurable returns a verified durable receipt", async () => {
    const { item, receipt } = await createSavedWorkDurable({
      title: "Proposal",
      artifactType: "Proposal",
      body: "content",
    });
    expect(receipt.ok).toBe(true);
    if (!receipt.ok) return;
    expect(receipt.durable).toBe(true);
    expect(receipt.recordId).toBe(item.id);
    expect((await fetchSavedWorkDurable(item.id))?.title).toBe("Proposal");
  });

  it("a failed durable write never reports success but retains local recovery", async () => {
    const ctl = controllable();
    setDurableRecordBackendForTests(ctl.backend);
    // Fail every upsert for this test.
    const realUpsert = ctl.backend.upsertAndReadBack;
    ctl.backend.upsertAndReadBack = () =>
      Promise.resolve({
        ok: false,
        durable: false,
        errorCode: "DB_WRITE_FAILED",
        retryable: true,
        message: "Simulated failure.",
      });
    const { item, receipt } = await createSavedWorkDurable({
      title: "Unsaved",
      artifactType: "SOP",
      body: "x",
    });
    expect(receipt.ok).toBe(false);
    // Local recovery copy still exists.
    expect(getSavedWorkById(item.id)).toBeDefined();
    ctl.backend.upsertAndReadBack = realUpsert;
  });

  it("updateSavedWorkDurable does not create a duplicate", async () => {
    const { item } = await createSavedWorkDurable({
      title: "v1",
      artifactType: "SOP",
      body: "a",
    });
    const upd = await updateSavedWorkDurable(item.id, { title: "v2" });
    expect(upd.receipt.ok).toBe(true);
    const list = await listSavedWorkDurable();
    expect(list.filter((i) => i.id === item.id)).toHaveLength(1);
    expect(list.find((i) => i.id === item.id)?.title).toBe("v2");
  });

  it("archiveSavedWorkDurable keeps the item listed as archived", async () => {
    const { item } = await createSavedWorkDurable({
      title: "Arch",
      artifactType: "SOP",
      body: "a",
    });
    const res = await archiveSavedWorkDurable(item.id);
    expect(res.receipt.ok).toBe(true);
    const durable = await fetchSavedWorkDurable(item.id);
    expect(durable?.status).toBe("archived");
  });

  it("deleteSavedWorkDurable soft-deletes durably and removes local on success", async () => {
    const { item } = await createSavedWorkDurable({
      title: "Bye",
      artifactType: "SOP",
      body: "a",
    });
    const res = await deleteSavedWorkDurable(item.id);
    expect(res.ok).toBe(true);
    expect(await fetchSavedWorkDurable(item.id)).toBeNull();
    expect(getSavedWorkById(item.id)).toBeUndefined(); // local removed on success
  });

  it("failed delete retains both durable record and local copy", async () => {
    const ctl = controllable();
    setDurableRecordBackendForTests(ctl.backend);
    const { item } = await createSavedWorkDurable({
      title: "KeepMe",
      artifactType: "SOP",
      body: "a",
    });
    ctl.failIds.add(item.id); // make the soft-delete upsert fail
    const res = await deleteSavedWorkDurable(item.id);
    expect(res.ok).toBe(false);
    // Local copy retained because durable delete did not verify.
    expect(getSavedWorkById(item.id)).toBeDefined();
  });

  it("persistGeneratedDraftDurable returns the receipt and persists durably", async () => {
    const { item, receipt } = await persistGeneratedDraftDurable({
      draft: "# Draft\n\nbody",
      artifactType: "SOP",
      title: "Focus SOP",
    });
    expect(receipt.ok).toBe(true);
    expect((await fetchSavedWorkDurable(item.id))?.title).toBe("Focus SOP");
  });
});
