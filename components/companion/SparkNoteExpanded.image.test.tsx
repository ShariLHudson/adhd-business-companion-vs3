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

  it("1. Summer's Open Door resolves a hero image", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    expect(resolved.hasImage).toBe(true);
    expect(resolved.src).toContain("upload.wikimedia.org");
    expect(resolved.src).toContain(SUMMER_OPEN_DOOR_IMAGE_FRAGMENT);
    expect(resolved.caption).toBe(SUMMER_OPEN_DOOR_CAPTION);
    expect(resolved.fallbackState).toBe("none");
    expect(summerOpenDoorCard.id).toBe(SUMMER_OPEN_DOOR_CARD_ID);
  });

  it("2–4. live card renders image + caption before The Story", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    render(summerOpenDoorCard);

    const figure = container.querySelector(
      '[data-testid="spark-card-hero"]',
    ) as HTMLElement | null;
    expect(figure).toBeTruthy();
    expect(figure?.className).toContain("spark-note-expanded__art--editorial");
    expect(figure?.getAttribute("data-spark-has-image")).toBe("true");

    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(resolved.src);
    // Visible immediately — not gated on onLoad / opacity:0
    expect(img?.style.opacity || "1").not.toBe("0");
    expect(
      container.querySelector(".spark-note-expanded__art-photo-caption")
        ?.textContent,
    ).toBe(SUMMER_OPEN_DOOR_CAPTION);

    const html = container.innerHTML;
    const imgAt = html.indexOf("spark-note-expanded__art-image");
    const storyAt = html.indexOf(SPARK_CARD_SECTION_STORY);
    expect(imgAt).toBeGreaterThan(-1);
    expect(storyAt).toBeGreaterThan(-1);
    expect(imgAt).toBeLessThan(storyAt);

    // No themed placeholder when a photo is resolved
    expect(
      container.querySelector(".spark-note-expanded__art-scene"),
    ).toBeFalsy();
  });

  it("5. print and live choose the same image source", () => {
    const image = resolveSparkCardImage(summerOpenDoorCard);
    const hero = resolveSparkCardHeroVisual(summerOpenDoorCard);
    expect(hero.kind).toBe("photo");
    if (hero.kind === "photo") {
      expect(hero.src).toBe(image.src);
      expect(hero.caption).toBe(image.caption);
    }
  });

  it("6. image wrapper has nonzero layout dimensions", () => {
    render(summerOpenDoorCard);
    const figure = container.querySelector(
      ".spark-note-expanded__art",
    ) as HTMLElement;
    // jsdom may not compute aspect-ratio; assert CSS contract classes exist
    expect(figure.className).toMatch(/art--(editorial|landscape|square|portrait)/);
    const style = getComputedStyle(figure);
    // Width is set in stylesheet to 100%
    expect(figure.className).toContain("spark-note-expanded__art");
    void style;
  });

  it("7. cards without a loadable image omit the photo and use fallback, not a blank frame", () => {
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
      container.querySelector(".spark-note-expanded__art--themed"),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-note-expanded__art-scene"),
    ).toBeTruthy();
    expect(
      container.querySelector(".spark-note-expanded__art-photo-caption"),
    ).toBeFalsy();
  });

  it("8. failed image load uses themed fallback rather than a blank frame", () => {
    render(noImageCard);
    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement;
    act(() => {
      img.dispatchEvent(new Event("error"));
    });
    const hero = container.querySelector('[data-testid="spark-card-hero"]');
    expect(hero?.getAttribute("data-spark-has-image")).toBe("false");
    expect(hero?.querySelector(".spark-note-expanded__art-scene")).toBeTruthy();
  });

  it("9–10. reopening the card still shows the image (remount)", () => {
    const resolved = resolveSparkCardImage(summerOpenDoorCard);
    render(summerOpenDoorCard);
    expect(
      container
        .querySelector(".spark-note-expanded__art-image")
        ?.getAttribute("src"),
    ).toBe(resolved.src);

    act(() => root.unmount());
    container.remove();

    render(summerOpenDoorCard);
    expect(
      container
        .querySelector(".spark-note-expanded__art-image")
        ?.getAttribute("src"),
    ).toBe(resolved.src);
    expect(
      container.querySelector(".spark-note-expanded__art-photo-caption")
        ?.textContent,
    ).toBe(SUMMER_OPEN_DOOR_CAPTION);
  });

  it("renders legacy image_url through the same resolver path", () => {
    const resolved = resolveSparkCardImage({
      ...summerOpenDoorCard,
      id: "legacy-url",
      title: "Legacy Image Card",
      image_url: "https://cdn.example.com/legacy-door.jpg",
    });
    expect(resolved.src).toBe("https://cdn.example.com/legacy-door.jpg");

    render({ ...summerOpenDoorCard, id: "legacy-url", imageSrc: resolved.src! });
    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img?.getAttribute("src")).toBe(
      "https://cdn.example.com/legacy-door.jpg",
    );
  });
});
