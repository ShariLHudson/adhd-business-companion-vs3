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
    expect(GARDEN_FLAG_HOVER_AMBIENCE.focus).toContain("east-terrace");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.calming).toContain("RAINMetl");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.unwind).toContain("evening-hearth");
    expect(GARDEN_FLAG_HOVER_AMBIENCE.energize).toContain("bedroom-window");
    expect(GARDEN_FLAG_HOVER_AMBIENCE["my-places"]).toContain("hall-of-reflections");
  });
});
