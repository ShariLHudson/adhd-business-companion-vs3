/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import { resolveSparkCardImage } from "@/lib/sparkNote/resolveSparkCardImage";

import { SparkNoteExpanded } from "./SparkNoteExpanded";

const summerCard: SparkNoteDailyCard = {
  id: "SPARK-SEA-SUMMER",
  category: "personal_growth",
  categoryLabel: "Seasonal Spark",
  sparkType: "quick",
  title: "Summer's Open Door",
  shortTitle: "Summer's Open Door",
  teaser: "Adventure can be close to home.",
  whatHappened: "Longer days invite exploration.",
  whyItMatters: "Wonder does not require a distant destination.",
  sparkApplication: "What nearby door could you open this week?",
  tags: ["seasonal", "summer", "adventure"],
  source: "library",
};

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
  // Force resolver empty by providing a broken explicit URL that fails load.
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

  it("live card mounts the Summer door image from the shared resolver", () => {
    const resolved = resolveSparkCardImage(summerCard);
    render(summerCard);

    const figure = container.querySelector(".spark-note-expanded__art");
    expect(figure).toBeTruthy();
    expect(figure?.className).toContain("spark-note-expanded__art--editorial");

    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(resolved.src);
    expect(img?.getAttribute("alt")).toBe(resolved.alt);
    expect(img?.getAttribute("referrerpolicy") || img?.referrerPolicy).toMatch(
      /no-referrer/i,
    );

    act(() => {
      img?.dispatchEvent(new Event("load"));
    });

    expect(
      container.querySelector(".spark-note-expanded__art-photo-caption")
        ?.textContent,
    ).toBe("Adventure can be close to home.");
    // After load, themed placeholder is gone — photo fills the frame.
    expect(
      container.querySelector(".spark-note-expanded__art-scene"),
    ).toBeFalsy();
  });

  it("renders legacy image_url through the same resolver path", () => {
    const card: SparkNoteDailyCard = {
      ...summerCard,
      id: "legacy-url",
      title: "Legacy Image Card",
      shortTitle: "Legacy",
      imageSrc: undefined,
      ...( {
        image_url: "https://cdn.example.com/legacy-door.jpg",
      } as Partial<SparkNoteDailyCard>),
    };
    // Pass through resolveSparkCardImage shape via spread on expanded props —
    // DailyCard may not type image_url, so resolve then set imageSrc.
    const resolved = resolveSparkCardImage({
      ...card,
      image_url: "https://cdn.example.com/legacy-door.jpg",
    });
    expect(resolved.src).toBe("https://cdn.example.com/legacy-door.jpg");

    render({ ...card, imageSrc: resolved.src! });
    const img = container.querySelector(
      ".spark-note-expanded__art-image",
    ) as HTMLImageElement | null;
    expect(img?.getAttribute("src")).toBe(
      "https://cdn.example.com/legacy-door.jpg",
    );
  });

  it("falls back without a blank framed photo when the image fails", () => {
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
});
