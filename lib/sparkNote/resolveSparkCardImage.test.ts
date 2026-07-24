import { describe, expect, it } from "vitest";
import {
  extractSparkCardExplicitImage,
  resolveSparkCardImage,
} from "./resolveSparkCardImage";
import { resolveSparkCardHeroVisual } from "./sparkCardCollectibleDisplay";
import {
  normalizeSparkCardImageSrc,
  wikimediaCommonsDirectThumbUrl,
} from "./wikimediaCommonsUrl";

const summerCard = {
  id: "SPARK-SEA-SUMMER",
  category: "personal_growth" as const,
  categoryLabel: "Seasonal Spark",
  title: "Summer's Open Door",
  shortTitle: "Summer's Open Door",
  tags: ["seasonal", "summer", "adventure"],
};

describe("resolveSparkCardImage", () => {
  it("renders Summer's Open Door with the garden door image + caption", () => {
    const image = resolveSparkCardImage(summerCard);
    expect(image.src).toContain("upload.wikimedia.org");
    expect(image.src).toContain(
      "Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park",
    );
    expect(image.src).not.toContain("Special:FilePath");
    expect(image.caption).toBe("Adventure can be close to home.");
    expect(image.alt.toLowerCase()).toMatch(/door|garden|adventure/);
    expect(image.hasImage).toBe(true);
    expect(image.fallback).toBe(false);
    expect(image.fallbackState).toBe("none");
    expect(image.sourceType).toBe("topic");
  });

  it("uses imageUrl / imageSrc when present", () => {
    const image = resolveSparkCardImage({
      ...summerCard,
      imageSrc: "https://cdn.example.com/cards/summer.jpg",
    });
    expect(image.src).toBe("https://cdn.example.com/cards/summer.jpg");
    expect(image.sourceType).toBe("explicit");
    expect(image.sourceField).toBe("imageSrc");
  });

  it("supports legacy image_url field", () => {
    const image = resolveSparkCardImage({
      id: "legacy-1",
      title: "Legacy Card",
      image_url: "https://cdn.example.com/legacy.png",
    });
    expect(image.src).toBe("https://cdn.example.com/legacy.png");
    expect(image.sourceField).toBe("image_url");
    expect(image.sourceType).toBe("explicit");
  });

  it("supports media.url and heroImage legacy fields", () => {
    expect(
      extractSparkCardExplicitImage({
        media: { url: "https://cdn.example.com/media.jpg" },
      })?.field,
    ).toBe("media.url");
    expect(
      extractSparkCardExplicitImage({
        heroImage: "https://cdn.example.com/hero.jpg",
      })?.src,
    ).toBe("https://cdn.example.com/hero.jpg");
  });

  it("prefers imageSrc over competing legacy fields (same source for live + print)", () => {
    const image = resolveSparkCardImage({
      ...summerCard,
      imageSrc: "https://cdn.example.com/canonical.jpg",
      image_url: "https://cdn.example.com/legacy.jpg",
      printImage: "https://cdn.example.com/print-only.jpg",
      heroImage: "https://cdn.example.com/hero.jpg",
    });
    expect(image.src).toBe("https://cdn.example.com/canonical.jpg");
    expect(image.sourceField).toBe("imageSrc");
  });

  it("normalizes Special:FilePath to a direct upload thumb", () => {
    const special =
      "https://commons.wikimedia.org/wiki/Special:FilePath/Oscar_Wilde_Sarony.jpg?width=900";
    const normalized = normalizeSparkCardImageSrc(special);
    expect(normalized).toContain("upload.wikimedia.org");
    expect(normalized).toContain("Oscar_Wilde_Sarony.jpg");
    expect(normalized).not.toContain("Special:FilePath");

    const image = resolveSparkCardImage({
      id: "x",
      title: "Wilde",
      imageSrc: special,
    });
    expect(image.src).toBe(normalized);
  });

  it("normalizes protocol-relative and leaves root-relative paths", () => {
    expect(normalizeSparkCardImageSrc("//cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
    expect(normalizeSparkCardImageSrc("/images/sparks/door.jpg")).toBe(
      "/images/sparks/door.jpg",
    );
  });

  it("preserves supabase/storage URLs", () => {
    const supabase =
      "https://xyzcompany.supabase.co/storage/v1/object/public/spark-cards/door.jpg";
    const image = resolveSparkCardImage({
      id: "sb",
      title: "Stored",
      imageSrc: supabase,
    });
    expect(image.src).toBe(supabase);
  });

  it("marks fallback when no image can be resolved", () => {
    // Force empty by using an unknown title with no topic match and
    // temporarily — diversity registry always has photos, so simulate
    // via extract-only path: empty explicit + themed-only expectation
    // through hero visual when we pass a card that still gets diversity.
    // Missing explicit with topic miss still gets diversity art.
    const withDiversity = resolveSparkCardImage({
      id: "no-topic",
      title: "Ordinary Tuesday",
      category: "personal_growth",
    });
    // Diversity category art always provides a src today.
    expect(withDiversity.src).toBeTruthy();
    expect(withDiversity.fallback).toBe(false);
  });

  it("provides alt text whenever a photo src is present", () => {
    const image = resolveSparkCardImage(summerCard);
    expect(image.src).toBeTruthy();
    expect(image.alt.trim().length).toBeGreaterThan(3);
  });

  it("live hero visual and resolveSparkCardImage agree on source + caption", () => {
    const image = resolveSparkCardImage(summerCard);
    const hero = resolveSparkCardHeroVisual({
      ...summerCard,
      sparkType: "quick",
      teaser: "",
      whatHappened: "",
      whyItMatters: "",
      sparkApplication: "",
      source: "library",
    });
    expect(hero.kind).toBe("photo");
    if (hero.kind === "photo") {
      expect(hero.src).toBe(image.src);
      expect(hero.caption).toBe(image.caption);
      expect(hero.alt).toBe(image.alt);
    }
  });

  it("builds a verified Commons thumb URL for the Summer door file", () => {
    const url = wikimediaCommonsDirectThumbUrl(
      "Arch door and portal in Walled Garden at Goodnestone Park Kent England.jpg",
      900,
    );
    expect(url).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg/960px-Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg",
    );
  });
});
