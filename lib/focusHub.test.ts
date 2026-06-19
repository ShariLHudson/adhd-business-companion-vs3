import { describe, expect, it } from "vitest";
import {
  allFocusHubTools,
  distinctRecommendedOutcomes,
  FOCUS_FEELING_ENTRIES,
  focusHubOpensSidebarTool,
  missingRequiredFocusAssets,
  recommendedToolForFeeling,
} from "./focusHub";
import { FOCUS_MENU } from "./companionUi";

describe("Focus V2 — feelings first, tools second", () => {
  it("shows four emotional entry points on the home screen", () => {
    expect(FOCUS_FEELING_ENTRIES).toHaveLength(4);
    expect(FOCUS_FEELING_ENTRIES.map((f) => f.label)).toEqual([
      "My Brain Feels Crowded",
      "I'm Stuck",
      "I Need To Work",
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

  it("reaches Energize Audio", () => {
    expect(allFocusHubTools().some((t) => t.id === "energize-audio")).toBe(true);
  });

  it("reaches Sleep Audio", () => {
    expect(allFocusHubTools().some((t) => t.id === "sleep-audio")).toBe(true);
  });

  it("reaches Brain Break Games", () => {
    expect(allFocusHubTools().some((t) => t.id === "brain-break-games")).toBe(true);
  });

  it("reaches Body Double", () => {
    expect(allFocusHubTools().some((t) => t.id === "body-double")).toBe(true);
  });

  it("recommends Clear My Mind for Brain Feels Crowded", () => {
    expect(recommendedToolForFeeling("crowded")?.id).toBe("clear-my-mind");
  });

  it("recommends Next Small Step for I'm Stuck", () => {
    expect(recommendedToolForFeeling("stuck")?.id).toBe("next-small-step");
  });

  it("recommends Continue Active Project for I Need To Work", () => {
    expect(recommendedToolForFeeling("need-work")?.id).toBe("continue-active-project");
  });

  it("recommends Breathe & Reset for I Need A Break", () => {
    expect(recommendedToolForFeeling("need-break")?.id).toBe("breathe-reset");
  });

  it("gives each feeling a distinct recommended outcome", () => {
    expect(distinctRecommendedOutcomes()).toBe(true);
  });

  it("keeps legacy FOCUS_MENU sidebar tools reachable from the hub", () => {
    const legacyTools = FOCUS_MENU.flatMap((node) =>
      node.kind === "leaf" ? [node.tool] : node.children.map((c) => c.tool),
    );
    for (const tool of legacyTools) {
      expect(focusHubOpensSidebarTool(tool)).toBe(true);
    }
  });
});
