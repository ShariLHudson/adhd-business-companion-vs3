import { describe, expect, it } from "vitest";
import {
  allFocusHubTools,
  distinctRecommendedOutcomes,
  FOCUS_FEELING_ENTRIES,
  focusHubOpensSidebarTool,
  missingRequiredFocusAssets,
  recommendedToolForFeeling,
} from "./focusHub";

describe("Focus V2 — feelings first, tools second", () => {
  it("shows two emotional entry points on the home screen", () => {
    expect(FOCUS_FEELING_ENTRIES).toHaveLength(2);
    expect(FOCUS_FEELING_ENTRIES.map((f) => f.label)).toEqual([
      "I'm Stuck",
      "I Need A Break",
    ]);
  });

  it("keeps all required focus assets reachable", () => {
    expect(missingRequiredFocusAssets()).toEqual([]);
  });

  it("reaches Focus Audio", () => {
    expect(allFocusHubTools().some((t) => t.id === "focus-audio")).toBe(true);
  });

  it("reaches Calm Audio", () => {
    expect(allFocusHubTools().some((t) => t.id === "calm-audio")).toBe(true);
  });

  it("reaches Sleep Audio", () => {
    expect(allFocusHubTools().some((t) => t.id === "sleep-audio")).toBe(true);
  });

  it("reaches Brain Break Games", () => {
    expect(allFocusHubTools().some((t) => t.id === "brain-break-games")).toBe(true);
  });

  it("recommends Next Small Step for I'm Stuck", () => {
    expect(recommendedToolForFeeling("stuck")?.id).toBe("next-small-step");
  });

  it("recommends Breathe & Reset for I Need A Break", () => {
    expect(recommendedToolForFeeling("need-break")?.id).toBe("breathe-reset");
  });

  it("offers distinct break paths without duplicate breathe options", () => {
    const breakTools = allFocusHubTools().filter((t) =>
      ["breathe-reset", "stretch-break", "calm-moment"].includes(t.id),
    );
    expect(breakTools.map((t) => t.id)).toEqual([
      "breathe-reset",
      "stretch-break",
      "calm-moment",
    ]);
    expect(allFocusHubTools().some((t) => t.id === "quick-reset")).toBe(false);
  });

  it("gives each feeling a distinct recommended outcome", () => {
    expect(distinctRecommendedOutcomes()).toBe(true);
  });

  it("keeps core Focus menu tools reachable from the hub", () => {
    const coreTools = ["breathe", "focus-audio"] as const;
    for (const tool of coreTools) {
      expect(focusHubOpensSidebarTool(tool)).toBe(true);
    }
  });
});
