/**
 * @vitest-environment jsdom
 * Saved Browse index/search — durable-first via caller-supplied override.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createSavedWork, type SavedWorkItem } from "./savedWorkStore";
import { buildSavedBrowseIndex, searchSavedBrowse } from "./savedBrowseIndex";

function item(id: string, over: Partial<SavedWorkItem> = {}): SavedWorkItem {
  const now = new Date().toISOString();
  return {
    id,
    title: `Doc ${id}`,
    artifactType: "SOP",
    body: "body",
    status: "saved",
    savedLocation: "My Work > SOPs",
    typeFolder: "SOPs",
    preview: "body",
    tags: [],
    sourceWorkspace: "content-generator",
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

const savedWorkHits = (hits: { id: string }[]) =>
  hits.filter((h) => h.id.startsWith("saved-work:"));

describe("savedBrowseIndex durable-first", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("includes durable-only records (override) in the index and search", () => {
    const override = [item("sw-remote", { title: "Remote Proposal" })];
    const index = buildSavedBrowseIndex(override);
    expect(index.some((h) => h.id === "saved-work:sw-remote")).toBe(true);

    const results = searchSavedBrowse("Remote Proposal", override);
    expect(results.some((h) => h.id === "saved-work:sw-remote")).toBe(true);
  });

  it("includes durable-only records in the total (count)", () => {
    const override = [item("sw-1"), item("sw-2"), item("sw-3")];
    const total = buildSavedBrowseIndex(override).length;
    expect(total).toBeGreaterThanOrEqual(3);
    expect(savedWorkHits(buildSavedBrowseIndex(override))).toHaveLength(3);
  });

  it("keeps local recovery records visible (they are merged into the override)", () => {
    // The caller merges durable + not-yet-durable local into the override.
    const override = [
      item("sw-durable", { title: "Durable" }),
      item("sw-local-pending", { title: "Local Pending" }),
    ];
    const index = buildSavedBrowseIndex(override);
    expect(index.some((h) => h.id === "saved-work:sw-durable")).toBe(true);
    expect(index.some((h) => h.id === "saved-work:sw-local-pending")).toBe(true);
  });

  it("does not duplicate a single id supplied once in the override", () => {
    const override = [item("sw-1")];
    const hits = savedWorkHits(buildSavedBrowseIndex(override));
    expect(hits.filter((h) => h.id === "saved-work:sw-1")).toHaveLength(1);
  });

  it("excludes archived records", () => {
    const override = [
      item("sw-active"),
      item("sw-arch", { status: "archived" }),
    ];
    const index = buildSavedBrowseIndex(override);
    expect(index.some((h) => h.id === "saved-work:sw-active")).toBe(true);
    expect(index.some((h) => h.id === "saved-work:sw-arch")).toBe(false);
  });

  it("categorizes SOPs vs Documents", () => {
    const override = [
      item("sw-sop", { artifactType: "SOP" }),
      item("sw-doc", { artifactType: "Email" }),
    ];
    const index = buildSavedBrowseIndex(override);
    expect(index.find((h) => h.id === "saved-work:sw-sop")?.category).toBe("SOPs");
    expect(index.find((h) => h.id === "saved-work:sw-doc")?.category).toBe(
      "Documents",
    );
  });

  it("flag-off (no override) reads the local store unchanged", () => {
    createSavedWork({ title: "Local Doc", artifactType: "Email", body: "x" });
    const index = buildSavedBrowseIndex();
    expect(index.some((h) => h.title === "Local Doc")).toBe(true);
  });
});
