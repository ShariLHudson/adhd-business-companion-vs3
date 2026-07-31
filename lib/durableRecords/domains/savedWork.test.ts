/**
 * @vitest-environment jsdom
 * Saved Work durable domain adapter — memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { SavedWorkItem } from "@/lib/savedWorkStore";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import {
  fetchSavedWorkDurable,
  listSavedWorkDurable,
  softDeleteSavedWorkDurable,
  upsertSavedWorkDurable,
} from "./savedWork";

function makeItem(id: string, over: Partial<SavedWorkItem> = {}): SavedWorkItem {
  const now = new Date().toISOString();
  return {
    id,
    title: `Doc ${id}`,
    artifactType: "SOP",
    body: "Body text",
    status: "saved",
    savedLocation: "My Work > SOPs",
    typeFolder: "SOPs",
    preview: "Body text",
    tags: [],
    sourceWorkspace: "content-generator",
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

describe("saved_work durable adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("upserts a saved-work item and reads it back durably", async () => {
    const res = await upsertSavedWorkDurable(makeItem("sw-1"));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.recordId).toBe("sw-1");
    expect(res.record.payload.title).toBe("Doc sw-1");

    const back = await fetchSavedWorkDurable("sw-1");
    expect(back?.body).toBe("Body text");
  });

  it("lists durable saved work for the member", async () => {
    await upsertSavedWorkDurable(makeItem("sw-1"));
    await upsertSavedWorkDurable(makeItem("sw-2"));
    const list = await listSavedWorkDurable();
    expect(list.map((i) => i.id).sort()).toEqual(["sw-1", "sw-2"]);
  });

  it("archived items (payload.status) remain listed and fetchable", async () => {
    await upsertSavedWorkDurable(makeItem("sw-arch", { status: "archived" }));
    const list = await listSavedWorkDurable();
    expect(list.find((i) => i.id === "sw-arch")?.status).toBe("archived");
    expect(await fetchSavedWorkDurable("sw-arch")).not.toBeNull();
  });

  it("soft-delete removes the item from list and fetch", async () => {
    await upsertSavedWorkDurable(makeItem("sw-del"));
    const del = await softDeleteSavedWorkDurable("sw-del");
    expect(del.ok).toBe(true);
    expect(await fetchSavedWorkDurable("sw-del")).toBeNull();
    const list = await listSavedWorkDurable();
    expect(list.some((i) => i.id === "sw-del")).toBe(false);
  });

  it("re-upserting the same id does not duplicate", async () => {
    await upsertSavedWorkDurable(makeItem("sw-dupe", { title: "First" }));
    await upsertSavedWorkDurable(makeItem("sw-dupe", { title: "Second" }));
    const list = await listSavedWorkDurable();
    expect(list.filter((i) => i.id === "sw-dupe")).toHaveLength(1);
    expect(list.find((i) => i.id === "sw-dupe")?.title).toBe("Second");
  });

  it("does not return another member's saved work", async () => {
    await upsertSavedWorkDurable(makeItem("sw-a"));
    setDurableRecordAuthForTests("user-b");
    expect(await listSavedWorkDurable()).toHaveLength(0);
    expect(await fetchSavedWorkDurable("sw-a")).toBeNull();
  });
});
