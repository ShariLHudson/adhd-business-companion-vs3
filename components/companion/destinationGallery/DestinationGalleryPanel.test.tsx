/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DESTINATION_GALLERY_CRYSTALS } from "@/lib/destinationGallery";

import { DestinationGalleryPanel } from "./DestinationGalleryPanel";

vi.mock("next/image", () => ({
  default: function MockImage(props: {
    alt?: string;
    src?: string;
    fill?: boolean;
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

describe("DestinationGalleryPanel labels", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function render(onSelectCrystal?: ReturnType<typeof vi.fn>) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<DestinationGalleryPanel onSelectCrystal={onSelectCrystal} />);
    });
  }

  it("keeps crystal IDs and data-testid values unchanged", () => {
    render();
    const expectedIds = [
      "schedule",
      "write",
      "save",
      "spark-social-media",
      "print",
      "create",
    ] as const;
    for (const id of expectedIds) {
      expect(
        container.querySelector(`[data-testid="destination-crystal-${id}"]`),
      ).toBeTruthy();
    }
    expect(DESTINATION_GALLERY_CRYSTALS.map((c) => c.id)).toEqual([
      ...expectedIds,
    ]);
  });

  it("renders clarified member-facing labels", () => {
    render();
    const panel = container.querySelector(
      '[data-testid="destination-gallery-panel"]',
    );
    expect(panel).toBeTruthy();

    const expectedLabels: Record<string, string> = {
      schedule: "Schedule",
      write: "Document",
      save: "Store",
      "spark-social-media": "Share",
      print: "Print",
      create: "Design",
    };

    for (const [id, label] of Object.entries(expectedLabels)) {
      const button = container.querySelector(
        `[data-testid="destination-crystal-${id}"]`,
      );
      const nameEl = button?.querySelector(".font-serif.text-2xl");
      expect(nameEl?.textContent).toBe(label);
    }

    expect(container.textContent).not.toContain("Spark Social Media");
  });

  it("preserves purpose and hands/capability registry fields", () => {
    const byId = Object.fromEntries(
      DESTINATION_GALLERY_CRYSTALS.map((c) => [c.id, c]),
    );
    expect(byId.write?.purpose).toBe("Save written content.");
    expect(byId.write?.hands).toEqual(["Google Docs"]);
    expect(byId.save?.hands).toEqual(["Google Drive"]);
    expect(byId.create?.hands).toEqual(["Canva"]);
    expect(byId["spark-social-media"]?.requiresPublishApproval).toBe(true);
    expect(byId.create?.capabilities).toContain("Create presentations");
  });

  it("does not route on crystal click when handler is omitted (no wiring)", () => {
    render();
    const crystal = container.querySelector(
      '[data-testid="destination-crystal-write"]',
    ) as HTMLButtonElement;
    expect(crystal).toBeTruthy();
    act(() => {
      crystal.click();
    });
    // Still on Destination Gallery — no navigation side effects from click alone.
    expect(
      container.querySelector('[data-testid="destination-gallery-panel"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="destination-crystal-write"]'),
    ).toBeTruthy();
  });

  it("invokes optional onSelectCrystal with crystal id only (no routing)", () => {
    const onSelectCrystal = vi.fn();
    render(onSelectCrystal);
    const crystal = container.querySelector(
      '[data-testid="destination-crystal-create"]',
    ) as HTMLButtonElement;
    act(() => {
      crystal.click();
    });
    expect(onSelectCrystal).toHaveBeenCalledTimes(1);
    expect(onSelectCrystal.mock.calls[0]?.[0]?.id).toBe("create");
    expect(onSelectCrystal.mock.calls[0]?.[0]?.name).toBe("Design");
  });
});
