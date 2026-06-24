import { describe, expect, it } from "vitest";
import { BUSINESS_CANVAS_GLOBAL_GUIDES } from "./canvasGuide";
import {
  BUSINESS_CANVAS_GRID_CELLS,
  BUSINESS_CANVAS_SECTION_COLORS,
} from "./sectionTheme";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";

describe("businessCanvas sectionTheme", () => {
  it("assigns a permanent color to each of the 9 sections", () => {
    expect(BUSINESS_CANVAS_GRID_CELLS).toHaveLength(9);
    for (const id of BUSINESS_CANVAS_SECTION_ORDER) {
      expect(BUSINESS_CANVAS_SECTION_COLORS[id]).toMatch(/^#/);
    }
  });

  it("uses unique grid areas for classic BMC layout", () => {
    const areas = new Set(BUSINESS_CANVAS_GRID_CELLS.map((c) => c.gridArea));
    expect(areas.size).toBeGreaterThanOrEqual(7);
  });

  it("provides global canvas guides instead of per-section repetition", () => {
    expect(BUSINESS_CANVAS_GLOBAL_GUIDES.length).toBeGreaterThanOrEqual(4);
    expect(BUSINESS_CANVAS_GLOBAL_GUIDES.some((g) => /How To Use/i.test(g.title))).toBe(
      true,
    );
  });
});
