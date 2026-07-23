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

const DOCUMENT_DESTINATION_IDS = [
  "google-docs",
  "microsoft-word",
  "pdf",
  "print",
  "download",
] as const;

describe("DestinationGalleryPanel crystal object navigation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ connected: false, configured: true }),
      }),
    );
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function render(
    props: Partial<ComponentProps<typeof DestinationGalleryPanel>> = {},
  ) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <DestinationGalleryPanel artifactType="Document" {...props} />,
      );
    });
  }

  async function flushGoogleStatus() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  function clickDestination(id: (typeof DOCUMENT_DESTINATION_IDS)[number]) {
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

  it("renders artifact destination crystals over painted pillars", async () => {
    render({ exportText: "Draft body" });
    await flushGoogleStatus();
    expect(DESTINATION_CRYSTAL_HIT_AREAS).toHaveLength(6);
    for (const id of DOCUMENT_DESTINATION_IDS) {
      const hit = container.querySelector(
        `[data-testid="destination-crystal-${id}"]`,
      ) as HTMLButtonElement;
      expect(hit).toBeTruthy();
      expect(hit.getAttribute("data-destination-id")).toBe(id);
      expect(hit.className).toContain("destination-gallery-crystal");
      expect(hit.querySelector(".destination-gallery-crystal__gem")).toBeFalsy();
      expect(
        hit.querySelector(
          `[data-testid="destination-crystal-whisper-${id}"]`,
        )?.textContent,
      ).toBeTruthy();
    }
    expect(
      container.querySelector('[data-testid="destination-crystal-hit-count"]')
        ?.textContent,
    ).toBe("5");
    expect(
      container.querySelector(
        '[data-testid="destination-crystal-pillar-count"]',
      )?.textContent,
    ).toBe("6");
  });

  it("does not show Sheets or Calendar crystals for a document", async () => {
    render({ artifactType: "Proposal", exportText: "Hello" });
    await flushGoogleStatus();
    expect(
      container.querySelector('[data-testid="destination-crystal-google-sheets"]'),
    ).toBeFalsy();
    expect(
      container.querySelector(
        '[data-testid="destination-crystal-google-calendar"]',
      ),
    ).toBeFalsy();
  });

  it("shows spreadsheet crystals for spreadsheet artifacts", async () => {
    render({ artifactType: "Spreadsheet", exportText: "a,b\n1,2" });
    await flushGoogleStatus();
    expect(
      container.querySelector('[data-testid="destination-crystal-google-sheets"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="destination-crystal-csv"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="destination-crystal-google-docs"]'),
    ).toBeFalsy();
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
    expect(
      container
        .querySelector('[data-testid="destination-gallery-panel"]')
        ?.getAttribute("data-crystal-mode"),
    ).toBe("artifact");
  });

  it("does not render dashboard cards, export menus, or gem orbs", async () => {
    render({ exportText: "Draft" });
    await flushGoogleStatus();
    expect(container.querySelector(".destination-gallery-card")).toBeFalsy();
    expect(container.querySelector(".destination-gallery-crystal__gem")).toBeFalsy();
    expect(container.querySelector(".destination-gallery-panel__mote")).toBeFalsy();
    expect(container.querySelector('[data-testid="mock-export-actions"]')).toBeFalsy();
    expect(container.textContent).not.toContain("Choose where this work should go");
    expect(container.textContent).not.toContain("Plan your time");
  });

  it("marks Google Docs crystal needs_connection when Google is disconnected", async () => {
    render({ exportText: "Draft" });
    await flushGoogleStatus();
    const docs = container.querySelector(
      '[data-testid="destination-crystal-google-docs"]',
    );
    expect(docs?.getAttribute("data-crystal-state")).toBe("needs_connection");
    const pdf = container.querySelector(
      '[data-testid="destination-crystal-pdf"]',
    );
    expect(pdf?.getAttribute("data-crystal-state")).toBe("connected");
  });

  it("keeps crystals visible when a prepared connection whisper is shown", async () => {
    const design = resolveCrystalActivation("create");
    render({
      prepared: design,
      onOpenConnections: vi.fn(),
      exportText: "Draft",
    });
    await flushGoogleStatus();
    expect(
      container.querySelector(
        '[data-testid="destination-needs-connection-message"]',
      )?.textContent,
    ).toMatch(/Canva/i);
    expect(
      container.querySelector('[data-testid="destination-crystal-pdf"]'),
    ).toBeTruthy();
    expect(container.textContent).not.toContain("Create Studio");
    expect(container.querySelector('[data-testid="mock-export-actions"]')).toBeFalsy();
  });

  it("supports keyboard Enter activation on a destination crystal", async () => {
    render({ exportText: "Draft body for print" });
    await flushGoogleStatus();
    const print = container.querySelector(
      '[data-testid="destination-crystal-print"]',
    ) as HTMLButtonElement;
    expect(print.getAttribute("aria-label")).toMatch(/Print/i);
    act(() => {
      print.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(print.getAttribute("data-activating")).toBe("false");
  });

  it("plays activation state before running the destination", async () => {
    render({ exportText: "Draft" });
    await flushGoogleStatus();
    const crystal = container.querySelector(
      '[data-testid="destination-crystal-pdf"]',
    ) as HTMLButtonElement;
    act(() => {
      crystal.click();
    });
    expect(crystal.getAttribute("data-activating")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(400);
    });
  });

  it("maps artwork pillars for documentation without requiring all six active", () => {
    expect(DESTINATION_GALLERY_CRYSTALS.map((c) => c.id)).toEqual([
      "schedule",
      "write",
      "save",
      "spark-social-media",
      "print",
      "create",
    ]);
    expect(DESTINATION_CRYSTAL_HIT_AREAS.map((a) => a.artworkLabel)).toEqual([
      "Schedule",
      "Write",
      "Save",
      "Spark Social Media",
      "Print",
      "Create",
    ]);
  });
});
