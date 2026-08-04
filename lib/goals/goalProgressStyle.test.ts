import { describe, expect, it } from "vitest";
import {
  getGoalProgressStyle,
  goalProgressStyleLabel,
  normalizeGoalProgressStyle,
} from "./goalProgressStyle";

describe("goalProgressStyle P0.53", () => {
  it("normalizes unknown values to progress bars", () => {
    expect(normalizeGoalProgressStyle(undefined)).toBe("progress-bars");
    expect(normalizeGoalProgressStyle("invalid")).toBe("progress-bars");
    expect(normalizeGoalProgressStyle("donut")).toBe("donut");
  });

  it("labels every style for Settings", () => {
    expect(goalProgressStyleLabel("circular")).toBe("Circular Progress");
    expect(goalProgressStyleLabel("compact-numbers")).toBe(
      "Compact Numbers Only",
    );
  });

  it("reads style from prefs", () => {
    expect(typeof getGoalProgressStyle()).toBe("string");
  });
});
