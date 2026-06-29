import { describe, expect, it } from "vitest";
import {
  homesteadSceneDataAttributes,
  resolveHomesteadSceneState,
} from "./resolveHomesteadSceneState";

describe("homesteadScene", () => {
  it("exposes welcome-compatible scene attributes", () => {
    const state = resolveHomesteadSceneState({ now: new Date("2026-06-15T10:30:00") });
    const attrs = homesteadSceneDataAttributes(state);
    expect(attrs["data-homestead-scene"]).toBe("");
    expect(attrs["data-homestead-period"]).toBeTruthy();
    expect(attrs["data-time-of-day"]).toBe("morning");
    expect(attrs["data-season"]).toBeTruthy();
    expect(attrs["data-weather"]).toBeTruthy();
  });

  it("uses evening lighting in the evening", () => {
    const state = resolveHomesteadSceneState({ now: new Date("2026-06-15T19:30:00") });
    expect(state.timeOfDay).toBe("evening");
    expect(["evening", "golden-hour", "night"]).toContain(state.homesteadPeriod);
  });
});
