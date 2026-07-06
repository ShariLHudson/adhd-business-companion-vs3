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
import { resolveTreehouseJourneyFooter } from "@/data/estateGuideSpreads/treehouseGuideJourney";

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

  it("resolves butterfly-conservatory alias to Ocean Conservatory spread", () => {
    const spread = getEstateGuideSpread("butterfly-conservatory");
    expect(spread).toBeDefined();
    expect(spread!.title).toMatch(/Ocean Conservatory/i);
    expect(spread!.blocks.some((block) => block.type === "estate-secret")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "why-this-room-exists")).toBe(
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

  it("includes possibility house opening chapter with section structure", () => {
    const spread = getEstateGuideSpread("house-possibility-outside");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Treehouse Possibility House");
    expect(spread!.guideSubtitle).toContain("Every New Chapter Begins");
    expect(spread!.whisperFromEstate).toMatch(/first step/i);
    expect(spread!.guideQuote).toMatch(/remarkable journeys/i);
    expect(spread!.blocks.some((block) => block.type === "story-of-possibility-studio")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "what-youll-discover")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "before-you-explore")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "from-shari")).toBe(true);
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes possibility studio spread with story, whisper, and guide quote", () => {
    const spread = getEstateGuideSpread("house-possibility-studio");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Possibility Studio");
    expect(spread!.whisperFromEstate).toMatch(/single possibility/i);
    expect(spread!.guideQuote).toMatch(/impossible idea/i);
    expect(
      spread!.blocks.some((block) => block.type === "story-of-possibility-studio"),
    ).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "estate-secret")).toBe(true);
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes possibility staircase spread with story, whisper, and guide quote", () => {
    const spread = getEstateGuideSpread("house-possibility-staircase");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Staircase");
    expect(spread!.guideSubtitle).toContain("Every Step Opens");
    expect(spread!.whisperFromEstate).toMatch(/extraordinary courage/i);
    expect(spread!.guideQuote).toMatch(/next step can see/i);
    expect(spread!.blocks.some((block) => block.type === "before-you-continue")).toBe(
      true,
    );
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes possibility reflection desk spread with kinsey and journal sections", () => {
    const spread = getEstateGuideSpread("house-possibility-reflection-desk");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Reflection Desk");
    expect(spread!.guideSubtitle).toContain("Thoughts Find Their Voice");
    expect(spread!.whisperFromEstate).toMatch(/quiet you've been too busy/i);
    expect(spread!.guideQuote).toMatch(/next chapter quietly begins/i);
    expect(spread!.blocks.some((block) => block.type === "the-journal")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "kinseys-corner")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "before-you-leave")).toBe(true);
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes possibility observatory spread with window, telescope, and hearth", () => {
    const spread = getEstateGuideSpread("house-possibility-observatory");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Observatory");
    expect(spread!.guideSubtitle).toContain("Perspective Changes Everything");
    expect(spread!.whisperFromEstate).toMatch(/edge of what you can see/i);
    expect(spread!.guideQuote).toMatch(/not the end of your story/i);
    expect(spread!.blocks.some((block) => block.type === "the-great-window")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "the-telescope")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "the-hearth")).toBe(true);
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes cabinet of chapters as a long philosophy spread", () => {
    const spread = getEstateGuideSpread("house-possibility-cabinet-of-chapters");
    expect(spread).toBeDefined();
    expect(spread!.title).toContain("Cabinet of Chapters");
    expect(spread!.guideSubtitle).toContain("Story Worth Remembering");
    expect(spread!.blocks.length).toBeGreaterThanOrEqual(8);
    expect(spread!.whisperFromEstate).toMatch(/keep writing the next one/i);
    expect(spread!.guideQuote).toMatch(/story worth telling/i);
    expect(spread!.blocks.some((block) => block.type === "still-becoming")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "the-drawers")).toBe(true);
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("includes discovery chest spread with legend and opening the chest", () => {
    const spread = getEstateGuideSpread("house-possibility-discovery-chest");
    expect(spread).toBeDefined();
    expect(spread!.title).toBe("The Treehouse Discovery Chest");
    expect(spread!.title).not.toContain("™");
    expect(spread!.guideSubtitle).toContain("Curiosity Is Always Rewarded");
    expect(spread!.whisperFromEstate).toMatch(/Stay curious/i);
    expect(spread!.blocks.some((block) => block.type === "opening-the-chest")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "hidden-estate-legend")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "before-you-close-lid")).toBe(
      true,
    );
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("treehouse guide titles omit trademark symbols", () => {
    for (const id of [
      "house-possibility-outside",
      "house-possibility-studio",
      "house-possibility-staircase",
      "house-possibility-reflection-desk",
      "house-possibility-observatory",
      "house-possibility-cabinet-of-chapters",
      "house-possibility-discovery-chest",
      "house-possibility-legacy-room",
    ]) {
      const spread = getEstateGuideSpread(id);
      expect(spread!.title).not.toContain("™");
    }
  });

  it("includes legacy room as the treehouse journey conclusion", () => {
    const spread = getEstateGuideSpread("house-possibility-legacy-room");
    expect(spread).toBeDefined();
    expect(spread!.title).toBe("The Treehouse Legacy Room");
    expect(spread!.guideSubtitle).toContain("Legacy You'll Leave");
    expect(spread!.blocks.length).toBeGreaterThanOrEqual(10);
    expect(spread!.whisperFromEstate).toMatch(/already growing/i);
    expect(spread!.blocks.some((block) => block.type === "the-fireplace")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "the-open-doors")).toBe(true);
    expect(spread!.blocks.some((block) => block.type === "final-treehouse-tradition")).toBe(
      true,
    );
    expect(validateEstateGuideSpread(spread!)).toEqual([]);
  });

  it("legacy room journey footer has no next stop", () => {
    const footer = resolveTreehouseJourneyFooter("house-possibility-legacy-room");
    expect(footer!.completedSteps).toContain("Reflected in the Legacy Room");
    expect(footer!.nextStop).toBeNull();
  });

  it("places treehouse section at the back of the guidebook", () => {
    const ids = listEstateGuideSpreadIds();
    const discoveryIndex = ids.indexOf("discovery-room");
    const houseIndex = ids.indexOf("house-possibility-outside");
    const legacyIndex = ids.indexOf("house-possibility-legacy-room");
    const coffeeHouseIndex = ids.indexOf("coffee-house");
    const oceanIndex = ids.indexOf("ocean-conservatory");
    expect(discoveryIndex).toBeGreaterThanOrEqual(0);
    expect(houseIndex).toBeGreaterThan(discoveryIndex);
    expect(coffeeHouseIndex).toBeGreaterThan(discoveryIndex);
    expect(oceanIndex).toBeGreaterThan(coffeeHouseIndex);
    expect(houseIndex).toBe(oceanIndex + 1);
    expect(legacyIndex).toBe(ids.length - 1);
  });

  it("includes Ocean Conservatory guide spread before Treehouse section", () => {
    const spread = getEstateGuideSpread("ocean-conservatory");
    expect(spread).toBeDefined();
    expect(spread!.title).toMatch(/Ocean Conservatory/i);
    expect(spread!.epigraph).toMatch(/rhythm of the sea/i);
    expect(spread!.blocks.some((block) => block.type === "why-this-room-exists")).toBe(
      true,
    );
    expect(spread!.blocks.some((block) => block.type === "estate-secret")).toBe(true);
    expect(
      spread!.blocks.some(
        (block) =>
          block.type === "reflection" &&
          block.attribution?.some((line) => /spark/i.test(line)),
      ),
    ).toBe(true);
  });

  it("orders treehouse chapters as one continuous journey", () => {
    const ids = listEstateGuideSpreadIds();
    const houseIndex = ids.indexOf("house-possibility-outside");
    const staircaseIndex = ids.indexOf("house-possibility-staircase");
    const studioIndex = ids.indexOf("house-possibility-studio");
    const reflectionIndex = ids.indexOf("house-possibility-reflection-desk");
    const observatoryIndex = ids.indexOf("house-possibility-observatory");
    const cabinetIndex = ids.indexOf("house-possibility-cabinet-of-chapters");
    const chestIndex = ids.indexOf("house-possibility-discovery-chest");
    const legacyIndex = ids.indexOf("house-possibility-legacy-room");
    expect(staircaseIndex).toBeGreaterThan(houseIndex);
    expect(studioIndex).toBeGreaterThan(staircaseIndex);
    expect(reflectionIndex).toBeGreaterThan(studioIndex);
    expect(observatoryIndex).toBeGreaterThan(reflectionIndex);
    expect(cabinetIndex).toBeGreaterThan(observatoryIndex);
    expect(chestIndex).toBeGreaterThan(cabinetIndex);
    expect(legacyIndex).toBeGreaterThan(chestIndex);
  });

  it("builds treehouse journey footer for discovery chest with legacy room next", () => {
    const footer = resolveTreehouseJourneyFooter("house-possibility-discovery-chest");
    expect(footer).not.toBeNull();
    expect(footer!.completedSteps).toContain("Discovered the Discovery Chest");
    expect(footer!.nextStop).toBe("The Legacy Room");
  });

  it("builds treehouse journey footer for cabinet with discovery chest next", () => {
    const footer = resolveTreehouseJourneyFooter("house-possibility-cabinet-of-chapters");
    expect(footer).not.toBeNull();
    expect(footer!.completedSteps).toContain("Opened the Cabinet of Chapters");
    expect(footer!.nextStop).toBe("The Discovery Chest");
  });

  it("builds treehouse journey footer for observatory with cabinet next stop", () => {
    const footer = resolveTreehouseJourneyFooter("house-possibility-observatory");
    expect(footer).not.toBeNull();
    expect(footer!.completedSteps).toContain(
      "Gained Perspective in the Observatory",
    );
    expect(footer!.completedSteps).toContain("Paused at the Reflection Desk");
    expect(footer!.nextStop).toBe("The Cabinet of Chapters");
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
