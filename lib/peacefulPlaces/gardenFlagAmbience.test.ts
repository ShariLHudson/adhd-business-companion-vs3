import { describe, expect, it } from "vitest";
import { GARDEN_FLAG_HOVER_AMBIENCE } from "./gardenFlagAmbience";

describe("GARDEN_FLAG_HOVER_AMBIENCE", () => {
  it("maps every garden flag to an owned mp3 loop", () => {
    const ids = ["focus", "calming", "unwind", "energize", "my-places"] as const;
    for (const id of ids) {
      const url = GARDEN_FLAG_HOVER_AMBIENCE[id];
      expect(url).toMatch(/\.mp3$/);
      expect(url.startsWith("http")).toBe(false);
    }
  });

  it("uses distinct emotional previews per destination", () => {
    expect(GARDEN_FLAG_HOVER_AMBIENCE.focus).toContain("morning-whisper");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.calming).toContain("gentle_rain_on_a_tin");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.unwind).toContain("evening-hearth");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.energize).toContain("nightime-melody");
    expect(GARDEN_FLAG_HOVER_AMBIENCE["my-places"]).toContain("hall-of-reflections");
    // Distinct destinations must never share a preview loop.
    const values = Object.values(GARDEN_FLAG_HOVER_AMBIENCE);
    expect(new Set(values).size).toBe(values.length);
  });
});
