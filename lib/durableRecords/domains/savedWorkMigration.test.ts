/**
 * @vitest-environment jsdom
 * Saved Work local -> durable migration. Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createSavedWork, getSavedWork } from "@/lib/savedWorkStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import type { DurableRecordBackend } from "../repository";
import { listSavedWorkDurable } from "./savedWork";
import {
  migrateSavedWorkForMember,
  resetSavedWorkMigrationSessionForTests,
} from "./savedWorkMigration";

const SAVED_WORK_KEY = "companion-saved-work-v1";

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
          message: "Simulated transient failure — your work is still here.",
        });
      }
      return base.upsertAndReadBack(record);
    },
    fetchById: base.fetchById.bind(base),
    listForDomain: base.listForDomain.bind(base),
  };
  return { backend, failIds };
}

describe("saved_work migration", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    resetSavedWorkMigrationSessionForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("migrates existing local records successfully", async () => {
    createSavedWork({ title: "Alpha", artifactType: "SOP", body: "a" });
    createSavedWork({ title: "Beta", artifactType: "Email", body: "b" });
    const res = await migrateSavedWorkForMember();
    expect(res.complete).toBe(true);
    expect(res.migrated).toBe(2);
    expect((await listSavedWorkDurable()).length).toBe(2);
  });

  it("is idempotent — a second run creates no duplicates", async () => {
    createSavedWork({ title: "Alpha", artifactType: "SOP", body: "a" });
    await migrateSavedWorkForMember();
    const second = await migrateSavedWorkForMember();
    expect(second.reason).toBe("already_complete");
    expect((await listSavedWorkDurable()).length).toBe(1);
  });

  it("partial failure stays retryable and does not falsely complete", async () => {
    const target = createSavedWork({ title: "Good", artifactType: "SOP", body: "g" });
    const bad = createSavedWork({ title: "WillFail", artifactType: "SOP", body: "x" });
    const ctl = controllable();
    ctl.failIds.add(bad.id);
    setDurableRecordBackendForTests(ctl.backend);

    const first = await migrateSavedWorkForMember();
    expect(first.complete).toBe(false);
    expect(first.migrated).toBe(1);
    expect(first.failed.map((f) => f.id)).toContain(bad.id);
    // Local records preserved after a failed durable write.
    expect(getSavedWork().map((i) => i.id).sort()).toEqual(
      [target.id, bad.id].sort(),
    );

    // Retry once the transient failure clears — the failed record migrates,
    // the already-migrated one is not duplicated.
    ctl.failIds.clear();
    const retry = await migrateSavedWorkForMember();
    expect(retry.complete).toBe(true);
    const durable = await listSavedWorkDurable();
    expect(durable.length).toBe(2);
    expect(durable.filter((i) => i.id === target.id)).toHaveLength(1);
  });

  it("records invalid records without discarding them", async () => {
    createSavedWork({ title: "Valid", artifactType: "SOP", body: "ok" });
    const raw = JSON.parse(localStorage.getItem(SAVED_WORK_KEY) || "[]");
    raw.push({
      id: "sw-bad",
      title: "",
      body: "",
      artifactType: "",
      status: "saved",
      savedLocation: "",
      typeFolder: "",
      preview: "",
      tags: [],
      sourceWorkspace: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(SAVED_WORK_KEY, JSON.stringify(raw));

    const res = await migrateSavedWorkForMember();
    expect(res.invalid.map((i) => i.id)).toContain("sw-bad");
    // Invalid record is preserved locally, not discarded.
    expect(getSavedWork().some((i) => i.id === "sw-bad")).toBe(true);
    // The valid record still migrated.
    expect(res.migrated).toBe(1);
  });

  it("member-specific marker + foreign-local isolation on a shared browser", async () => {
    createSavedWork({ title: "A's work", artifactType: "SOP", body: "a" });
    const a = await migrateSavedWorkForMember();
    expect(a.complete).toBe(true);
    expect(a.migrated).toBe(1);

    // Member B signs in on the same browser (same local store, which is A's).
    setDurableRecordAuthForTests("user-b");
    resetSavedWorkMigrationSessionForTests();
    const b = await migrateSavedWorkForMember();
    expect(b.reason).toBe("foreign_local");
    expect(b.migrated).toBe(0);
    // B's durable store did NOT absorb A's local items.
    expect(await listSavedWorkDurable()).toHaveLength(0);

    // A still has their durable items.
    setDurableRecordAuthForTests("user-a");
    expect(await listSavedWorkDurable()).toHaveLength(1);
  });

  it("does nothing (honestly) when unauthenticated", async () => {
    createSavedWork({ title: "Local only", artifactType: "SOP", body: "x" });
    setDurableRecordAuthForTests(null);
    const res = await migrateSavedWorkForMember();
    expect(res.ran).toBe(false);
    expect(res.reason).toBe("unauthenticated");
    // Local work untouched.
    expect(getSavedWork()).toHaveLength(1);
  });
});
