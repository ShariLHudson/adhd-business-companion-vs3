import { describe, expect, it } from "vitest";
import { getEstateGuideSpread } from "@/data/estateGuideSpreads";
import { resolveEstateGuideSpreadBlocks } from "@/lib/estate/estateGuideEditorial";
import {
  resolveBlocksForEstateGuideRoomPage,
  splitSpreadBlocksForTwoPages,
  expandEstateGuideToRoomSpreads,
} from "@/lib/estate/estateGuidePages";
import { ESTATE_GUIDE_SPREADS } from "@/data/estateGuideSpreads";

describe("splitSpreadBlocksForTwoPages", () => {
  it("puts opening sections on page one and the rest on page two", () => {
    const spread = getEstateGuideSpread("butterfly-conservatory");
    expect(spread).toBeDefined();

    const blocks = resolveEstateGuideSpreadBlocks(spread!);
    const { pageOneBlocks, pageTwoBlocks } = splitSpreadBlocksForTwoPages(blocks);

    expect(pageOneBlocks.length).toBeGreaterThan(0);
    expect(pageTwoBlocks.length).toBeGreaterThan(0);
    expect(pageOneBlocks.length + pageTwoBlocks.length).toBe(blocks.length);
    expect(pageOneBlocks[0]?.type).toBe("estate-journals");
    expect(pageTwoBlocks.some((block) => block.type === "before-you-leave")).toBe(
      true,
    );
  });

  it("resolves blocks per flipbook page kind without overlap", () => {
    const spread = getEstateGuideSpread("greenhouse");
    expect(spread).toBeDefined();

    const pageOne = resolveBlocksForEstateGuideRoomPage(spread!, "photo");
    const pageTwo = resolveBlocksForEstateGuideRoomPage(spread!, "text");
    const all = resolveEstateGuideSpreadBlocks(spread!);

    expect(pageOne.length + pageTwo.length).toBe(all.length);
    expect(pageOne.length).toBeGreaterThan(0);
    expect(pageTwo.length).toBeGreaterThan(0);
  });

  it("pairs photo and text pages per room spread", () => {
    const spreads = expandEstateGuideToRoomSpreads(ESTATE_GUIDE_SPREADS);
    expect(spreads.length).toBe(ESTATE_GUIDE_SPREADS.length);
    for (const roomSpread of spreads) {
      expect(roomSpread.photoPage.kind).toBe("photo");
      expect(roomSpread.textPage.kind).toBe("text");
      expect(roomSpread.photoPage.spreadId).toBe(roomSpread.textPage.spreadId);
    }
  });
});
