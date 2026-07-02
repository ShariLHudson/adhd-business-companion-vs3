import { describe, expect, it } from "vitest";

import {
  clampFocusMinutes,
  parseFocusMinutesFromText,
} from "./focusDuration";

describe("focusDuration", () => {
  it("parses bare minute counts", () => {
    expect(parseFocusMinutesFromText("17")).toBe(17);
    expect(parseFocusMinutesFromText("17 minutes")).toBe(17);
    expect(parseFocusMinutesFromText("17 min")).toBe(17);
    expect(parseFocusMinutesFromText("set a 10 minute timer for me")).toBe(10);
  });

  it("clamps to supported range", () => {
    expect(clampFocusMinutes(0)).toBe(1);
    expect(clampFocusMinutes(500)).toBe(180);
  });
});
