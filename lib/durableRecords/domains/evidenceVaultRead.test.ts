/**
 * @vitest-environment jsdom
 * Durable-first Evidence Vault retrieval. Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createEvidenceEntry } from "@/lib/evidenceBankStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import { listEvidenceVaultDurable } from "./evidenceVault";
import { resetEvidenceVaultMigrationSessionForTests } from "./evidenceVaultMigration";
import { loadEvidenceVaultMerged } from "./evidenceVaultRead";

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

describe("evidence_vault durable-first retrieval", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    resetEvidenceVaultMigrationSessionForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("migrates local on first read, then returns durable with no duplicates", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "One" }));
    createEvidenceEntry(baseInput({ whatHappened: "Two" }));

    const merged = await loadEvidenceVaultMerged();
    expect(merged).toHaveLength(2);
    const ids = merged.map((e) => e.id);
    expect(new Set(ids).size).toBe(2);
    expect(await listEvidenceVaultDurable()).toHaveLength(2);
  });

  it("falls back to local recovery when unauthenticated", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Local" }));
    setDurableRecordAuthForTests(null);
    const merged = await loadEvidenceVaultMerged();
    expect(merged).toHaveLength(1);
    expect(merged[0].whatHappened).toBe("Local");
  });

  it("never leaks another member's local evidence on a shared browser", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "A only" }));
    await loadEvidenceVaultMerged();

    setDurableRecordAuthForTests("user-b");
    resetEvidenceVaultMigrationSessionForTests();
    const bMerged = await loadEvidenceVaultMerged();
    expect(bMerged).toHaveLength(0);
  });
});
