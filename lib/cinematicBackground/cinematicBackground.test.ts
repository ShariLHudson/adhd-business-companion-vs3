import { describe, expect, it } from "vitest";
import {
  CINEMATIC_PRESETS,
  cinematicFramingToCssVars,
  resolveCinematicPreset,
} from "./presets";

describe("cinematic background presets", () => {
  it("defaults to minimal watermark crop scale", () => {
    expect(resolveCinematicPreset("default").scale).toBe(1.05);
  });

  it("never exceeds maximum crop scale", () => {
    for (const preset of Object.values(CINEMATIC_PRESETS)) {
      expect(preset.scale).toBeLessThanOrEqual(1.08);
      expect(preset.scale).toBeGreaterThanOrEqual(1.05);
    }
  });

  it("exports css variables for per-scene tuning", () => {
    const vars = cinematicFramingToCssVars(resolveCinematicPreset("clear-my-mind"));
    expect(vars["--video-scale"]).toBe("1.06");
    expect(vars["--video-position"]).toBe("center 45%");
  });
});
