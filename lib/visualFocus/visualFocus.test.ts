import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  createAndActivateMap,
  createVisualFocusMap,
  getActiveVisualFocusMap,
  clearActiveVisualFocusMapSelection,
  listVisualFocusMaps,
  peekVisualFocusPendingOpen,
  queueVisualFocusOpen,
  consumeVisualFocusOpen,
  saveVisualFocusMap,
} from "./index";

describe("visualFocus workspace", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const sessionMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("creates mind map with meaningful workshop branches", () => {
    const map = createVisualFocusMap("mind-map");
    expect(map.root.label).toBe("Launch Workshop");
    expect(map.root.children.map((c) => c.label)).toContain("Audience");
  });

  it("creates decision tree with seeded outcome path", () => {
    const map = createVisualFocusMap("decision-tree");
    expect(map.root.label).toBe("Hire VA");
    expect(map.root.children[0]?.label).toBe("More Time");
  });

  it("persists maps in local storage", () => {
    createAndActivateMap("project-map");
    expect(listVisualFocusMaps()).toHaveLength(1);
    const map = listVisualFocusMaps()[0]!;
    saveVisualFocusMap({ ...map, title: "Workshop Launch" });
    expect(listVisualFocusMaps()[0]?.title).toBe("Workshop Launch");
  });

  it("seeds purpose anchor as map title and root label", () => {
    const map = createVisualFocusMap("mind-map", "Workshop pricing");
    expect(map.title).toBe("Workshop pricing");
    expect(map.purposeAnchor?.userAnswer).toBe("Workshop pricing");
    expect(map.root.label).toBe("Workshop pricing");
  });

  it("does not imply an open map when no activeMapId is set", () => {
    createAndActivateMap("mind-map", "Map A");
    clearActiveVisualFocusMapSelection();
    expect(getActiveVisualFocusMap()).toBeNull();
    expect(listVisualFocusMaps()).toHaveLength(1);
  });

  it("queues explicit map open without auto-selecting on studio entry", () => {
    const map = createAndActivateMap("relationship-map", "Connections");
    clearActiveVisualFocusMapSelection();
    queueVisualFocusOpen(map.id, true);
    expect(peekVisualFocusPendingOpen()?.mapId).toBe(map.id);
    const consumed = consumeVisualFocusOpen();
    expect(consumed?.mapId).toBe(map.id);
    expect(peekVisualFocusPendingOpen()).toBeNull();
  });
});
