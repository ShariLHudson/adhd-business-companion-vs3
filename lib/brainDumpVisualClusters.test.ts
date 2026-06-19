import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  buildBrainDumpClusterGraph,
  MAX_MAJOR_CLUSTERS,
  toneForEntry,
} from "./brainDumpClusterModel";
import {
  buildBrainDumpExportSvg,
  exportBrainDumpVisualPdf,
} from "./brainDumpCanvasExport";
import {
  loadBrainDumpVisualVisible,
  saveBrainDumpVisualView,
  loadBrainDumpVisualView,
} from "./brainDumpVisualPreference";
import type { BrainDumpEntry } from "./companionStore";
import { truncateItem } from "./visualThinkingEngine";

function entry(
  partial: Partial<BrainDumpEntry> & { text: string; id: string },
): BrainDumpEntry {
  return {
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("Clear My Mind visual clusters", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const localMem = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    };
    vi.stubGlobal("localStorage", localStorage);
    vi.stubGlobal("window", { localStorage });
  });

  it("thoughts cluster automatically by category group", () => {
    const graph = buildBrainDumpClusterGraph([
      entry({ id: "1", text: "Post on LinkedIn", category: "Marketing" }),
      entry({ id: "2", text: "Update pricing page", category: "Sales" }),
      entry({ id: "3", text: "Kids pickup", category: "Family" }),
    ]);
    expect(graph.hasContent).toBe(true);
    expect(graph.clusters.length).toBeGreaterThanOrEqual(2);
    expect(graph.totalThoughts).toBe(3);
  });

  it("new thoughts update clusters", () => {
    const initial = buildBrainDumpClusterGraph([
      entry({ id: "1", text: "Blog post", category: "Marketing" }),
    ]);
    const updated = buildBrainDumpClusterGraph([
      entry({ id: "1", text: "Blog post", category: "Marketing" }),
      entry({ id: "2", text: "Newsletter", category: "Marketing" }),
      entry({ id: "3", text: "Instagram reel", category: "Content" }),
    ]);
    expect(updated.totalThoughts).toBeGreaterThan(initial.totalThoughts);
    const business = updated.clusters.find((c) => c.label === "Business");
    expect(business?.count).toBeGreaterThanOrEqual(2);
  });

  it("cluster counts update and overwhelm flags large groups", () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      entry({
        id: `m-${i}`,
        text: `Marketing task ${i}`,
        category: "Marketing",
      }),
    );
    const graph = buildBrainDumpClusterGraph(entries);
    const business = graph.clusters.find((c) => c.label === "Business");
    expect(business?.count).toBe(10);
    expect(business?.overwhelm).toBe(true);
  });

  it("relationships render when topics overlap", () => {
    const graph = buildBrainDumpClusterGraph([
      entry({
        id: "1",
        text: "Launch website homepage",
        category: "Website / Tech",
        topic: "Launch",
      }),
      entry({
        id: "2",
        text: "Launch marketing email",
        category: "Marketing",
        topic: "Launch",
      }),
    ]);
    expect(graph.relationships.length).toBeGreaterThan(0);
    expect(graph.relationships[0]?.reason).toBe("Launch");
  });

  it("export SVG and PDF work", () => {
    const graph = buildBrainDumpClusterGraph([
      entry({ id: "1", text: "Exercise", category: "Health" }),
    ]);
    const svg = buildBrainDumpExportSvg(graph);
    expect(svg).toContain("<svg");
    expect(svg).toContain("Clear My Mind");
    expect(() => exportBrainDumpVisualPdf(graph, "test.pdf")).not.toThrow();
  });

  it("mobile readability via truncated thought text", () => {
    const long = "x".repeat(100);
    const graph = buildBrainDumpClusterGraph([
      entry({ id: "1", text: long, category: "Admin" }),
    ]);
    const thought = graph.clusters[0]?.subClusters[0]?.visibleThoughts[0]?.text;
    expect(thought!.length).toBeLessThanOrEqual(73);
    expect(truncateItem(long).length).toBeLessThanOrEqual(73);
  });

  it("visual engine reused — tone mapping from entry types", () => {
    expect(toneForEntry(entry({ id: "1", text: "a", contextType: "task" }))).toBe(
      "benefit",
    );
    expect(
      toneForEntry(entry({ id: "2", text: "b", contextType: "urgent" })),
    ).toBe("concern");
    expect(
      toneForEntry(entry({ id: "3", text: "c", contextType: "thought" })),
    ).toBe("idea");
  });

  it("caps major clusters at five", () => {
    const entries = [
      entry({ id: "1", text: "a", category: "Sales" }),
      entry({ id: "2", text: "b", category: "Health" }),
      entry({ id: "3", text: "c", category: "Ideas" }),
      entry({ id: "4", text: "d", category: "Admin" }),
      entry({ id: "5", text: "e", category: "Family" }),
      entry({ id: "6", text: "f", category: "Finance" }),
      entry({ id: "7", text: "g", category: "Content" }),
    ];
    const graph = buildBrainDumpClusterGraph(entries);
    const major = graph.clusters.filter((c) => c.id !== "__more__");
    expect(major.length).toBeLessThanOrEqual(MAX_MAJOR_CLUSTERS);
  });

  it("view preferences persist", () => {
    saveBrainDumpVisualView("infographic");
    expect(loadBrainDumpVisualView()).toBe("infographic");
    expect(loadBrainDumpVisualVisible()).toBe(true);
  });
});
