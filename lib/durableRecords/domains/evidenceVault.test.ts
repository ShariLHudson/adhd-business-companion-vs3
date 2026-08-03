/**
 * @vitest-environment jsdom
 * Evidence Vault durable domain adapter — memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { EvidenceEntry } from "@/lib/evidenceBankStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import {
  fetchEvidenceVaultDurable,
  listEvidenceVaultDurable,
  softDeleteEvidenceVaultDurable,
  upsertEvidenceVaultDurable,
} from "./evidenceVault";

function makeEntry(id: string, over: Partial<EvidenceEntry> = {}): EvidenceEntry {
  const now = new Date().toISOString();
  return {
    id,
    category: "Small Win",
    whatHappened: `Discovery ${id}`,
    whatImproved: "",
    whatMovedForward: "",
    whatProblemSolved: "",
    whoBenefited: "",
    whyItMattered: "",
    whatThisProves: "",
    attachments: [],
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

describe("evidence_vault durable adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("upserts an evidence entry and reads it back durably", async () => {
    const res = await upsertEvidenceVaultDurable(makeEntry("ev-1"));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.recordId).toBe("ev-1");
    expect(res.record.payload.whatHappened).toBe("Discovery ev-1");

    const back = await fetchEvidenceVaultDurable("ev-1");
    expect(back?.category).toBe("Small Win");
  });

  it("lists durable evidence entries for the member", async () => {
    await upsertEvidenceVaultDurable(makeEntry("ev-1"));
    await upsertEvidenceVaultDurable(makeEntry("ev-2"));
    const list = await listEvidenceVaultDurable();
    expect(list.map((e) => e.id).sort()).toEqual(["ev-1", "ev-2"]);
  });

  it("soft-delete removes the entry from list and fetch", async () => {
    await upsertEvidenceVaultDurable(makeEntry("ev-del"));
    const del = await softDeleteEvidenceVaultDurable("ev-del");
    expect(del.ok).toBe(true);
    expect(await fetchEvidenceVaultDurable("ev-del")).toBeNull();
    const list = await listEvidenceVaultDurable();
    expect(list.some((e) => e.id === "ev-del")).toBe(false);
  });

  it("re-upserting the same id does not duplicate", async () => {
    await upsertEvidenceVaultDurable(makeEntry("ev-dupe", { whatHappened: "First" }));
    await upsertEvidenceVaultDurable(makeEntry("ev-dupe", { whatHappened: "Second" }));
    const list = await listEvidenceVaultDurable();
    expect(list.filter((e) => e.id === "ev-dupe")).toHaveLength(1);
    expect(list.find((e) => e.id === "ev-dupe")?.whatHappened).toBe("Second");
  });

  it("does not return another member's evidence", async () => {
    await upsertEvidenceVaultDurable(makeEntry("ev-a"));
    setDurableRecordAuthForTests("user-b");
    expect(await listEvidenceVaultDurable()).toHaveLength(0);
    expect(await fetchEvidenceVaultDurable("ev-a")).toBeNull();
  });
});
