import { describe, expect, it } from "vitest";
import { FOCUS_SETUP_STEPS, focusDebriefMessage } from "./focusSession";

describe("focusSession", () => {
  it("has four guided setup steps", () => {
    expect(FOCUS_SETUP_STEPS.map((s) => s.id)).toEqual([
      "focus",
      "done-enough",
      "prep",
      "duration",
    ]);
  });

  it("returns debrief copy for each outcome", () => {
    expect(focusDebriefMessage("done")).toContain("closed the loop");
    expect(focusDebriefMessage("stuck")).toContain("stuck");
  });
});
