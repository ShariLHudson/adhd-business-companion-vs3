import { describe, expect, it } from "vitest";

import {
  resolveSparkCardBriefInsight,
  resolveSparkCardHeroVisual,
  resolveSparkCardMoreToDiscover,
} from "./sparkCardCollectibleDisplay";
import { resolveSparkCardArtAsset } from "./sparkCardArtRegistry";
import type { SparkNoteDailyCard } from "./types";

const sampleCard: SparkNoteDailyCard = {
  id: "SPARK-INV-001",
  category: "invention",
  categoryLabel: "Innovation",
  sparkType: "story",
  title: "The Post-it Note",
  shortTitle: "The Post-it Note",
  teaser: "A mistake that became one of the world's most useful inventions.",
  whatHappened: "Long story that should not appear on the keepsake card.",
  whyItMatters: "Secondary insight fallback.",
  sparkApplication: "What idea deserves another chance?",
  source: "library",
};

describe("sparkCardCollectibleDisplay", () => {
  it("prefers spark application as the brief insight", () => {
    expect(resolveSparkCardBriefInsight(sampleCard)).toBe(
      sampleCard.sparkApplication,
    );
  });

  it("falls back when spark application is empty", () => {
    expect(
      resolveSparkCardBriefInsight({
        ...sampleCard,
        sparkApplication: "",
        whyInteresting: "A surprising lab detail.",
      }),
    ).toBe("A surprising lab detail.");
  });

  it("uses photo when imageSrc is set", () => {
    expect(
      resolveSparkCardHeroVisual({
        ...sampleCard,
        imageSrc: "/images/sparks/post-it.png",
      }),
    ).toEqual({
      kind: "photo",
      src: "/images/sparks/post-it.png",
      alt: "Artwork for The Post-it Note",
    });
  });

  it("resolves topic art for Oscar Wilde quote cards", () => {
    const visual = resolveSparkCardHeroVisual({
      ...sampleCard,
      id: "SPARK-QUOTE-008",
      category: "quote",
      categoryLabel: "Quote",
      title: "Be Yourself; Everyone Else Is Already Taken.",
      shortTitle: "Oscar Wilde",
    });
    expect(visual.kind).toBe("photo");
    if (visual.kind === "photo") {
      expect(visual.src).toContain("Oscar_Wilde");
    }
  });

  it("resolves category art when no explicit image is set", () => {
    const visual = resolveSparkCardHeroVisual(sampleCard);
    expect(visual.kind).toBe("photo");
    if (visual.kind === "photo") {
      expect(visual.src).toContain("wikimedia");
    }
  });

  it("provides More To Discover for story cards", () => {
    expect(resolveSparkCardMoreToDiscover(sampleCard)).toMatch(/Post-it/i);
    expect(
      resolveSparkCardMoreToDiscover({
        ...sampleCard,
        id: "SPARK-QUOTE-008",
        category: "quote",
        categoryLabel: "Quote",
        shortTitle: "Oscar Wilde",
        title: "Be Yourself",
      }),
    ).toMatch(/Oscar Wilde/i);
  });

  it("uses themed collectible art only when art registry has no src", () => {
    const asset = resolveSparkCardArtAsset({
      ...sampleCard,
      imageSrc: "",
      thumbnailSrc: "",
    });
    expect(asset.src.length).toBeGreaterThan(0);
  });
});
