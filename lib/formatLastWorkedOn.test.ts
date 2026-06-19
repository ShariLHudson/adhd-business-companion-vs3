import { describe, expect, it } from "vitest";
import { formatLastWorkedOn } from "./formatLastWorkedOn";

describe("formatLastWorkedOn", () => {
  it("labels yesterday", () => {
    const now = new Date(2026, 5, 12, 12, 0, 0);
    const worked = new Date(2026, 5, 11, 18, 0, 0);
    expect(formatLastWorkedOn(worked.toISOString(), now)).toBe(
      "Last worked on yesterday",
    );
  });

  it("labels today", () => {
    const now = new Date(2026, 5, 12, 20, 0, 0);
    const worked = new Date(2026, 5, 12, 8, 0, 0);
    expect(formatLastWorkedOn(worked.toISOString(), now)).toBe(
      "Last worked on today",
    );
  });
});
