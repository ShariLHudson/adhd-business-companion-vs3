import { describe, expect, it } from "vitest";
import {
  DAY_HELP_OPTIONS,
  DAY_VIBE_DROPDOWN_OPTIONS,
  DAY_VIBE_OTHER,
  dayHelpNeedOptions,
  dayStateSummary,
  energyLevelToLegacy,
  formatDayEnergyDisplay,
  formatDayFeeling,
  formatDayMotivationDisplay,
  formatDayVibeDisplay,
  labelForVibe,
  migrateLegacyDayState,
  motivationLevelToLegacyOverwhelm,
  normalizeDayHelpNeed,
  primaryHelpNeedFromState,
} from "./adjustMyDay";
import type { DayState } from "./companionStore";

describe("adjustMyDay", () => {
  it("lists help options in spec order with Other last", () => {
    const labels = dayHelpNeedOptions().map((o) => o.label);
    expect(labels).toEqual(DAY_HELP_OPTIONS.map((o) => o.label));
    expect(labels[labels.length - 1]).toBe("✏️ Other");
  });

  it("maps legacy need chips to new ids", () => {
    expect(normalizeDayHelpNeed("Focus").selection).toBe("focus-session");
    expect(normalizeDayHelpNeed("Custom thing").selection).toBe("other");
    expect(normalizeDayHelpNeed("Custom thing").otherText).toBe("Custom thing");
  });

  it("formats feeling for snapshot with emoji labels", () => {
    const state: DayState = {
      energy: "medium",
      overwhelm: "low",
      energyLevel: "doing-okay",
      motivationLevel: "lets-do-this",
      needs: ["focus-session"],
      setAt: new Date().toISOString(),
    };
    expect(formatDayFeeling(state)).toBe("🙂 Doing Okay · ✨ Let's Do This");
    expect(formatDayEnergyDisplay(state)).toBe("🙂 Doing Okay");
    expect(formatDayMotivationDisplay(state)).toBe("✨ Let's Do This");
    expect(primaryHelpNeedFromState(state)).toBe("🎯 Focus Session");
  });

  it("lists vibe dropdown options with Other last", () => {
    const labels = DAY_VIBE_DROPDOWN_OPTIONS.map((o) => o.label);
    expect(labels).toEqual([
      "Feeling good",
      "Doing okay",
      "Mixed bag",
      "Struggling a bit",
      "Rough day",
      "Other",
    ]);
    expect(DAY_VIBE_DROPDOWN_OPTIONS[labels.length - 1]?.id).toBe(DAY_VIBE_OTHER);
  });

  it("uses custom text for Other vibe in display and summary", () => {
    const state: DayState = {
      energy: "medium",
      overwhelm: "medium",
      energyLevel: "doing-okay",
      motivationLevel: "get-it-done",
      vibe: "other",
      vibeNote: "Quiet but focused",
      needs: [],
      setAt: new Date().toISOString(),
    };
    expect(labelForVibe("other", "Quiet but focused")).toBe("Quiet but focused");
    expect(labelForVibe("other")).toBe("Other");
    expect(formatDayVibeDisplay(state)).toBe("Quiet but focused");
    expect(dayStateSummary(state)).toContain("Vibe: Quiet but focused.");
  });

  it("migrates legacy day state", () => {
    const legacy: DayState = {
      energy: "high",
      overwhelm: "high",
      needs: ["Brain Dump"],
      setAt: new Date().toISOString(),
    };
    const migrated = migrateLegacyDayState(legacy);
    expect(migrated.energyLevel).toBe("full-tank");
    expect(migrated.motivationLevel).toBe("dragging");
    expect(energyLevelToLegacy("full-tank")).toBe("high");
    expect(motivationLevelToLegacyOverwhelm("dragging")).toBe("high");
    expect(primaryHelpNeedFromState(migrated)).toBe("🧠 Brain Dump");
  });

  it("builds day state summary for Shari context", () => {
    const state: DayState = {
      energy: "medium",
      overwhelm: "medium",
      energyLevel: "ready-to-roll",
      motivationLevel: "need-push",
      vibe: "mixed-bag",
      needs: ["make-a-plan"],
      note: "Big meeting at 3.",
      setAt: new Date().toISOString(),
    };
    const summary = dayStateSummary(state);
    expect(summary).toContain("😊 Ready To Roll");
    expect(summary).toContain("🤷 Need A Little Push");
    expect(summary).toContain("😐 Mixed Bag");
    expect(summary).toContain("📋 Make A Plan");
    expect(summary).toContain("Big meeting at 3.");
  });

  it("omits help line from summary when user skipped help need", () => {
    const state: DayState = {
      energy: "medium",
      overwhelm: "medium",
      energyLevel: "doing-okay",
      motivationLevel: "get-it-done",
      needs: [],
      setAt: new Date().toISOString(),
    };
    const summary = dayStateSummary(state);
    expect(summary).not.toContain("Would help most");
    expect(summary).toContain("Energy:");
    expect(summary).toContain("Motivation:");
  });
});
