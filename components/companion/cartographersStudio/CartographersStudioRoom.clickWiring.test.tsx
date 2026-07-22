/**
 * Cartographer's Studio — wall map click wiring (bug repro + regression guard).
 *
 * Members reported that map names/labels were correct, but clicking a wall
 * map (frame OR label) did nothing — no builder or entry panel opened.
 * These tests render the real room component and simulate real clicks,
 * asserting the click handlers actually fire the correct callback for
 * every one of the 10 wall maps (not just that the DOM/registry looks right).
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartographersStudioRoom } from "@/components/companion/cartographersStudio/CartographersStudioRoom";
import { cartographyWallMaps } from "@/lib/cartographersStudio/wallMaps";
import type { CartographersFramedMapId } from "@/lib/cartographersStudio";

describe("Cartographer's Studio — wall map clicks actually open a map", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onSelectWallMap: ReturnType<typeof vi.fn>;
  let onSelectMindMap: ReturnType<typeof vi.fn>;
  let onOpenMap: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onSelectWallMap = vi.fn();
    onSelectMindMap = vi.fn();
    onOpenMap = vi.fn();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderRoom() {
    act(() => {
      root.render(
        <CartographersStudioRoom
          continueThinking={[]}
          onSelectMindMap={onSelectMindMap}
          onSelectWallMap={onSelectWallMap}
          onOpenMap={onOpenMap}
        />,
      );
    });
  }

  it("clicking the FRAME hotspot opens the matching map for every one of the 10 wall maps", () => {
    renderRoom();
    for (const wall of cartographyWallMaps) {
      onSelectWallMap.mockClear();
      const frame = container.querySelector(
        `[data-testid="cartographers-frame-${wall.id}"]`,
      ) as HTMLButtonElement | null;
      expect(frame, `frame hotspot missing for ${wall.id}`).toBeTruthy();

      act(() => {
        frame?.click();
      });

      expect(
        onSelectWallMap,
        `clicking the ${wall.name} frame did not open ${wall.id}`,
      ).toHaveBeenCalledTimes(1);
      expect(onSelectWallMap).toHaveBeenCalledWith(wall.id);
    }
  });

  it("clicking the LABEL opens the matching map for every one of the 10 wall maps", () => {
    renderRoom();
    for (const wall of cartographyWallMaps) {
      onSelectWallMap.mockClear();
      const label = container.querySelector(
        `[data-testid="cartographers-label-${wall.id}"]`,
      ) as HTMLButtonElement | null;
      expect(label, `label missing for ${wall.id}`).toBeTruthy();

      act(() => {
        label?.click();
      });

      expect(
        onSelectWallMap,
        `clicking the ${wall.name} label did not open ${wall.id}`,
      ).toHaveBeenCalledTimes(1);
      expect(onSelectWallMap).toHaveBeenCalledWith(wall.id);
    }
  });

  it("frame and label hotspots are real interactive buttons, not decorative dead clicks", () => {
    renderRoom();
    for (const wall of cartographyWallMaps) {
      const frame = container.querySelector(
        `[data-testid="cartographers-frame-${wall.id}"]`,
      ) as HTMLButtonElement | null;
      const label = container.querySelector(
        `[data-testid="cartographers-label-${wall.id}"]`,
      ) as HTMLButtonElement | null;
      expect(frame?.tagName).toBe("BUTTON");
      expect(frame?.getAttribute("type")).toBe("button");
      expect(label?.tagName).toBe("BUTTON");
      expect(label?.getAttribute("type")).toBe("button");
      expect(frame?.getAttribute("data-interactive")).toBe("true");
    }
  });

  it("mobile gallery buttons also open every wall map (accessible fallback path)", () => {
    renderRoom();
    for (const wall of cartographyWallMaps) {
      onSelectWallMap.mockClear();
      const galleryItem = container.querySelector(
        `[data-testid="cartographers-gallery-${wall.id}"]`,
      ) as HTMLButtonElement | null;
      expect(galleryItem, `gallery item missing for ${wall.id}`).toBeTruthy();

      act(() => {
        galleryItem?.click();
      });

      expect(onSelectWallMap).toHaveBeenCalledWith(wall.id);
    }
  });

  it("center table hotspot opens Mind Map through the same onSelectWallMap path", () => {
    renderRoom();
    const centerMap = container.querySelector(
      '[data-testid="cartographers-center-map"]',
    ) as HTMLButtonElement | null;
    expect(centerMap).toBeTruthy();

    act(() => {
      centerMap?.click();
    });

    expect(onSelectWallMap).toHaveBeenCalledWith("mind-map");
    // Falls back to onSelectMindMap only when onSelectWallMap is not provided —
    // never both, and never neither.
    expect(onSelectMindMap).not.toHaveBeenCalled();
  });

  it("without onSelectWallMap, the Mind Map hotspots still fall back to onSelectMindMap (never a silent no-op)", () => {
    act(() => {
      root.render(
        <CartographersStudioRoom
          continueThinking={[]}
          onSelectMindMap={onSelectMindMap}
          onOpenMap={onOpenMap}
        />,
      );
    });

    const centerMap = container.querySelector(
      '[data-testid="cartographers-center-map"]',
    ) as HTMLButtonElement | null;
    act(() => {
      centerMap?.click();
    });
    expect(onSelectMindMap).toHaveBeenCalledTimes(1);
  });

  it("every wall map hotspot sits inside the clickable region of its own frame (no zero-size or off-frame hotspots)", () => {
    renderRoom();
    for (const wall of cartographyWallMaps) {
      const slot = container.querySelector(
        `[data-testid="cartographers-wall-slot-${wall.id}"]`,
      ) as HTMLElement | null;
      expect(slot, `wall slot missing for ${wall.id}`).toBeTruthy();
      expect(slot?.style.width).not.toBe("0%");
      expect(slot?.style.height).not.toBe("0%");
    }
  });

  it("clicking one map does not open a different map (no cross-wired hotspots)", () => {
    renderRoom();
    const ids: CartographersFramedMapId[] = cartographyWallMaps.map(
      (w) => w.id,
    );
    const decisionFrame = container.querySelector(
      '[data-testid="cartographers-frame-decision-map"]',
    ) as HTMLButtonElement | null;

    act(() => {
      decisionFrame?.click();
    });

    expect(onSelectWallMap).toHaveBeenCalledTimes(1);
    expect(onSelectWallMap).toHaveBeenCalledWith("decision-map");
    for (const id of ids) {
      if (id === "decision-map") continue;
      expect(onSelectWallMap).not.toHaveBeenCalledWith(id);
    }
  });
});
