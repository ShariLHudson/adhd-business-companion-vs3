import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addBrainDump,
  getBrainDumps,
  updateBrainDump,
} from "@/lib/companionStore";
import {
  createThoughtCollection,
  getThoughtCollections,
} from "./collections";
import { getSessionThoughts, getThinkingSpaceThoughts } from "./queries";
import {
  acceptClusterAsCollection,
  addThoughtToCollection,
  archiveThought,
  editThoughtText,
  mergeThoughts,
  pinThought,
  restoreThought,
  splitThoughtIntoParts,
} from "./thoughtOperations";
import {
  collectionPickerValueForThought,
  getActiveCollectionId,
  listCollectionPickerOptions,
  moveThoughtToCollection,
  resolveCollectionIdFromPicker,
} from "./thoughtCollectionAuthority";
import { UNCATEGORIZED_COLLECTION_ID } from "./collectionSummaries";

describe("thinkingSpace", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
    });
  });

  it("creates collections and assigns one active collection per thought", () => {
    addBrainDump("Call Caleb", { captureSessionId: "s1" });
    const thought = getBrainDumps()[0]!;
    const colA = createThoughtCollection({ label: "Networking" });
    addThoughtToCollection(thought.id, colA.id);
    const colB = createThoughtCollection({ label: "Launch" });
    addThoughtToCollection(thought.id, colB.id);
    const updated = getBrainDumps()[0]!;
    expect(updated.collectionId).toBe(colB.id);
    expect(updated.previousCollectionId).toBe(colA.id);
  });

  it("archives and restores thoughts", () => {
    addBrainDump("Resting thought");
    const id = getBrainDumps()[0]!.id;
    archiveThought(id);
    expect(getThinkingSpaceThoughts()).toHaveLength(0);
    restoreThought(id);
    expect(getThinkingSpaceThoughts()).toHaveLength(1);
  });

  it("edits and pins thoughts", () => {
    addBrainDump("Original", { captureSessionId: "s2" });
    const id = getBrainDumps()[0]!.id;
    editThoughtText(id, "Updated text");
    pinThought(id, true);
    const t = getSessionThoughts("s2")[0]!;
    expect(t.text).toBe("Updated text");
    expect(t.pinned).toBe(true);
  });

  it("merges and splits thoughts", () => {
    addBrainDump("Part A", { captureSessionId: "s3" });
    addBrainDump("Part B", { captureSessionId: "s3" });
    const [a, b] = getBrainDumps();
    mergeThoughts(a!.id, b!.id);
    expect(getBrainDumps()).toHaveLength(1);
    expect(getBrainDumps()[0]!.text).toContain("Part A");
    splitThoughtIntoParts(getBrainDumps()[0]!.id, ["One", "Two"]);
    expect(getBrainDumps().length).toBeGreaterThanOrEqual(2);
  });

  it("accepts cluster as collection for multiple thoughts", () => {
    addBrainDump("Idea one", { captureSessionId: "s4" });
    addBrainDump("Idea two", { captureSessionId: "s4" });
    const ids = getBrainDumps().map((t) => t.id);
    acceptClusterAsCollection("Business", ids);
    for (const t of getBrainDumps()) {
      expect(t.collectionId).toBeTruthy();
    }
  });

  it("assigns distinct catalog colors to named collections", () => {
    const business = createThoughtCollection({ label: "Business" });
    const health = createThoughtCollection({ label: "Health" });
    expect(business.colorId).toBe("business");
    expect(business.icon).toBe("💼");
    expect(health.colorId).toBe("health");
    expect(health.colorId).not.toBe(business.colorId);
  });

  it("lists catalog collections in picker and persists collection moves", () => {
    addBrainDump("call about peptides");
    const thought = getBrainDumps()[0]!;
    const business = createThoughtCollection({ label: "Business" });
    moveThoughtToCollection(thought.id, business.id);
    expect(getActiveCollectionId(getBrainDumps()[0]!)).toBe(business.id);

    const options = listCollectionPickerOptions();
    expect(options.some((o) => o.label === "Health")).toBe(true);
    expect(options.some((o) => o.id === UNCATEGORIZED_COLLECTION_ID)).toBe(true);
    expect(options.some((o) => o.label === "Create new collection…")).toBe(true);

    const healthId = resolveCollectionIdFromPicker(
      options.find((o) => o.label === "Health")!.id,
    );
    moveThoughtToCollection(thought.id, healthId!);
    const updated = getBrainDumps()[0]!;
    expect(getActiveCollectionId(updated)).toBe(healthId);
    expect(collectionPickerValueForThought(updated)).toBe(healthId);
  });

  it("searches by project name and reminder", async () => {
    const { saveProject } = await import("@/lib/companionStore");
    const projects = saveProject({ name: "Newsletter Launch", goal: "Ship", horizon: "now", status: "active-focus", nextAction: "Write" });
    const projectId = projects[0]!.id;
    addBrainDump("Write intro paragraph");
    const id = getBrainDumps()[0]!.id;
    const { connectThoughtToProject, setThoughtReminder } = await import(
      "./thoughtOperations"
    );
    connectThoughtToProject(id, projectId);
    setThoughtReminder(id, "2030-06-15T09:00:00.000Z");
    const { searchThinkingSpaceThoughts } = await import("./search");
    expect(searchThinkingSpaceThoughts("newsletter").length).toBe(1);
    expect(searchThinkingSpaceThoughts("2030").length).toBe(1);
  });
});
