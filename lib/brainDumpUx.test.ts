import { describe, expect, it, vi, beforeEach } from "vitest";
import { groupRelationshipsByTheme } from "./brainDumpClusterModel";
import {
  loadCustomBrainDumpCategories,
  saveCustomBrainDumpCategory,
} from "./brainDumpCustomCategories";

describe("groupRelationshipsByTheme", () => {
  it("groups pairwise relationships into theme cards with bullet thoughts", () => {
    const themes = groupRelationshipsByTheme([
      {
        fromId: "a",
        toId: "b",
        fromLabel: "Finish newsletter",
        toLabel: "Text Izna",
        reason: "Marketing",
      },
      {
        fromId: "b",
        toId: "c",
        fromLabel: "Text Izna",
        toLabel: "Update website",
        reason: "Marketing",
      },
    ]);

    expect(themes).toHaveLength(1);
    expect(themes[0]!.themeLabel).toBe("Marketing theme");
    expect(themes[0]!.thoughts).toEqual(
      expect.arrayContaining([
        "Finish newsletter",
        "Text Izna",
        "Update website",
      ]),
    );
    expect(themes[0]!.observation).toMatch(/Several thoughts relate to marketing/i);
  });
});

describe("brainDumpCustomCategories", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("persists new custom categories", () => {
    const saved = saveCustomBrainDumpCategory("Side Projects");
    expect(saved).toBe("Side Projects");
    expect(loadCustomBrainDumpCategories()).toContain("Side Projects");
  });

  it("dedupes categories case-insensitively", () => {
    saveCustomBrainDumpCategory("Side Projects");
    const again = saveCustomBrainDumpCategory("side projects");
    expect(again).toBe("Side Projects");
    expect(loadCustomBrainDumpCategories()).toHaveLength(1);
  });
});
