/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectHomeCard } from "@/components/companion/projectHomes/ProjectHomeCard";
import { ConnectedPlacesSection } from "@/components/companion/projectHomes/ConnectedPlacesSection";
import { ProjectHomesPrototypePanel } from "@/components/companion/projectHomes/ProjectHomesPrototypePanel";
import {
  SAMPLE_PROJECT_HOMES,
  SAMPLE_PROJECTS_GALLERY_NOTE,
} from "@/lib/projectHomes";

vi.mock("@/components/companion/scene/CinematicBackground", () => ({
  CinematicBackground: () => <div data-testid="mock-cinematic" />,
}));

vi.mock("@/lib/roomBackgroundPreload", () => ({
  preloadRoomBackground: () => undefined,
}));

vi.mock("@/lib/roomBackgroundAssets", () => ({
  roomBackgroundImageStyle: () => ({}),
}));

describe("Project Homes UI usability", () => {
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

  it("renders sample badge, Open affordance, and opens on card click", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    act(() => {
      root.render(<ProjectHomeCard project={sample} onOpen={onOpen} />);
    });

    expect(
      container.querySelector(
        `[data-testid="project-home-sample-badge-${sample.id}"]`,
      )?.textContent,
    ).toContain("Sample");
    expect(container.querySelector(".project-home-card__open")?.textContent).toBe(
      "Open",
    );

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-card-${sample.id}"]`,
        ) as HTMLElement
      ).click();
    });
    expect(onOpen).toHaveBeenCalledWith(sample.id);
  });

  it("opens on keyboard Enter", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    act(() => {
      root.render(<ProjectHomeCard project={sample} onOpen={onOpen} />);
    });
    const card = container.querySelector(
      `[data-testid="project-home-card-${sample.id}"]`,
    ) as HTMLElement;
    act(() => {
      card.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(onOpen).toHaveBeenCalledWith(sample.id);
  });

  it("opens options menu without opening the card", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    const onAction = vi.fn();
    act(() => {
      root.render(
        <ProjectHomeCard
          project={sample}
          onOpen={onOpen}
          onAction={onAction}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-options-${sample.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container.querySelector(`[data-testid="project-home-menu-${sample.id}"]`),
    ).toBeTruthy();
    expect(onOpen).not.toHaveBeenCalled();
    expect(
      container.querySelector(`[data-testid="project-home-delete-${sample.id}"]`),
    ).toBeNull();
  });

  it("requires confirmation before delete on member projects", () => {
    const member = {
      ...SAMPLE_PROJECT_HOMES[0]!,
      id: "ph-member-test",
      isSample: false,
      name: "Member Draft",
    };
    const onAction = vi.fn();
    act(() => {
      root.render(
        <ProjectHomeCard
          project={member}
          onOpen={() => undefined}
          onAction={onAction}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-options-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-delete-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    expect(onAction).not.toHaveBeenCalled();
    expect(
      container.querySelector(
        `[data-testid="project-home-delete-confirm-${member.id}"]`,
      )?.textContent,
    ).toContain("Delete this project?");

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-delete-confirm-yes-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    expect(onAction).toHaveBeenCalledWith("delete", member.id);
  });

  it("gallery shows sample note and sample badges", () => {
    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });
    expect(
      container.querySelector('[data-testid="project-homes-sample-note"]')
        ?.textContent,
    ).toContain(SAMPLE_PROJECTS_GALLERY_NOTE);
    for (const sample of SAMPLE_PROJECT_HOMES) {
      expect(
        container.querySelector(
          `[data-testid="project-home-sample-badge-${sample.id}"]`,
        ),
      ).toBeTruthy();
    }
  });

  it("card open from gallery reaches detail", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });
    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-card-${sample.id}"]`,
        ) as HTMLElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="project-home-detail"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-detail-sample-badge"]')
        ?.textContent,
    ).toContain("Example Project");
    expect(
      container.querySelector('[data-testid="project-home-structure"]'),
    ).toBeTruthy();
  });

  it("Connected Places render preparing state without buttons", () => {
    const html = renderToStaticMarkup(
      <ConnectedPlacesSection projectHomeId="writing-room" />,
    );
    expect(html).toContain("Coming soon — this connection is being prepared.");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("<button");
    expect(html).toContain('data-testid="project-homes-connected-places"');
  });
});
