import { describe, expect, it } from "vitest";
import {
  DESTINATION_CRYSTAL_HIT_AREAS,
  DESTINATION_GALLERY_IMAGE_ASPECT,
  crystalAriaLabel,
  crystalHitAreaFor,
} from "./crystalLayout";

describe("destination gallery crystal layout", () => {
  it("defines six pillar hit areas with stable IDs", () => {
    expect(DESTINATION_CRYSTAL_HIT_AREAS.map((a) => a.id)).toEqual([
      "schedule",
      "write",
      "save",
      "spark-social-media",
      "print",
      "create",
    ]);
  });

  it("keeps hit areas inside the artwork frame", () => {
    expect(DESTINATION_GALLERY_IMAGE_ASPECT).toBeCloseTo(1.5, 5);
    for (const area of DESTINATION_CRYSTAL_HIT_AREAS) {
      const left = parseFloat(area.left);
      const top = parseFloat(area.top);
      const width = parseFloat(area.width);
      const height = parseFloat(area.height);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(left + width).toBeLessThanOrEqual(100);
      expect(top + height).toBeLessThanOrEqual(100);
    }
  });

  it("builds Open … destination aria labels without requiring overlay text", () => {
    const schedule = crystalHitAreaFor("schedule");
    expect(schedule).toBeTruthy();
    expect(crystalAriaLabel(schedule!)).toBe("Open Schedule destination");
    expect(crystalHitAreaFor("write")?.artworkLabel).toBe("Write");
    expect(crystalAriaLabel(crystalHitAreaFor("write")!)).toBe(
      "Open Document destination",
    );
    expect(crystalHitAreaFor("create")?.artworkLabel).toBe("Create");
    expect(crystalAriaLabel(crystalHitAreaFor("create")!)).toBe(
      "Open Design destination",
    );
  });
});
