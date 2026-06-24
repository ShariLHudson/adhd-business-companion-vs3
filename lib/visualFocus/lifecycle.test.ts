import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  archiveVisualFocusMap,
  createAndActivateMap,
  deleteVisualFocusMap,
  listArchivedVisualFocusMaps,
  listSavedVisualFocusMaps,
  listVisualFocusMaps,
  restoreVisualFocusMapVersion,
  saveVisualFocusMapVersion,
  unarchiveVisualFocusMap,
} from "./store";
import { listContinueThinkingMaps } from "./continueThinking";
import { formatVersionLabel, sortVersionsNewestFirst } from "./lifecycle";

describe("visualFocus lifecycle", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("formats version labels with date and suffix", () => {
    expect(formatVersionLabel("2026-06-23T12:00:00.000Z", "Initial Version")).toBe(
      "2026-06-23 Initial Version",
    );
  });

  it("saves timestamped versions", () => {
    const map = createAndActivateMap("mind-map", "Visual Spark Studios");
    const saved = saveVisualFocusMapVersion(map.id, "Initial Version");
    expect(saved?.versions).toHaveLength(1);
    expect(saved?.versions?.[0]?.label).toMatch(/Initial Version/);
    expect(saved?.intentionallySaved).toBe(true);
  });

  it("restores a version and snapshots current state first", () => {
    const map = createAndActivateMap("strategy-map", "Pricing");
    saveVisualFocusMapVersion(map.id, "Initial Version");
    const withChange = saveVisualFocusMapVersion(map.id, "Membership Version");
    const targetId = withChange?.versions?.[0]?.id;
    expect(targetId).toBeTruthy();

    const restored = restoreVisualFocusMapVersion(map.id, targetId!);
    expect(restored?.versions?.length).toBeGreaterThanOrEqual(2);
    expect(
      restored?.versions?.some((v) => v.label.includes("Pre-restore snapshot")),
    ).toBe(true);
  });

  it("archives maps into Saved without Continue Thinking", () => {
    const map = createAndActivateMap("project-map", "Launch plan");
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(true);

    archiveVisualFocusMap(map.id);
    expect(listArchivedVisualFocusMaps()).toHaveLength(1);
    expect(listSavedVisualFocusMaps().some((m) => m.id === map.id)).toBe(true);
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(false);
  });

  it("unarchives maps back to active momentum", () => {
    const map = createAndActivateMap("relationship-map", "Network");
    archiveVisualFocusMap(map.id);
    unarchiveVisualFocusMap(map.id);
    expect(listArchivedVisualFocusMaps()).toHaveLength(0);
    expect(listContinueThinkingMaps().some((m) => m.id === map.id)).toBe(true);
  });

  it("permanently deletes maps from storage", () => {
    const map = createAndActivateMap("decision-tree", "Hire VA");
    deleteVisualFocusMap(map.id);
    expect(listVisualFocusMaps()).toHaveLength(0);
  });

  it("sorts versions newest first", () => {
    const versions = sortVersionsNewestFirst([
      {
        id: "a",
        label: "older",
        savedAt: "2026-01-01T00:00:00.000Z",
        snapshot: { title: "A", mode: "mind-map", root: { id: "r", label: "R", children: [] } },
      },
      {
        id: "b",
        label: "newer",
        savedAt: "2026-06-01T00:00:00.000Z",
        snapshot: { title: "B", mode: "mind-map", root: { id: "r", label: "R", children: [] } },
      },
    ]);
    expect(versions[0]?.id).toBe("b");
  });
});
