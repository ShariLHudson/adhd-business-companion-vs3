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
import { expandEstateGuideToBookPages, expandEstateGuideToRoomSpreads } from "@/lib/estate/estateGuidePages";

describe("estateGuideSpreads", () => {
  it("includes summer terrace with waterfall and outdoor pavilion sections", () => {
    const spread = getEstateGuideSpread("summer-terrace");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Summer Terrace");
    expect(spread!.blocks.some((block) => block.type === "summer-evenings")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "outdoor-pavilion")).toBe(
      true,
    );
    expect(
      spread!.blocks.some((block) => block.type === "summer-terrace-could-speak"),
    ).toBe(true);
  });

  it("includes momentum room with cabinet of small steps and drawer tradition", () => {
    const spread = getEstateGuideSpread("momentum-room");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Momentum Room");
    expect(
      spread!.blocks.some((block) => block.type === "cabinet-of-small-steps"),
    ).toBe(true);
    expect(
      spread!.blocks.some((block) => block.type === "mathematics-of-momentum"),
    ).toBe(true);
  });

  it("includes study hall with blackboard and learning philosophy sections", () => {
    const spread = getEstateGuideSpread("study-hall");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Study Hall");
    expect(spread!.blocks.some((block) => block.type === "the-blackboard")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "learning-philosophy")).toBe(
      true,
    );
  });

  it("includes reflection pond with waterfall and bench sections", () => {
    const spread = getEstateGuideSpread("reflection-pond");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Reflection Pond");
    expect(spread!.blocks.some((block) => block.type === "the-waterfall")).toBe(
      true,
    );
    expect(
      spread!.blocks.some((block) => block.type === "reflection-pond-could-speak"),
    ).toBe(true);
  });

  it("includes spark stables with horses and old estate legend sections", () => {
    const spread = getEstateGuideSpread("stables");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Spark Stables");
    expect(spread!.blocks.some((block) => block.type === "the-horses")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "stables-could-speak")).toBe(
      true,
    );
  });

  it("includes spark estate with front gates and fountain sections", () => {
    const spread = getEstateGuideSpread("spark-estate");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Spark Estate");
    expect(spread!.blocks.some((block) => block.type === "front-gates")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "the-fountain")).toBe(
      true,
    );
  });

  it("includes stairway reading nook with hidden library and legendary chair", () => {
    const spread = getEstateGuideSpread("stairway-reading-nook");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Stairway Reading Nook");
    expect(spread!.blocks.some((block) => block.type === "hidden-library")).toBe(
      true,
    );
    expect(
      spread!.blocks.some((block) => block.type === "shelves-could-speak"),
    ).toBe(true);
  });

  it("includes reading nook with the window and books that have lingered sections", () => {
    const spread = getEstateGuideSpread("reading-nooks");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Reading Nook");
    expect(spread!.blocks.some((block) => block.type === "the-window")).toBe(true);
    expect(
      spread!.blocks.some((block) => block.type === "books-that-have-lingered"),
    ).toBe(true);
  });

  it("includes personal deck with sunset ritual and view could speak sections", () => {
    const spread = getEstateGuideSpread("personal-deck");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Personal Deck");
    expect(
      spread!.blocks.some((block) => block.type === "room-without-expectations"),
    ).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "sunset-ritual")).toBe(
      true,
    );
  });

  it("includes observatory with circle room and reflections beneath the dome", () => {
    const spread = getEstateGuideSpread("observatory");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Observatory");
    expect(
      spread!.blocks.some((block) => block.type === "more-than-a-telescope"),
    ).toBe(true);
    expect(
      spread!.blocks.some((block) => block.type === "reflections-beneath-the-dome"),
    ).toBe(true);
  });

  it("includes welcome home with front entrance and doors could speak sections", () => {
    const spread = getEstateGuideSpread("welcome-home");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Welcome Home");
    expect(spread!.blocks[0]?.type).toBe("estate-journals");
    expect(spread!.blocks.some((block) => block.type === "front-entrance")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "doors-could-speak")).toBe(
      true,
    );
  });

  it("includes butterfly conservatory with journal template blocks", () => {
    const spread = getEstateGuideSpread("butterfly-conservatory");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Butterfly Conservatory");
    expect(spread!.blocks[0]?.type).toBe("estate-journals");
    expect(spread!.blocks.some((block) => block.type === "before-you-leave")).toBe(
      true,
    );
  });

  it("includes fireside deck with fire that never rushes section", () => {
    const spread = getEstateGuideSpread("fireside-deck");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Fireside Deck");
    expect(
      spread!.blocks.some((block) => block.type === "fire-that-never-rushes"),
    ).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "stones-could-talk")).toBe(
      true,
    );
  });

  it("includes lakeside hammock with great oak and branches could speak sections", () => {
    const spread = getEstateGuideSpread("lakeside-hammock");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Lakeside Hammock");
    expect(spread!.blocks.some((block) => block.type === "great-oak")).toBe(true);
    expect(
      spread!.blocks.some((block) => block.type === "branches-could-speak"),
    ).toBe(true);
  });

  it("includes estate kitchen with marble island and copper hearth sections", () => {
    const spread = getEstateGuideSpread("estate-kitchen");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Estate Kitchen");
    expect(spread!.blocks.some((block) => block.type === "marble-island")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "cooks-notebook")).toBe(
      true,
    );
  });

  it("includes game room with five minute rule and why we play sections", () => {
    const spread = getEstateGuideSpread("game-room");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Game Room");
    expect(spread!.blocks.some((block) => block.type === "five-minute-rule")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "why-we-play")).toBe(
      true,
    );
  });

  it("includes gallery of firsts with every frame holds a beginning section", () => {
    const spread = getEstateGuideSpread("gallery-of-firsts");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Gallery of Firsts");
    expect(
      spread!.blocks.some((block) => block.type === "every-frame-holds-a-beginning"),
    ).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "a-final-note")).toBe(
      true,
    );
  });

  it("includes evidence vault with shelves of life section", () => {
    const spread = getEstateGuideSpread("evidence-vault");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Evidence Vault");
    expect(spread!.blocks.some((block) => block.type === "shelves-of-life")).toBe(
      true,
    );
    expect(
      spread!.blocks.some((block) => block.type === "why-this-room-exists"),
    ).toBe(true);
  });

  it("includes estate gardens with gardeners table section", () => {
    const spread = getEstateGuideSpread("estate-gardens");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Estate Gardens");
    expect(spread!.blocks.some((block) => block.type === "gardeners-table")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "gardens-could-speak")).toBe(
      true,
    );
  });

  it("includes discovery room with discovery key section", () => {
    const spread = getEstateGuideSpread("discovery-room");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Discovery Room");
    expect(spread!.blocks.some((block) => block.type === "discovery-key")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "estate-whisper")).toBe(
      true,
    );
  });

  it("includes lakeside verandah with coffee conversation section", () => {
    const spread = getEstateGuideSpread("lakeside-verandah");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Lakeside Verandah");
    expect(
      spread!.blocks.some((block) => block.type === "coffee-conversation"),
    ).toBe(true);
  });

  it("includes grand terrace with estate heart section", () => {
    const spread = getEstateGuideSpread("grand-terrace");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Grand Terrace");
    expect(spread!.blocks.some((block) => block.type === "estate-heart")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "estate-lore")).toBe(
      true,
    );
  });

  it("includes estate dining room with estate table section", () => {
    const spread = getEstateGuideSpread("dining-room");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Dining Room");
    expect(spread!.blocks.some((block) => block.type === "estate-table")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "enjoy-visiting-next")).toBe(
      true,
    );
  });

  it("includes clear my mind sunroom with wicker basket section", () => {
    const spread = getEstateGuideSpread("clear-my-mind");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Clear My Mind Sunroom");
    expect(spread!.blocks.some((block) => block.type === "wicker-basket")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "caretakers-observation")).toBe(
      true,
    );
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

  it("expands each room into two flipbook pages", () => {
    const pages = expandEstateGuideToBookPages(ESTATE_GUIDE_SPREADS);
    expect(pages).toHaveLength(ESTATE_GUIDE_SPREADS.length * 2);
    expect(pages[0]?.kind).toBe("photo");
    expect(pages[1]?.kind).toBe("text");
    expect(pages[0]?.spreadId).toBe(pages[1]?.spreadId);
  });

  it("expands each room into one open-book spread", () => {
    const spreads = expandEstateGuideToRoomSpreads(ESTATE_GUIDE_SPREADS);
    expect(spreads).toHaveLength(ESTATE_GUIDE_SPREADS.length);
    expect(spreads[0]?.photoPage.kind).toBe("photo");
    expect(spreads[0]?.textPage.kind).toBe("text");
    expect(spreads[0]?.photoPage.spreadId).toBe(spreads[0]?.textPage.spreadId);
  });
});

describe("estateGuideEditorial", () => {
  it("defines canonical and legacy block types", () => {
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toContain("estate-journals");
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toContain("before-you-leave");
    expect(ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES).toContain("story");
  });
});
