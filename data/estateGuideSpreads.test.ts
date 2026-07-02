import { describe, expect, it } from "vitest";
import {
  ESTATE_GUIDE_SPREADS,
  getEstateGuideSpread,
  listEstateGuideSpreadIds,
} from "@/data/estateGuideSpreads";
import {
  ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES,
  validateEstateGuideSpread,
} from "@/lib/estate/estateGuideEditorial";

describe("estateGuideSpreads", () => {
  it("includes estate-library preview spread with editorial blocks", () => {
    const spread = getEstateGuideSpread("estate-library");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Library");
    expect(spread!.leftBlocks.length).toBeGreaterThan(0);
    expect(spread!.rightBlocks.length).toBeGreaterThan(0);
    expect(
      spread!.leftBlocks.some((block) => block.type === "around-the-estate"),
    ).toBe(true);
    expect(
      spread!.rightBlocks.some(
        (block) => block.type === "leave-remembering-one-thing",
      ),
    ).toBe(true);
  });

  it("lists all spread ids", () => {
    expect(listEstateGuideSpreadIds()).toEqual(
      ESTATE_GUIDE_SPREADS.map((s) => s.id),
    );
  });

  it("returns undefined for unknown id", () => {
    expect(getEstateGuideSpread("unknown-room")).toBeUndefined();
  });

  it("validates all spreads without errors", () => {
    for (const spread of ESTATE_GUIDE_SPREADS) {
      expect(validateEstateGuideSpread(spread)).toEqual([]);
    }
  });

  it("uses varied block compositions across spreads", () => {
    const leftCounts = ESTATE_GUIDE_SPREADS.map((s) => s.leftBlocks.length);
    const rightCounts = ESTATE_GUIDE_SPREADS.map((s) => s.rightBlocks.length);
    expect(new Set(leftCounts).size).toBeGreaterThan(1);
    expect(new Set(rightCounts).size).toBeGreaterThan(1);
  });
});

describe("estateGuideEditorial", () => {
  it("defines eight editorial block types", () => {
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toHaveLength(8);
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toContain("estate-saying");
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toContain(
      "leave-remembering-one-thing",
    );
  });
});
