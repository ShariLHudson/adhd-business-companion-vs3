import { describe, expect, it } from "vitest";
import {
  DAY_HELP_NEEDS,
  dayHelpNeedOptions,
  formatDayFeeling,
  normalizeDayHelpNeed,
  primaryHelpNeedFromState,
} from "./adjustMyDay";
import type { DayState } from "./companionStore";

describe("adjustMyDay", () => {
  it("lists help needs alphabetically with Other last", () => {
    const labels = dayHelpNeedOptions().map((o) => o.label);
    const sorted = [...DAY_HELP_NEEDS].sort((a, b) => a.localeCompare(b));
    expect(labels.slice(0, -1)).toEqual(sorted);
    expect(labels[labels.length - 1]).toBe("Other");
  });

  it("maps legacy need chips", () => {
    expect(normalizeDayHelpNeed("Focus").selection).toBe("Find Focus");
    expect(normalizeDayHelpNeed("Custom thing").selection).toBe("Other");
    expect(normalizeDayHelpNeed("Custom thing").otherText).toBe("Custom thing");
  });

  it("formats feeling for snapshot", () => {
    const state: DayState = {
      energy: "medium",
      overwhelm: "low",
      needs: ["Find Focus"],
      setAt: new Date().toISOString(),
    };
    expect(formatDayFeeling(state)).toBe("Medium energy · Low overwhelm");
    expect(primaryHelpNeedFromState(state)).toBe("Find Focus");
  });
});
