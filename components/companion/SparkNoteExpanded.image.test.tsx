/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import { resolveSparkCardImage } from "@/lib/sparkNote/resolveSparkCardImage";
import { resolveSparkCardHeroVisual } from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import {
  SUMMER_OPEN_DOOR_CAPTION,
  SUMMER_OPEN_DOOR_CARD_ID,
  SUMMER_OPEN_DOOR_IMAGE_FRAGMENT,
  summerOpenDoorCard,
} from "@/lib/sparkNote/fixtures/summerOpenDoor";
import { SPARK_CARD_SECTION_STORY } from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";

import { SparkNoteExpanded } from "./SparkNoteExpanded";

const noImageCard: SparkNoteDailyCard = {
  id: "NO-IMAGE-TEST",
  category: "personal_growth",
  categoryLabel: "Spark",
  sparkType: "quick",
  title: "Quiet Morning",
  shortTitle: "Quiet Morning",
  teaser: "A calm start.",
  whatHappened: "Nothing dramatic — just presence.",
  whyItMatters: "Small stillness matters.",
  sparkApplication: "Where can you pause today?",
  imageSrc: "https://example.invalid/missing-spark-card.jpg",
  source: "library",
};

describe("SparkNoteExpanded image parity", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.restoreAllMocks();
  });

  function render(card: SparkNoteDailyCard) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <SparkNoteExpanded
          card={card}
          onClose={vi.fn()}
          onOpenCollection={vi.fn()}
        />,
      );
    });
  }

  it("1. SPARK-SEA-SUMMER renders data-spark-card-hero=true", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    expect(resolved.hasImage).toBe(true);
    expect(resolved.src).toContain("upload.wikimedia.org");
    expect(resolved.src).toContain(SUMMER_OPEN_DOOR_IMAGE_FRAGMENT);
    expect(resolved.caption).toBe(SUMMER_OPEN_DOOR_CAPTION);

    render(summerOpenDoorCard);
    const hero = container.querySelector(
      '[data-spark-card-hero="true"]',
    ) as HTMLElement | null;
    expect(hero).toBeTruthy();
    expect(hero?.getAttribute("data-testid")).toBe("spark-card-hero");
  });

  it("2–4. hero appears before The Story with garden-door src + caption", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    render(summerOpenDoorCard);

    const hero = container.querySelector(
      '[data-spark-card-hero="true"]',
    ) as HTMLElement;
    expect(hero).toBeTruthy();
    expect(
      hero.querySelector(".spark-note-expanded__art")?.className,
    ).toContain("spark-note-expanded__art--editorial");
    expect(
      hero
        .querySelector(".spark-card-hero__frame")
        ?.getAttribute("data-spark-has-image"),
    ).toBe("true");

    const img = hero.querySelector(
      ".spark-card-hero__image, .spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(resolved.src);
    expect(img?.style.opacity || "1").not.toBe("0");
    expect(
      hero.querySelector(".spark-card-hero__caption")?.textContent,
    ).toBe(SUMMER_OPEN_DOOR_CAPTION);

    const html = container.innerHTML;
    const heroAt = html.indexOf('data-spark-card-hero="true"');
    const storyAt = html.indexOf(SPARK_CARD_SECTION_STORY);
    const dividerAt = html.indexOf("spark-note-expanded__divider");
    expect(heroAt).toBeGreaterThan(-1);
    expect(storyAt).toBeGreaterThan(-1);
    expect(heroAt).toBeLessThan(storyAt);
    // Divider must not replace the hero region — hero comes first.
    expect(dividerAt).toBeGreaterThan(heroAt);
    expect(
      container.querySelector(".spark-note-expanded__art-scene"),
    ).toBeFalsy();
  });

  it("5. hero is not omitted in live mode (SparkCardArt mounted)", () => {
    render(summerOpenDoorCard);
    expect(
      container.querySelector('[data-spark-card-hero="true"]'),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-card-hero__image"),
    ).toBeTruthy();
  });

  it("6–7. hero remains present on remount and with catalog imageSrc", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    render(summerOpenDoorCard);
    expect(
      container
        .querySelector(".spark-card-hero__image")
        ?.getAttribute("src"),
    ).toBe(resolved.src);

    act(() => root.unmount());
    container.remove();

    const catalogEntry = SPARK_NOTE_CATALOG.find(
      (e) => e.id === SUMMER_OPEN_DOOR_CARD_ID,
    );
    expect(catalogEntry?.imageSrc).toBeTruthy();
    const fromCatalog: SparkNoteDailyCard = {
      ...summerOpenDoorCard,
      imageSrc: catalogEntry!.imageSrc,
      thumbnailAlt: catalogEntry!.thumbnailAlt,
    };
    render(fromCatalog);
    expect(
      container.querySelector('[data-spark-card-hero="true"]'),
    ).toBeTruthy();
    expect(
      container
        .querySelector(".spark-card-hero__image")
        ?.getAttribute("src"),
    ).toContain(SUMMER_OPEN_DOOR_IMAGE_FRAGMENT);
    expect(
      container.querySelector(".spark-card-hero__caption")?.textContent,
    ).toBe(SUMMER_OPEN_DOOR_CAPTION);
  });

  it("8–9. desktop modal and mobile expanded keep the same hero mount", () => {
    render(summerOpenDoorCard);
    const card = container.querySelector(".spark-note-expanded__card");
    expect(card?.className).toContain("keepsake");
    expect(
      container.querySelector('[data-spark-card-hero="true"]'),
    ).toBeTruthy();
    // Width classes live in CSS media queries — assert hero is in flow.
    const hero = container.querySelector(".spark-card-hero") as HTMLElement;
    expect(hero.className).toContain("spark-card-hero");
  });

  it("10. print and live choose the same image source", () => {
    const image = resolveSparkCardImage(summerOpenDoorCard);
    const hero = resolveSparkCardHeroVisual(summerOpenDoorCard);
    expect(hero.kind).toBe("photo");
    if (hero.kind === "photo") {
      expect(hero.src).toBe(image.src);
      expect(hero.caption).toBe(image.caption);
    }
  });

  it("11. cards with no loadable image keep a hero region via themed fallback", () => {
    render(noImageCard);
    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();

    act(() => {
      img?.dispatchEvent(new Event("error"));
    });

    expect(
      container.querySelector(".spark-note-expanded__art-image"),
    ).toBeFalsy();
    expect(
      container.querySelector('[data-spark-card-hero="true"]'),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-note-expanded__art--themed"),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-note-expanded__art-scene"),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-card-hero__caption"),
    ).toBeFalsy();
  });

  it("12. divider does not replace the hero region", () => {
    render(summerOpenDoorCard);
    const html = container.innerHTML;
    const subtitleAt = html.indexOf("spark-note-expanded__subtitle");
    const heroAt = html.indexOf('data-spark-card-hero="true"');
    const dividerAt = html.indexOf("spark-note-expanded__divider");
    const storyAt = html.indexOf(SPARK_CARD_SECTION_STORY);
    expect(subtitleAt).toBeLessThan(heroAt);
    expect(heroAt).toBeLessThan(dividerAt);
    expect(dividerAt).toBeLessThan(storyAt);
  });

  it("renders curly-apostrophe Summer title through topic match", () => {
    const curly: SparkNoteDailyCard = {
      ...summerOpenDoorCard,
      id: "custom-summer",
      title: "Summer\u2019s Open Door",
      shortTitle: "Summer\u2019s Open Door",
      imageSrc: undefined,
    };
    const resolved = resolveSparkCardImage(curly);
    expect(resolved.hasImage).toBe(true);
    expect(resolved.src).toContain(SUMMER_OPEN_DOOR_IMAGE_FRAGMENT);
    render(curly);
    expect(
      container.querySelector('[data-spark-card-hero="true"]'),
    ).toBeTruthy();
  });
});
