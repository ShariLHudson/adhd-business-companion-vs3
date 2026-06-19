import { describe, expect, it } from "vitest";
import {
  SURFACE_AUTOMATIC_LOOP_OFFERS,
  SURFACE_AUTOMATIC_RECOVERY_OFFERS,
} from "./interventionPolicy";

describe("interventionPolicy", () => {
  it("disables automatic recovery / lighter-day offer cards", () => {
    expect(SURFACE_AUTOMATIC_RECOVERY_OFFERS).toBe(false);
  });

  it("disables automatic thought-loop / close-the-loop offer cards", () => {
    expect(SURFACE_AUTOMATIC_LOOP_OFFERS).toBe(false);
  });
});
