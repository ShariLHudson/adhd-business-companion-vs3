/**
 * @vitest-environment jsdom
 * Durable-first Saved Work retrieval. Memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createSavedWork, updateSavedWork } from "@/lib/savedWorkStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import { listSavedWorkDurable } from "./savedWork";
import { resetSavedWorkMigrationSessionForTests } from "./savedWorkMigration";
import {
  loadActiveSavedWorkMerged,
  loadArchivedSavedWorkMerged,
  loadSavedWorkMerged,
} from "./savedWorkRead";

describe("saved_work durable-first retrieval", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    resetSavedWorkMigrationSessionForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("migrates local on first read, then returns durable with no duplicates", async () => {
    createSavedWork({ title: "One", artifactType: "SOP", body: "a" });
    createSavedWork({ title: "Two", artifactType: "Email", body: "b" });

    const merged = await loadSavedWorkMerged();
    expect(merged).toHaveLength(2);
    const ids = merged.map((i) => i.id);
    expect(new Set(ids).size).toBe(2); // no duplicate local+durable rows
    // Migration-on-read moved both local items into durable storage.
    expect(await listSavedWorkDurable()).toHaveLength(2);
  });

  it("falls back to local recovery when unauthenticated", async () => {
    createSavedWork({ title: "Local", artifactType: "SOP", body: "x" });
    setDurableRecordAuthForTests(null);
    const merged = await loadSavedWorkMerged();
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("Local");
  });

  it("never leaks another member's local work on a shared browser", async () => {
    createSavedWork({ title: "A only", artifactType: "SOP", body: "a" });
    // Member A reads first -> migrates + claims the local store.
    await loadSavedWorkMerged();

    // Member B on the same browser: durable empty, local belongs to A.
    setDurableRecordAuthForTests("user-b");
    resetSavedWorkMigrationSessionForTests();
    const bMerged = await loadSavedWorkMerged();
    expect(bMerged).toHaveLength(0);
  });

  it("splits active and archived views", async () => {
    const active = createSavedWork({ title: "Act", artifactType: "SOP", body: "a" });
    const arch = createSavedWork({ title: "Arch", artifactType: "SOP", body: "b" });
    updateSavedWork(arch.id, { status: "archived" });

    const activeList = await loadActiveSavedWorkMerged();
    const archivedList = await loadArchivedSavedWorkMerged();
    expect(activeList.some((i) => i.id === active.id)).toBe(true);
    expect(activeList.some((i) => i.id === arch.id)).toBe(false);
    expect(archivedList.map((i) => i.id)).toEqual([arch.id]);
  });
});
