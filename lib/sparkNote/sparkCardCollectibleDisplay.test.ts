import { describe, expect, it } from "vitest";

import {
  buildSparkCardShareText,
  resolveSparkCardBriefInsight,
  resolveSparkCardHeroVisual,
  resolveSparkCardMoreToDiscover,
  resolveSparkCardSimplifiedPresentation,
  resolveSparkInAction,
  resolveTodaysSpark,
  splitSparkCardStoryParagraphs,
} from "./sparkCardCollectibleDisplay";
import { resolveSparkCardArtAsset } from "./sparkCardArtRegistry";
import type { SparkNoteDailyCard } from "./types";

const sampleCard: SparkNoteDailyCard = {
  id: "SPARK-INV-001",
  category: "invention",
  categoryLabel: "Invention",
  sparkType: "story",
  title: "The Post-it Note",
  shortTitle: "The Post-it Note",
  teaser: "A mistake that became one of the world's most useful inventions.",
  whatHappened:
    "A scientist was trying to create a very strong adhesive. Instead, he created something unusual. For years, the discovery did not have an obvious purpose. Another employee saw the possibility. The mistake became an invention.",
  whyItMatters:
    "Some of the best ideas come from noticing a possibility inside an unexpected result.",
  sparkApplication:
    "What idea have you dismissed because it did not work the way you originally imagined?",
  source: "library",
};

describe("sparkCardCollectibleDisplay", () => {
  it("builds the simplified treasure presentation", () => {
    const presentation = resolveSparkCardSimplifiedPresentation(sampleCard);
    expect(presentation.categoryRibbon).toBe("Innovation");
    expect(presentation.title).toBe(sampleCard.title);
    expect(presentation.subtitle).toBe(sampleCard.teaser);
    expect(presentation.storyParagraphs.length).toBeGreaterThanOrEqual(1);
    expect(presentation.todaysSpark).toBe(sampleCard.whyItMatters);
    expect(presentation.sparkInAction.length).toBeGreaterThan(0);
    expect(presentation.sparkInAction.endsWith("?")).toBe(false);
    expect(presentation.tellMeMore.facts.length).toBeGreaterThan(0);
  });

  it("uses whyItMatters as Today's Spark takeaway", () => {
    expect(resolveTodaysSpark(sampleCard)).toBe(sampleCard.whyItMatters);
  });

  it("converts reflective questions into tiny actions", () => {
    expect(resolveSparkInAction(sampleCard)).toMatch(/idea|Write|Thank|Ask/i);
    expect(
      resolveSparkInAction({
        ...sampleCard,
        sparkApplication: "Write down one new idea.",
      }),
    ).toBe("Write down one new idea.");
  });

  it("splits long stories into short paragraphs", () => {
    const paragraphs = splitSparkCardStoryParagraphs(sampleCard.whatHappened);
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(paragraphs.length).toBeLessThanOrEqual(5);
  });

  it("prefers why it matters as the brief insight", () => {
    expect(resolveSparkCardBriefInsight(sampleCard)).toBe(
      sampleCard.whyItMatters,
    );
  });

  it("falls back when takeaway is empty", () => {
    expect(
      resolveSparkCardBriefInsight({
        ...sampleCard,
        whyItMatters: "",
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

  it("provides More To Discover facts for Tell Me More", () => {
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

  it("builds share text from the simplified card", () => {
    const text = buildSparkCardShareText(sampleCard);
    expect(text).toContain(sampleCard.title);
    expect(text).toContain("Today's Spark:");
    expect(text).toContain("Spark In Action:");
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
