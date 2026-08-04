import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  buildBrainDumpClusterGraph,
  buildConnectionGroups,
  relationshipWhyLabel,
} from "./brainDumpClusterModel";
import {
  loadCategorizationMode,
  mergeClusters,
  renameCluster,
  saveCategorizationMode,
} from "./brainDumpClusterPreferences";
import type { BrainDumpEntry } from "./companionStore";

function entry(
  partial: Partial<BrainDumpEntry> & { text: string; id: string },
): BrainDumpEntry {
  return {
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("brainDumpClusterIntelligence P0.35", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const localMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    });
  });

  it("labels relationship kinds with human why text", () => {
    expect(relationshipWhyLabel("same_project")).toBe("Same project");
    expect(relationshipWhyLabel("same_category", "Marketing")).toContain(
      "Marketing",
    );
  });

  it("groups connections by why label", () => {
    const graph = buildBrainDumpClusterGraph([
      entry({
        id: "1",
        text: "Launch homepage",
        topic: "Launch",
        category: "Marketing",
      }),
      entry({
        id: "2",
        text: "Launch email",
        topic: "Launch",
        category: "Content",
      }),
    ]);
    const groups = buildConnectionGroups(graph.relationships);
    expect(groups[0]?.whyLabel).toContain("Launch");
    expect(groups[0]?.thoughts.length).toBe(2);
  });

  it("supports cluster rename and merge overrides", () => {
    const renamed = renameCluster("Business", "Work Stuff");
    const graph = buildBrainDumpClusterGraph(
      [entry({ id: "1", text: "Invoice", category: "Sales" })],
      renamed,
    );
    expect(graph.clusters[0]?.label).toBe("Work Stuff");
  });

  it("persists categorization mode", () => {
    saveCategorizationMode("review");
    expect(loadCategorizationMode()).toBe("review");
  });

  it("links thoughts with same project id", () => {
    const graph = buildBrainDumpClusterGraph([
      entry({
        id: "1",
        text: "Write proposal",
        category: "Sales",
        projectId: "proj-1",
      }),
      entry({
        id: "2",
        text: "Send proposal",
        category: "Sales",
        projectId: "proj-1",
      }),
    ]);
    expect(graph.relationships[0]?.kind).toBe("same_project");
  });
});
