/**
 * Panel opens and surfaces place orientation + optional Estate Tour.
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { HowSparkEstateWorksTogetherPanel } from "@/components/companion/HowSparkEstateWorksTogetherPanel";

describe("HowSparkEstateWorksTogetherPanel", () => {
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

  it("opens the frosted orientation panel with all places", () => {
    act(() => {
      root.render(
        <HowSparkEstateWorksTogetherPanel
          open
          onClose={() => {}}
          focusPlaceId="create"
        />,
      );
    });

    expect(
      container.querySelector('[data-testid="how-spark-estate-works-together"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="how-estate-works-places"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="how-estate-place-create"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="how-estate-place-hall"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="how-estate-tour-offer"]'),
    ).toBeTruthy();
  });

  it("starts the Estate Tour invitation when requested", () => {
    act(() => {
      root.render(
        <HowSparkEstateWorksTogetherPanel
          open
          onClose={() => {}}
          startTour
        />,
      );
    });

    expect(
      container.querySelector('[data-testid="how-estate-tour-invite"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="how-estate-tour-walk"]'),
    ).toBeTruthy();
  });

  it("renders nothing when closed", () => {
    act(() => {
      root.render(
        <HowSparkEstateWorksTogetherPanel open={false} onClose={() => {}} />,
      );
    });

    expect(
      container.querySelector('[data-testid="how-spark-estate-works-together"]'),
    ).toBeNull();
  });
});
