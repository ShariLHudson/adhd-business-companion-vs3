/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import {
  formatCategoryProgressLine,
  isWorkshopMapFullUnlocked,
  noteWorkshopMapVisit,
  ORGANIZE_MAP_SECTION_THRESHOLD,
  readWorkshopMapModePreference,
  resolveFocusModeSectionIds,
  WORKSHOP_MAP_FAMILIARITY_KEY,
  WORKSHOP_MAP_MODE_STORAGE_KEY,
  writeWorkshopMapModePreference,
} from "./workshopMapModes";
import { shouldUseGroupedMap } from "@/lib/universalWorkEngine/blueprints/mapGrouping";
import { EVENT_PLAN_MAP_GROUPS } from "@/lib/universalWorkEngine/packages/eventPlan/eventPlanMapGroups";
import { CREATE_ONE_FOCUS_PRINCIPLE } from "./copy";

describe("127 workshop map modes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("organizes maps when section count exceeds 5", () => {
    expect(ORGANIZE_MAP_SECTION_THRESHOLD).toBe(6);
    expect(
      shouldUseGroupedMap(6, {
        threshold: ORGANIZE_MAP_SECTION_THRESHOLD,
        groups: EVENT_PLAN_MAP_GROUPS,
      }),
    ).toBe(true);
    expect(
      shouldUseGroupedMap(5, {
        threshold: ORGANIZE_MAP_SECTION_THRESHOLD,
        groups: EVENT_PLAN_MAP_GROUPS,
      }),
    ).toBe(false);
  });

  it("Focus Mode returns current + next two incomplete sections", () => {
    const ids = resolveFocusModeSectionIds({
      orderedSectionIds: ["a", "b", "c", "d", "e"],
      activeSectionId: "b",
      isComplete: (id) => id === "a",
    });
    expect(ids).toEqual(["b", "c", "d"]);
  });

  it("formats calm category progress", () => {
    expect(
      formatCategoryProgressLine({
        title: "Planning",
        completedCount: 2,
        totalCount: 6,
      }),
    ).toBe("Planning — 2 of 6 complete");
  });

  it("defaults to Focus Mode and persists preference", () => {
    expect(readWorkshopMapModePreference()).toBe("focus");
    writeWorkshopMapModePreference("organized");
    expect(localStorage.getItem(WORKSHOP_MAP_MODE_STORAGE_KEY)).toBe(
      "organized",
    );
    expect(readWorkshopMapModePreference()).toBe("organized");
  });

  it("Full Map starts locked; selecting organized/full unlocks it", () => {
    expect(isWorkshopMapFullUnlocked()).toBe(false);
    writeWorkshopMapModePreference("organized");
    expect(isWorkshopMapFullUnlocked()).toBe(true);
  });

  it("unlocks Full Map after repeated visits", () => {
    noteWorkshopMapVisit();
    noteWorkshopMapVisit();
    expect(isWorkshopMapFullUnlocked()).toBe(false);
    noteWorkshopMapVisit();
    expect(isWorkshopMapFullUnlocked()).toBe(true);
    expect(localStorage.getItem(WORKSHOP_MAP_FAMILIARITY_KEY)).toBeTruthy();
  });

  it("uses human-meaning event categories", () => {
    const titles = EVENT_PLAN_MAP_GROUPS.map((g) => g.title);
    expect(titles).toContain("Foundation");
    expect(titles).toContain("Venue & Budget");
    expect(titles).toContain("Marketing");
    expect(titles).toContain("Delivery");
    expect(titles).toContain("Follow-Up");
    expect(titles.join(" ")).not.toMatch(/Section Group|Phase 1|Template Group/i);
  });

  it("exports the one-focus governing principle", () => {
    expect(CREATE_ONE_FOCUS_PRINCIPLE).toMatch(/One question/i);
  });
});
