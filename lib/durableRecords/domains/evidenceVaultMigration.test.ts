/**
 * @vitest-environment jsdom
 * Evidence Vault local -> durable migration. Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createEvidenceEntry, getEvidenceEntries } from "@/lib/evidenceBankStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import type { DurableRecordBackend } from "../repository";
import { listEvidenceVaultDurable } from "./evidenceVault";
import {
  migrateEvidenceVaultForMember,
  resetEvidenceVaultMigrationSessionForTests,
} from "./evidenceVaultMigration";

const EVIDENCE_KEY = "companion-evidence-bank-v1";

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
          message: "Simulated transient failure — your evidence is still here.",
        });
      }
      return base.upsertAndReadBack(record);
    },
    fetchById: base.fetchById.bind(base),
    listForDomain: base.listForDomain.bind(base),
  };
  return { backend, failIds };
}

describe("evidence_vault migration", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    resetEvidenceVaultMigrationSessionForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("migrates existing local entries successfully", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Alpha" }));
    createEvidenceEntry(baseInput({ whatHappened: "Beta" }));
    const res = await migrateEvidenceVaultForMember();
    expect(res.complete).toBe(true);
    expect(res.migrated).toBe(2);
    expect((await listEvidenceVaultDurable()).length).toBe(2);
  });

  it("is idempotent — a second run creates no duplicates", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Alpha" }));
    await migrateEvidenceVaultForMember();
    const second = await migrateEvidenceVaultForMember();
    expect(second.reason).toBe("already_complete");
    expect((await listEvidenceVaultDurable()).length).toBe(1);
  });

  it("partial failure stays retryable and does not falsely complete", async () => {
    const target = createEvidenceEntry(baseInput({ whatHappened: "Good" }));
    const bad = createEvidenceEntry(baseInput({ whatHappened: "WillFail" }));
    const ctl = controllable();
    ctl.failIds.add(bad.id);
    setDurableRecordBackendForTests(ctl.backend);

    const first = await migrateEvidenceVaultForMember();
    expect(first.complete).toBe(false);
    expect(first.migrated).toBe(1);
    expect(first.failed.map((f) => f.id)).toContain(bad.id);
    expect(getEvidenceEntries().map((e) => e.id).sort()).toEqual(
      [target.id, bad.id].sort(),
    );

    ctl.failIds.clear();
    const retry = await migrateEvidenceVaultForMember();
    expect(retry.complete).toBe(true);
    const durable = await listEvidenceVaultDurable();
    expect(durable.length).toBe(2);
    expect(durable.filter((e) => e.id === target.id)).toHaveLength(1);
  });

  it("records invalid entries without discarding them", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Valid" }));
    const raw = JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "[]");
    raw.push({
      id: "ev-bad",
      category: "Small Win",
      whatHappened: "",
      whatImproved: "",
      whatMovedForward: "",
      whatProblemSolved: "",
      whoBenefited: "",
      whyItMattered: "",
      whatThisProves: "",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(raw));

    const res = await migrateEvidenceVaultForMember();
    expect(res.invalid.map((i) => i.id)).toContain("ev-bad");
    expect(getEvidenceEntries().some((e) => e.id === "ev-bad")).toBe(true);
    expect(res.migrated).toBe(1);
  });

  it("member-specific marker + foreign-local isolation on a shared browser", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "A's evidence" }));
    const a = await migrateEvidenceVaultForMember();
    expect(a.complete).toBe(true);
    expect(a.migrated).toBe(1);

    setDurableRecordAuthForTests("user-b");
    resetEvidenceVaultMigrationSessionForTests();
    const b = await migrateEvidenceVaultForMember();
    expect(b.reason).toBe("foreign_local");
    expect(b.migrated).toBe(0);
    expect(await listEvidenceVaultDurable()).toHaveLength(0);

    setDurableRecordAuthForTests("user-a");
    expect(await listEvidenceVaultDurable()).toHaveLength(1);
  });

  it("does nothing (honestly) when unauthenticated", async () => {
    createEvidenceEntry(baseInput({ whatHappened: "Local only" }));
    setDurableRecordAuthForTests(null);
    const res = await migrateEvidenceVaultForMember();
    expect(res.ran).toBe(false);
    expect(res.reason).toBe("unauthenticated");
    expect(getEvidenceEntries()).toHaveLength(1);
  });
});
