import { describe, expect, it } from "vitest";
import {
  pageWatermarkIdForIndex,
  pageWatermarkUrlForIndex,
} from "./pageWatermarks";

describe("pageWatermarks", () => {
  it("rotates journey topic marks across pages", () => {
    expect(pageWatermarkIdForIndex(0)).toBe("journey-path");
    expect(pageWatermarkIdForIndex(1)).toBe("journey-dawn");
    expect(pageWatermarkIdForIndex(4)).toBe("journey-path");
  });

  it("uses prayer verse and light marks — not Estate places", () => {
    expect(pageWatermarkIdForIndex(0, "prayer")).toBe("prayer-be-still");
    expect(pageWatermarkIdForIndex(1, "prayer")).toBe("prayer-peace");
    expect(pageWatermarkUrlForIndex(0, "prayer")).toBe(
      "/images/journal-gazebo/topic-watermarks/prayer-be-still.png",
    );
  });

  it("uses gratitude topic marks", () => {
    expect(pageWatermarkIdForIndex(0, "gratitude")).toBe("gratitude-enough");
    expect(pageWatermarkUrlForIndex(0, "gratitude")).toContain("topic-watermarks");
    expect(pageWatermarkUrlForIndex(0, "gratitude")).not.toContain("page-watermarks/");
  });
});
