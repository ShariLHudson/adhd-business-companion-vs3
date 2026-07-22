/**
 * @vitest-environment jsdom
 */
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DESTINATION_CRYSTAL_HIT_AREAS,
  DESTINATION_GALLERY_CRYSTALS,
  resolveCrystalActivation,
} from "@/lib/destinationGallery";

import { DestinationGalleryPanel } from "./DestinationGalleryPanel";

vi.mock("next/image", () => ({
  default: function MockImage(props: {
    alt?: string;
    src?: string;
    className?: string;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={props.alt ?? ""}
        src={typeof props.src === "string" ? props.src : ""}
        className={props.className}
        data-testid="destination-gallery-bg"
      />
    );
  },
}));

vi.mock("@/components/companion/ExportActions", () => ({
  ExportActions: function MockExportActions() {
    return <div data-testid="mock-export-actions">ExportActions</div>;
  },
}));

const CRYSTAL_IDS = [
  "schedule",
  "write",
  "save",
  "spark-social-media",
  "print",
  "create",
] as const;

describe("DestinationGalleryPanel crystal object navigation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.useRealTimers();
  });

  function render(
    props: Partial<ComponentProps<typeof DestinationGalleryPanel>> = {},
  ) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<DestinationGalleryPanel {...props} />);
    });
  }

  function clickCrystal(id: (typeof CRYSTAL_IDS)[number]) {
    const crystal = container.querySelector(
      `[data-testid="destination-crystal-${id}"]`,
    ) as HTMLButtonElement;
    act(() => {
      crystal.click();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    return crystal;
  }

  it("renders six transparent hit areas over crystal pillars", () => {
    render();
    expect(DESTINATION_CRYSTAL_HIT_AREAS).toHaveLength(6);
    for (const id of CRYSTAL_IDS) {
      const hit = container.querySelector(
        `[data-testid="destination-crystal-${id}"]`,
      ) as HTMLButtonElement;
      expect(hit).toBeTruthy();
      expect(hit.getAttribute("data-crystal-id")).toBe(id);
      expect(hit.className).toContain("destination-gallery-crystal");
      expect(hit.querySelector(".destination-gallery-crystal__gem")).toBeFalsy();
    }
    expect(
      container.querySelector('[data-testid="destination-crystal-hit-count"]')
        ?.textContent,
    ).toBe("6");
  });

  it("uses the Destination Gallery background image full-bleed", () => {
    render();
    const img = container.querySelector(
      '[data-testid="destination-gallery-bg"]',
    ) as HTMLImageElement;
    expect(img.src).toContain("destination-gallery-background.png");
    expect(img.className).toContain("destination-gallery-panel__media");
    expect(
      container
        .querySelector('[data-testid="destination-gallery-panel"]')
        ?.getAttribute("data-scene"),
    ).toBe("destination-gallery-background");
  });

  it("does not render dashboard cards, colored circles, or overlay labels", () => {
    render();
    expect(container.querySelector(".destination-gallery-card")).toBeFalsy();
    expect(container.querySelector(".destination-gallery-crystal__gem")).toBeFalsy();
    expect(container.querySelector(".destination-gallery-panel__mote")).toBeFalsy();
    expect(container.querySelector(".destination-gallery-crystal__label")).toBeFalsy();
    expect(container.textContent).not.toContain("Ready");
    expect(container.textContent).not.toContain(
      "Choose where this work should go",
    );
    expect(container.textContent).not.toContain("Plan your time");
    expect(container.textContent).not.toContain("Save written content");
    // Artwork names must not be duplicated as HTML overlays
    expect(container.textContent).not.toContain("Spark Social Media");
    for (const id of CRYSTAL_IDS) {
      expect(
        container.querySelector(`[data-testid="destination-crystal-label-${id}"]`),
      ).toBeFalsy();
    }
  });

  it("clicking Schedule activates schedule handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("schedule");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("schedule");
    expect(
      resolveCrystalActivation("schedule", {
        connections: {
          google: { configured: true, connected: true, email: "a@x.com" },
          outlookConnected: false,
          canvaConnected: false,
        },
      }).kind,
    ).toBe("open_calendar");
  });

  it("clicking Document activates document handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("write");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("write");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.name).toBe("Document");
    expect(resolveCrystalActivation("write").kind).toBe("prepared_document");
  });

  it("clicking Store activates store handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("save");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("save");
    expect(resolveCrystalActivation("save").kind).toBe("prepared_store");
  });

  it("clicking Share activates share handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("spark-social-media");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("spark-social-media");
    expect(
      resolveCrystalActivation("spark-social-media", {
        connections: {
          google: { configured: true, connected: false, email: null },
          outlookConnected: false,
          canvaConnected: false,
          socialProfiles: { linkedin: true },
        },
      }).kind,
    ).toBe("prepared_share");
  });

  it("clicking Print activates print handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("print");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("print");
    expect(resolveCrystalActivation("print").kind).toBe("prepared_print");
  });

  it("clicking Design shows prepared state and never opens Create", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    clickCrystal("create");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("create");
    const design = resolveCrystalActivation("create");
    expect(design.kind).toBe("needs_connection");

    render({
      prepared: design,
      onOpenConnections: vi.fn(),
    });
    expect(
      container.querySelector(
        '[data-testid="destination-needs-connection-message"]',
      )?.textContent,
    ).toMatch(/Canva/i);
    expect(
      container.querySelector(
        '[data-testid="destination-store-open-connections"]',
      ),
    ).toBeTruthy();
    expect(container.textContent).not.toContain("Create Studio");
    expect(container.textContent).not.toContain("content-generator");
  });

  it("supports keyboard Enter and Space activation", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    const schedule = container.querySelector(
      '[data-testid="destination-crystal-schedule"]',
    ) as HTMLButtonElement;
    expect(schedule.getAttribute("aria-label")).toBe(
      "Open Schedule destination",
    );
    act(() => {
      schedule.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    act(() => {
      schedule.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onSelectCrystal).toHaveBeenCalledTimes(2);
  });

  it("keeps crystal hit zones focusable with destination aria-labels", () => {
    render();
    const crystal = container.querySelector(
      '[data-testid="destination-crystal-write"]',
    ) as HTMLButtonElement;
    act(() => {
      crystal.focus();
    });
    expect(document.activeElement).toBe(crystal);
    expect(crystal.getAttribute("aria-label")).toBe(
      "Open Document destination",
    );
    expect(
      container.querySelector(
        '[data-testid="destination-crystal-create"]',
      )?.getAttribute("aria-label"),
    ).toBe("Open Design destination");
  });

  it("maps artwork order to stable crystal IDs without overlay text", () => {
    expect(DESTINATION_GALLERY_CRYSTALS.map((c) => c.id)).toEqual([
      ...CRYSTAL_IDS,
    ]);
    expect(DESTINATION_CRYSTAL_HIT_AREAS.map((a) => a.artworkLabel)).toEqual([
      "Schedule",
      "Write",
      "Save",
      "Spark Social Media",
      "Print",
      "Create",
    ]);
    expect(DESTINATION_CRYSTAL_HIT_AREAS.map((a) => a.label)).toEqual([
      "Schedule",
      "Document",
      "Store",
      "Share",
      "Print",
      "Design",
    ]);
  });

  it("plays activation state before calling the handler", () => {
    const onSelectCrystal = vi.fn();
    render({ onSelectCrystal });
    const crystal = container.querySelector(
      '[data-testid="destination-crystal-schedule"]',
    ) as HTMLButtonElement;
    act(() => {
      crystal.click();
    });
    expect(crystal.getAttribute("data-activating")).toBe("true");
    expect(onSelectCrystal).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onSelectCrystal).toHaveBeenCalledTimes(1);
  });
});
