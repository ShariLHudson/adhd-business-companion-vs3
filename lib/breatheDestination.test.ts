import { describe, expect, it } from "vitest";
import {
  BREATHE_DESTINATION_FADE_MS,
  EMPTY_BREATHE_DESTINATION,
  isBreatheDestinationActive,
} from "./breatheDestination";

describe("breatheDestination", () => {
  it("fade duration stays within 250–400 ms", () => {
    expect(BREATHE_DESTINATION_FADE_MS).toBeGreaterThanOrEqual(250);
    expect(BREATHE_DESTINATION_FADE_MS).toBeLessThanOrEqual(400);
  });

  it("detects active destination phases", () => {
    expect(isBreatheDestinationActive(EMPTY_BREATHE_DESTINATION)).toBe(false);
    expect(
      isBreatheDestinationActive({ ...EMPTY_BREATHE_DESTINATION, phase: "entering" }),
    ).toBe(true);
    expect(
      isBreatheDestinationActive({ ...EMPTY_BREATHE_DESTINATION, phase: "active" }),
    ).toBe(true);
    expect(
      isBreatheDestinationActive({ ...EMPTY_BREATHE_DESTINATION, phase: "exiting" }),
    ).toBe(true);
  });
});
