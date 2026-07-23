import { describe, expect, it } from "vitest";

import {
  buildSparkCardShareText,
  resolveSparkCardBriefInsight,
  resolveSparkCardHeroVisual,
  resolveSparkCardMoreToDiscover,
  resolveSparkCardSimplifiedPresentation,
  resolveSparkCardTellMeMore,
  resolveSparkCardThemedScene,
  resolveSparkInAction,
  resolveTodaysSpark,
  splitSparkCardStoryParagraphs,
} from "./sparkCardCollectibleDisplay";
import {
  resolveSparkCardArtAsset,
  resolveSparkCardDiversityArtAsset,
} from "./sparkCardArtRegistry";
import { SPARK_CARD_DIVERSITY_CATEGORY_IDS } from "./sparkCardDiversity";
import { SPARK_NOTE_CATALOG } from "./catalog";
import type { SparkNoteDailyCard } from "./types";

/** Normalize the same way the implementation does, for test-side comparison. */
function norm(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function frontTexts(card: SparkNoteDailyCard): string[] {
  const presentation = resolveSparkCardSimplifiedPresentation(card);
  return [
    presentation.title,
    presentation.subtitle,
    ...presentation.storyParagraphs,
    presentation.todaysSpark,
    presentation.sparkInAction,
  ]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map(norm);
}

function catalogEntryToDailyCard(
  entry: (typeof SPARK_NOTE_CATALOG)[number],
): SparkNoteDailyCard {
  return {
    id: entry.id,
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    sparkType: entry.sparkType ?? "story",
    title: entry.title,
    shortTitle: entry.shortTitle ?? entry.title,
    teaser: entry.teaser,
    whatHappened: entry.whatHappened,
    whyInteresting: entry.whyInteresting,
    whyItMatters: entry.whyItMatters,
    sparkApplication: entry.sparkApplication,
    imageSrc: entry.imageSrc,
    thumbnailSrc: entry.thumbnailSrc,
    thumbnailAlt: entry.thumbnailAlt,
    tags: entry.tags,
    source: "library",
    expanded: entry.expanded,
  };
}

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
    ).toMatchObject({
      kind: "photo",
      src: "/images/sparks/post-it.png",
      alt: "Artwork for The Post-it Note",
    });
  });

  it("resolves Summer's Open Door to a real garden doorway photo", () => {
    const visual = resolveSparkCardHeroVisual({
      ...sampleCard,
      id: "SPARK-SEA-SUMMER",
      category: "personal_growth",
      categoryLabel: "Seasonal Spark",
      title: "Summer's Open Door",
      shortTitle: "Summer's Open Door",
      tags: ["seasonal", "summer", "adventure"],
    });
    expect(visual.kind).toBe("photo");
    if (visual.kind === "photo") {
      expect(visual.src).toContain("wikimedia");
      expect(visual.alt.toLowerCase()).toMatch(/garden|door|adventure/);
      expect(visual.aspectRatio).toBe("editorial");
    }
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

  // ——— Tell Me More must be genuinely NEW content, never a repeat/rephrase
  // of the front ("Tell Me More content ≠ front story fields" requirement).
  // See docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md

  it("Tell Me More is never empty for a card with no authored expanded content", () => {
    const tellMeMore = resolveSparkCardTellMeMore(sampleCard);
    expect(tellMeMore.facts.length).toBeGreaterThan(0);
    expect(tellMeMore.deeperStory).toBeTruthy();
    expect(tellMeMore.lookCloser).toBeTruthy();
    expect(tellMeMore.meetsNewInformationRequirement).toBe(true);
    expect(tellMeMore.newDiscoveryCategories.length).toBeGreaterThanOrEqual(3);
  });

  it("Tell Me More fields never duplicate the front title, subtitle, story, or takeaways", () => {
    const front = frontTexts(sampleCard);
    const tellMeMore = resolveSparkCardTellMeMore(sampleCard);

    const expandedTexts = [
      tellMeMore.lookCloser,
      tellMeMore.deeperStory,
      tellMeMore.whatHappenedNext,
      tellMeMore.unexpectedConnection,
      tellMeMore.tryThis,
      ...tellMeMore.facts,
    ].filter((v): v is string => Boolean(v));

    expect(expandedTexts.length).toBeGreaterThan(0);
    for (const text of expandedTexts) {
      const normalized = norm(text);
      for (const frontText of front) {
        expect(normalized).not.toBe(frontText);
        if (normalized.length > 12) expect(frontText).not.toContain(normalized);
        if (frontText.length > 12) expect(normalized).not.toContain(frontText);
      }
    }
  });

  it("drops a hand-authored expanded field that duplicates the front, keeping content genuinely new", () => {
    const duplicatingCard: SparkNoteDailyCard = {
      ...sampleCard,
      expanded: {
        // Deliberately the same as whyItMatters (Today's Spark) — must be
        // rejected by the duplication check, not shown as if it were new.
        lookCloser: sampleCard.whyItMatters,
        deeperStory: "A detail that never appears anywhere on the front of the card.",
      },
    };
    const tellMeMore = resolveSparkCardTellMeMore(duplicatingCard);
    expect(tellMeMore.lookCloser).not.toBe(sampleCard.whyItMatters);
    expect(tellMeMore.deeperStory).toBe(
      "A detail that never appears anywhere on the front of the card.",
    );
  });

  it("every card in the full library produces Tell Me More content distinct from its own front", () => {
    for (const entry of SPARK_NOTE_CATALOG) {
      const card = catalogEntryToDailyCard(entry);
      const front = frontTexts(card);
      const tellMeMore = resolveSparkCardTellMeMore(card);
      const expandedTexts = [
        tellMeMore.lookCloser,
        tellMeMore.deeperStory,
        tellMeMore.whatHappenedNext,
        tellMeMore.unexpectedConnection,
        tellMeMore.tryThis,
        ...tellMeMore.facts,
      ].filter((v): v is string => Boolean(v));

      for (const text of expandedTexts) {
        const normalized = norm(text);
        const duplicate = front.some(
          (frontText) =>
            frontText === normalized ||
            (normalized.length > 12 && frontText.includes(normalized)) ||
            (frontText.length > 12 && normalized.includes(frontText)),
        );
        expect(duplicate, `card ${card.id}: "${text}" duplicates front content`).toBe(
          false,
        );
      }
    }
  });

  it("every card in the full library meets the new-information requirement", () => {
    for (const entry of SPARK_NOTE_CATALOG) {
      const card = catalogEntryToDailyCard(entry);
      const tellMeMore = resolveSparkCardTellMeMore(card);
      expect(
        tellMeMore.meetsNewInformationRequirement,
        `card ${card.id} does not meet the >=3 new-discovery-category requirement`,
      ).toBe(true);
    }
  });

  // ——— Imagery: illustrated themed scene (fun, topic-specific, never a
  // single lonely icon) — used whenever no genuinely specific photo exists.

  it("themed scene returns estate icon keys — never emoji — plus supporting motifs", () => {
    const scene = resolveSparkCardThemedScene(sampleCard);
    expect(scene.kind).toBe("themed");
    expect(scene.emblem).toBe("flame");
    expect(scene.motifs.length).toBeGreaterThanOrEqual(3);
    expect(scene.motifs.every((motif) => /^[a-z]+$/.test(motif))).toBe(true);
    expect(scene.caption.length).toBeGreaterThan(0);
    expect(scene.diversityCategory).toBe("innovation");
  });

  it("Tell Me More gallery chips include selectable detail and estate icons", () => {
    const tellMeMore = resolveSparkCardTellMeMore(sampleCard);
    expect(tellMeMore.gallery.length).toBeGreaterThan(0);
    for (const item of tellMeMore.gallery) {
      expect(item.icon).toMatch(/^[a-z]+$/);
      expect(item.detail.length).toBeGreaterThan(10);
      expect(item.caption.length).toBeGreaterThan(0);
    }
  });

  it("themed scene motifs are deterministic per card id", () => {
    const first = resolveSparkCardThemedScene(sampleCard);
    const second = resolveSparkCardThemedScene(sampleCard);
    expect(second.motifs).toEqual(first.motifs);
  });

  it("themed scene motifs vary across cards in different diversity categories", () => {
    const invention = resolveSparkCardThemedScene(sampleCard);
    const nature = resolveSparkCardThemedScene({
      ...sampleCard,
      id: "SPARK-NATURE-TEST-001",
      category: "fun_fact",
      categoryLabel: "Nature",
      tags: ["nature", "wildlife"],
      title: "A quiet forest discovery",
    });
    expect(nature.diversityCategory).toBe("nature");
    expect(nature.motifs).not.toEqual(invention.motifs);
  });

  // ——— Real imagery is now the default hero (Readability/Real Imagery
  // fix). The illustrated themed scene only ever renders as the runtime
  // `onError` fallback inside SparkNoteExpanded — resolveSparkCardHeroVisual
  // itself should never hand back "themed" for a normal card, because every
  // diversity category now maps to a real, warm editorial/archival photo.
  // See docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md.

  it("uses a real diversity-category photo — never the illustrated scene — even with no bespoke photo", () => {
    const visual = resolveSparkCardHeroVisual({
      ...sampleCard,
      id: "SPARK-NO-PHOTO-TEST-001",
      imageSrc: "",
      thumbnailSrc: "",
      title: "A card with no bespoke photo anywhere in the registry",
      shortTitle: "No photo card",
      tags: [],
    });
    expect(visual.kind).toBe("photo");
    if (visual.kind === "photo") {
      expect(visual.src).toContain("wikimedia");
      expect(visual.alt.length).toBeGreaterThan(0);
    }
  });

  it("every diversity category resolves to a real, non-empty photo asset", () => {
    for (const id of SPARK_CARD_DIVERSITY_CATEGORY_IDS) {
      const asset = resolveSparkCardDiversityArtAsset(id);
      expect(asset.src.length, `diversity category ${id} has no photo src`).toBeGreaterThan(0);
      expect(asset.src).toContain("wikimedia");
      expect(asset.alt.length, `diversity category ${id} has no photo alt`).toBeGreaterThan(0);
    }
  });

  it("every card in the full library resolves a real photo as its hero visual", () => {
    for (const entry of SPARK_NOTE_CATALOG) {
      const card = catalogEntryToDailyCard(entry);
      const visual = resolveSparkCardHeroVisual(card);
      expect(visual.kind, `card ${card.id} did not resolve a photo hero`).toBe("photo");
    }
  });

  it("the illustrated themed scene remains available as the onError runtime fallback", () => {
    const scene = resolveSparkCardThemedScene(sampleCard);
    expect(scene.kind).toBe("themed");
    expect(scene.emblem.length).toBeGreaterThan(0);
  });
});
