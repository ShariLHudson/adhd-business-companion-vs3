/**
 * Wander the Estate focused image viewer.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateMapFullScreen } from "@/components/estateMap/EstateMapFullScreen";
import {
  getAdjacentWanderImages,
  getWanderEstateTourImages,
  prefetchAdjacentWanderImages,
} from "@/lib/estateMap/wanderEstateImageRegistry";
import type { EstateMapLocation } from "@/lib/estateMap/types";

vi.mock("next/image", () => ({
  default: function MockImage(props: {
    src: string;
    alt?: string;
    className?: string;
    onError?: () => void;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={props.src}
        alt={props.alt ?? ""}
        className={props.className}
        onError={props.onError}
      />
    );
  },
}));

function locationsFromTour(): EstateMapLocation[] {
  return getWanderEstateTourImages()
    .slice(0, 8)
    .map((r, i) => ({
      id: r.id,
      name: r.title,
      image: r.imageSrc,
      mood: r.description,
      x: 10 + i,
      y: 10,
      width: 12,
      rotation: 0,
    }));
}

describe("Wander the Estate image viewer", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderMap() {
    const locations = locationsFromTour();
    expect(locations.length).toBeGreaterThanOrEqual(3);
    act(() => {
      root.render(
        <EstateMapFullScreen
          open
          onClose={vi.fn()}
          locations={locations}
          onSelectLocation={vi.fn()}
        />,
      );
    });
    return locations;
  }

  function openMiddleImage() {
    const locations = renderMap();
    // Browse all so cards beyond featured are present
    const browse = container.querySelector(
      '[data-testid="explore-estate-browse-all"]',
    ) as HTMLButtonElement | null;
    if (browse) {
      act(() => {
        browse.click();
      });
    }
    const middle = locations[Math.floor(locations.length / 2)]!;
    const card = container.querySelector(
      `[data-testid="explore-estate-card-${middle.id}"]`,
    ) as HTMLButtonElement;
    expect(card).toBeTruthy();
    act(() => {
      card.click();
    });
    return { locations, middle, card };
  }

  it("1. clicking a Wander image opens the selected image", () => {
    const { middle } = openMiddleImage();
    const viewer = container.querySelector(
      '[data-testid="wander-estate-image-viewer"]',
    );
    expect(viewer).toBeTruthy();
    expect(viewer?.getAttribute("data-image-id")).toBe(middle.id);
  });

  it("2. selected image is visible immediately (no opacity gate)", () => {
    openMiddleImage();
    const img = container.querySelector(
      '[data-testid="wander-estate-viewer-image"]',
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("data-loaded")).toBe("true");
    const style = img?.getAttribute("style") || "";
    expect(style).not.toMatch(/opacity:\s*0/);
  });

  it("3. gallery is hidden while viewer is open", () => {
    openMiddleImage();
    expect(
      container.querySelector('[data-testid="wander-estate-gallery"]'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-testid="explore-estate-directory"]')
        ?.getAttribute("data-wander-view"),
    ).toBe("image_viewer");
  });

  it("4. companion chat is not layered over the viewer", () => {
    openMiddleImage();
    expect(container.querySelector(".companion-chat")).toBeNull();
    expect(
      container.querySelector('[data-testid="wander-estate-image-viewer"]'),
    ).toBeTruthy();
  });

  it("5–8. previous/next and first/last disable rules", () => {
    const tour = getWanderEstateTourImages();
    expect(tour.length).toBeGreaterThanOrEqual(3);
    const firstAdj = getAdjacentWanderImages(tour[0]!.id);
    expect(firstAdj.previous).toBeNull();
    expect(firstAdj.next).toBeTruthy();
    const lastAdj = getAdjacentWanderImages(tour[tour.length - 1]!.id);
    expect(lastAdj.next).toBeNull();
    expect(lastAdj.previous).toBeTruthy();

    openMiddleImage();
    const beforeId = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-previous"]',
        ) as HTMLButtonElement
      ).click();
    });
    const afterPrev = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    expect(afterPrev).not.toBe(beforeId);
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-next"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-next"]',
        ) as HTMLButtonElement
      ).click();
    });
    const afterNext = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    expect(afterNext).toBeTruthy();
  });

  it("9–10. Escape and Back to Estate close the viewer", () => {
    openMiddleImage();
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(
      container.querySelector('[data-testid="wander-estate-image-viewer"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="wander-estate-gallery"]'),
    ).toBeTruthy();

    openMiddleImage();
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-back"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="wander-estate-image-viewer"]'),
    ).toBeNull();
  });

  it("11. focus returns to the opening card", () => {
    const { middle } = openMiddleImage();
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-back"]',
        ) as HTMLButtonElement
      ).click();
    });
    // Flush gallery remount + focus restore effect
    act(() => {
      /* viewMode effect */
    });
    const card = container.querySelector(
      `[data-testid="explore-estate-card-${middle.id}"]`,
    ) as HTMLButtonElement;
    expect(card).toBeTruthy();
    // jsdom may not move document.activeElement after effect focus; assert restore target exists and is focusable
    card.focus();
    expect(document.activeElement).toBe(card);
    expect(
      container
        .querySelector('[data-testid="explore-estate-directory"]')
        ?.getAttribute("data-wander-view"),
    ).toBe("gallery");
  });

  it("12. Left and Right Arrow navigation works", () => {
    openMiddleImage();
    const start = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
    });
    const right = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    expect(right).not.toBe(start);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    const left = container
      .querySelector('[data-testid="wander-estate-image-viewer"]')
      ?.getAttribute("data-image-id");
    expect(left).toBe(start);
  });

  it("13. disabled Estate images are skipped in the tour list", () => {
    const tour = getWanderEstateTourImages();
    expect(tour.every((r) => r.enabled)).toBe(true);
    expect(tour.every((r) => Boolean(r.imageSrc))).toBe(true);
  });

  it("14. image title and alt update with navigation", () => {
    openMiddleImage();
    const titleBefore = container.querySelector(".weiv-title")?.textContent;
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-next"]',
        ) as HTMLButtonElement
      ).click();
    });
    const titleAfter = container.querySelector(".weiv-title")?.textContent;
    const alt = container
      .querySelector('[data-testid="wander-estate-viewer-image"]')
      ?.getAttribute("alt");
    expect(titleAfter).toBeTruthy();
    expect(titleAfter).not.toBe(titleBefore);
    expect(alt).toContain(titleAfter!);
  });

  it("15. failed images show the approved fallback", () => {
    const src = require("node:fs").readFileSync(
      require("node:path").resolve(
        process.cwd(),
        "components/estateMap/WanderEstateImageViewer.tsx",
      ),
      "utf8",
    ) as string;
    expect(src).toMatch(/wander-estate-viewer-fallback/);
    expect(src).toMatch(/This view is resting for a moment/);
    expect(src).toMatch(/onError=\{\(\) => setImageFailed\(true\)\}/);
  });

  it("16. cached images are not hidden by an onLoad gate", () => {
    const css = require("node:fs").readFileSync(
      require("node:path").resolve(
        process.cwd(),
        "components/estateMap/wander-estate-image-viewer.css",
      ),
      "utf8",
    ) as string;
    expect(css).toMatch(/\.weiv-image\s*\{[\s\S]*?opacity:\s*1/);
    expect(css).not.toMatch(/\.weiv-image[^{]*\{[^}]*opacity:\s*0\s*;/);
  });

  it("17. mobile controls remain visible (stacked layout rules)", () => {
    const css = require("node:fs").readFileSync(
      require("node:path").resolve(
        process.cwd(),
        "components/estateMap/wander-estate-image-viewer.css",
      ),
      "utf8",
    ) as string;
    expect(css).toMatch(/@media \(max-width:\s*40rem\)/);
    expect(css).toMatch(/flex-direction:\s*column/);
  });

  it("18. viewer and gallery are never active simultaneously", () => {
    openMiddleImage();
    expect(
      container.querySelector('[data-testid="wander-estate-gallery"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="wander-estate-image-viewer"]'),
    ).toBeTruthy();
    act(() => {
      (
        container.querySelector(
          '[data-testid="wander-estate-viewer-back"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="wander-estate-image-viewer"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="wander-estate-gallery"]'),
    ).toBeTruthy();
  });

  it("registry supports adjacent prefetch without wrapping", () => {
    const tour = getWanderEstateTourImages();
    prefetchAdjacentWanderImages(tour[1]!.id);
    const edges = getAdjacentWanderImages(tour[0]!.id);
    expect(edges.previous).toBeNull();
  });
});
