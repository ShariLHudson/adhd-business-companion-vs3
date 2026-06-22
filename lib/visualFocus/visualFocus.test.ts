import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  createAndActivateMap,
  createVisualFocusMap,
  listVisualFocusMaps,
  saveVisualFocusMap,
} from "./index";

describe("visualFocus workspace", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("creates mind map templates with branches", () => {
    const map = createVisualFocusMap("mind-map");
    expect(map.root.children.length).toBeGreaterThan(0);
  });

  it("creates decision tree with yes/no paths", () => {
    const map = createVisualFocusMap("decision-tree");
    const labels = map.root.children.map((c) => c.label);
    expect(labels).toContain("Yes");
    expect(labels).toContain("No");
  });

  it("persists maps in local storage", () => {
    createAndActivateMap("project-map");
    expect(listVisualFocusMaps()).toHaveLength(1);
    const map = listVisualFocusMaps()[0]!;
    saveVisualFocusMap({ ...map, title: "Workshop Launch" });
    expect(listVisualFocusMaps()[0]?.title).toBe("Workshop Launch");
  });
});
