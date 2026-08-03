/**
 * @vitest-environment jsdom
 * Evidence Vault durable WRITE integration (evidenceBankStore explicit
 * wrappers + background fire-and-forget sync gated by the rollout flag).
 * Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  createEvidenceEntry,
  createEvidenceEntryDurable,
  deleteEvidenceEntry,
  deleteEvidenceEntryDurable,
  getEvidenceEntryById,
  updateEvidenceEntry,
  updateEvidenceEntryDurable,
} from "@/lib/evidenceBankStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import type { DurableRecordBackend } from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import { setEvidenceVaultDurableEnabledForTests } from "../flags";
import { fetchEvidenceVaultDurable, listEvidenceVaultDurable } from "./evidenceVault";

function baseInput(over: Partial<Parameters<typeof createEvidenceEntry>[0]> = {}) {
  return {
    category: "Small Win" as const,
    whatHappened: "Something happened",
    whatImproved: "",
    whatMovedForward: "",
    whatProblemSolved: "",
    whoBenefited: "",
    whyItMattered: "",
    whatThisProves: "",
    attachments: [],
    ...over,
  };
}

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
          message: "Simulated failure — your evidence is still here.",
        });
      }
      return base.upsertAndReadBack(record);
    },
    fetchById: base.fetchById.bind(base),
    listForDomain: base.listForDomain.bind(base),
  };
  return { backend, failIds };
}

/** Give fire-and-forget background writes a chance to settle. */
async function flushAsync() {
  for (let i = 0; i < 10; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe("evidence_vault durable write integration", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
    setEvidenceVaultDurableEnabledForTests(null);
  });

  it("createEvidenceEntryDurable returns a verified durable receipt", async () => {
    const { entry, receipt } = await createEvidenceEntryDurable(
      baseInput({ whatHappened: "Proof" }),
    );
    expect(receipt.ok).toBe(true);
    if (!receipt.ok) return;
    expect(receipt.durable).toBe(true);
    expect(receipt.recordId).toBe(entry.id);
    expect((await fetchEvidenceVaultDurable(entry.id))?.whatHappened).toBe("Proof");
  });

  it("a failed durable write never reports success but retains local recovery", async () => {
    const ctl = controllable();
    setDurableRecordBackendForTests(ctl.backend);
    ctl.backend.upsertAndReadBack = () =>
      Promise.resolve({
        ok: false,
        durable: false,
        errorCode: "DB_WRITE_FAILED",
        retryable: true,
        message: "Simulated failure.",
      });
    const { entry, receipt } = await createEvidenceEntryDurable(
      baseInput({ whatHappened: "Unsaved" }),
    );
    expect(receipt.ok).toBe(false);
    expect(getEvidenceEntryById(entry.id)).toBeDefined();
  });

  it("updateEvidenceEntryDurable does not create a duplicate", async () => {
    const { entry } = await createEvidenceEntryDurable(baseInput({ whatHappened: "v1" }));
    const upd = await updateEvidenceEntryDurable(entry.id, { whatHappened: "v2" });
    expect(upd.receipt.ok).toBe(true);
    const list = await listEvidenceVaultDurable();
    expect(list.filter((e) => e.id === entry.id)).toHaveLength(1);
    expect(list.find((e) => e.id === entry.id)?.whatHappened).toBe("v2");
  });

  it("deleteEvidenceEntryDurable soft-deletes durably and removes local on success", async () => {
    const { entry } = await createEvidenceEntryDurable(baseInput({ whatHappened: "Bye" }));
    const res = await deleteEvidenceEntryDurable(entry.id);
    expect(res.ok).toBe(true);
    expect(await fetchEvidenceVaultDurable(entry.id)).toBeNull();
    expect(getEvidenceEntryById(entry.id)).toBeNull();
  });

  it("failed delete retains both durable record and local copy", async () => {
    const ctl = controllable();
    setDurableRecordBackendForTests(ctl.backend);
    const { entry } = await createEvidenceEntryDurable(baseInput({ whatHappened: "KeepMe" }));
    ctl.failIds.add(entry.id);
    const res = await deleteEvidenceEntryDurable(entry.id);
    expect(res.ok).toBe(false);
    expect(getEvidenceEntryById(entry.id)).toBeDefined();
  });

  // --- background fire-and-forget sync from the plain (non-Durable) API ---

  it("plain createEvidenceEntry stays local-only when the flag is off (default)", async () => {
    setEvidenceVaultDurableEnabledForTests(false);
    const entry = createEvidenceEntry(baseInput({ whatHappened: "Local only" }));
    await flushAsync();
    expect(await fetchEvidenceVaultDurable(entry.id)).toBeNull();
  });

  it("plain createEvidenceEntry/updateEvidenceEntry/deleteEvidenceEntry sync durably in the background when the flag is on", async () => {
    setEvidenceVaultDurableEnabledForTests(true);
    const entry = createEvidenceEntry(baseInput({ whatHappened: "Background sync" }));
    await flushAsync();
    expect((await fetchEvidenceVaultDurable(entry.id))?.whatHappened).toBe(
      "Background sync",
    );

    updateEvidenceEntry(entry.id, { whatHappened: "Updated in background" });
    await flushAsync();
    expect((await fetchEvidenceVaultDurable(entry.id))?.whatHappened).toBe(
      "Updated in background",
    );

    deleteEvidenceEntry(entry.id);
    await flushAsync();
    expect(await fetchEvidenceVaultDurable(entry.id)).toBeNull();
  });
});
