import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  CONTINUE_THINKING_MAX,
  listContinueThinkingMaps,
} from "./continueThinking";
import {
  createAndActivateMap,
  listPinnedVisualFocusMaps,
  listSavedVisualFocusMaps,
  saveVisualFocusMapToDestination,
  togglePinVisualFocusMap,
  archiveVisualFocusMap,
} from "./store";

describe("continueThinking", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("returns at most three non-pinned maps by recency", () => {
    for (let i = 0; i < 5; i++) {
      const map = createAndActivateMap("mind-map", `Map ${i}`);
      saveVisualFocusMapToDestination(map.id, "visual-thinking");
    }
    expect(listContinueThinkingMaps()).toHaveLength(CONTINUE_THINKING_MAX);
  });

  it("excludes pinned maps from continue thinking", () => {
    const map = createAndActivateMap("relationship-map", "Business Connections");
    togglePinVisualFocusMap(map.id);
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(false);
    expect(listPinnedVisualFocusMaps()).toHaveLength(1);
  });

  it("tracks intentionally saved maps separately from momentum", () => {
    const map = createAndActivateMap("decision-tree", "Hire A Salesperson");
    expect(listSavedVisualFocusMaps()).toHaveLength(0);
    saveVisualFocusMapToDestination(map.id, "visual-thinking");
    expect(listSavedVisualFocusMaps()).toHaveLength(1);
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(true);
  });

  it("excludes archived maps from continue thinking", () => {
    const map = createAndActivateMap("strategy-map", "Growth path");
    archiveVisualFocusMap(map.id);
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(false);
    expect(listSavedVisualFocusMaps().some((m) => m.id === map.id)).toBe(true);
  });
});
