import { describe, expect, it } from "vitest";
import { isFocusSanctuaryFullBleed } from "./focusSanctuary";

describe("isFocusSanctuaryFullBleed", () => {
  it("is true for the Focus hub and workflows", () => {
    expect(
      isFocusSanctuaryFullBleed("focus", {
        activityId: "",
        phase: "browse",
      }),
    ).toBe(true);
    expect(
      isFocusSanctuaryFullBleed("focus", {
        activityId: "first-step-finder",
        phase: "active",
      }),
    ).toBe(true);
  });

  it("is true for guided exercises while an activity runs", () => {
    expect(
      isFocusSanctuaryFullBleed("guided-exercises", {
        activityId: "priority-sort",
        phase: "active",
      }),
    ).toBe(true);
  });

  it("is false for guided exercise browse", () => {
    expect(
      isFocusSanctuaryFullBleed("guided-exercises", {
        activityId: "",
        phase: "browse",
      }),
    ).toBe(false);
  });
});
