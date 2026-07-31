/**
 * @vitest-environment jsdom
 *
 * Wander the Estate — immersive full-screen background behavior.
 * Verifies the framed → immersive toggle, Esc/exit stepping, and that
 * "Talk here" delegates to onEnterPlace (estate navigation), all client-side.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WanderEstateImageViewer } from "@/components/estateMap/WanderEstateImageViewer";
import { getWanderEstateTourImages } from "@/lib/estateMap/wanderEstateImageRegistry";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const tour = getWanderEstateTourImages();
const image = tour[0]!;
// A middle image so Previous AND Next are both enabled in immersive mode.
const midImage = tour[Math.min(2, tour.length - 1)]!;
let container: HTMLDivElement;
let root: Root;

function click(sel: string) {
  const el = container.querySelector<HTMLElement>(sel);
  if (!el) throw new Error(`missing ${sel}`);
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("Wander immersive full-screen background", () => {
  it("starts framed with a full-screen affordance and stays mounted", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    expect(container.querySelector('[data-immersive="false"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="wander-estate-viewer-fullscreen"]'),
    ).toBeTruthy();
    // framed controls (Previous / Back to Estate / Next) are present
    expect(
      container.querySelector('[data-testid="wander-estate-viewer-back"]'),
    ).toBeTruthy();
  });

  it("toggles into an immersive full-bleed background and back out", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-fullscreen"]');
    // now immersive: full-bleed image + immersive bar; framed meta hidden
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="wander-estate-immersive-bar"]'),
    ).toBeTruthy();
    expect(container.querySelector(".weiv-image--immersive")).toBeTruthy();
    expect(container.querySelector(".weiv-meta")).toBeFalsy();

    click('[data-testid="wander-estate-immersive-exit"]');
    expect(container.querySelector('[data-immersive="false"]')).toBeTruthy();
    expect(container.querySelector(".weiv-image--immersive")).toBeFalsy();
  });

  it("clicking the framed photo enters immersive mode", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-image"]');
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
  });

  it("clicking the immersive background does NOT exit full screen", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-fullscreen"]');
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
    // A tap on the full-screen background must be inert.
    click('[data-testid="wander-estate-viewer-image"]');
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
  });

  it("repeated immersive-background clicks keep immersive mode active", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-fullscreen"]');
    for (let i = 0; i < 3; i++) {
      click('[data-testid="wander-estate-viewer-image"]');
      expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
    }
  });

  it("Previous / Next keep immersive mode active", () => {
    const onNavigate = vi.fn();
    act(() =>
      root.render(
        <WanderEstateImageViewer image={midImage} onClose={vi.fn()} onNavigate={onNavigate} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-fullscreen"]');
    click('[data-testid="wander-estate-immersive-next"]');
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
    click('[data-testid="wander-estate-immersive-previous"]');
    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[data-immersive="true"]')).toBeTruthy();
  });

  it("Esc steps out of immersive first, then closes the viewer", () => {
    const onClose = vi.fn();
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={onClose} onNavigate={vi.fn()} />,
      ),
    );
    click('[data-testid="wander-estate-viewer-fullscreen"]');
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(container.querySelector('[data-immersive="false"]')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('"Talk here" delegates to onEnterPlace (estate navigation), no chat mounted here', () => {
    const onEnterPlace = vi.fn();
    act(() =>
      root.render(
        <WanderEstateImageViewer
          image={image}
          onClose={vi.fn()}
          onNavigate={vi.fn()}
          onEnterPlace={onEnterPlace}
        />,
      ),
    );
    click('[data-testid="wander-estate-viewer-talk"]');
    expect(onEnterPlace).toHaveBeenCalledTimes(1);
  });

  it("omits Talk here when no onEnterPlace is provided", () => {
    act(() =>
      root.render(
        <WanderEstateImageViewer image={image} onClose={vi.fn()} onNavigate={vi.fn()} />,
      ),
    );
    expect(
      container.querySelector('[data-testid="wander-estate-viewer-talk"]'),
    ).toBeFalsy();
  });
});
