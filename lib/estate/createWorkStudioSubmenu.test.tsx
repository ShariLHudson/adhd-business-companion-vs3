/**
 * My Work — focused submenu (Create · Projects · Destination Gallery · Cartographer).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import { SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS } from "@/lib/estate/sparkEstateTopNavigationAndProfileMenu";

vi.mock("@/lib/estate/useIdleChromeReveal", () => ({
  useIdleChromeReveal: () => ({
    fullscreen: false,
    faded: false,
    bumpVisibility: () => undefined,
  }),
}));

describe("My Work — menu canon", () => {
  it("lists flat destinations with Create first and no type submenu", () => {
    expect(SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((i) => i.id)).toEqual([
      "create",
      "projects",
      "destination-gallery",
      "cartographers-studio",
    ]);
    expect(SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((i) => i.label)).toEqual([
      "Create",
      "Projects",
      "Destination Gallery",
      "Cartographer’s Studio",
    ]);
  });
});

describe("My Work — EstateRoomExperienceMenu focused submenu", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onOpenCreateStudio = vi.fn();
  const onOpenProjects = vi.fn();
  const onOpenDestinationGallery = vi.fn();
  const onOpenCartographersStudio = vi.fn();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onOpenCreateStudio.mockReset();
    onOpenProjects.mockReset();
    onOpenDestinationGallery.mockReset();
    onOpenCartographersStudio.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderMenu() {
    act(() => {
      root.render(
        <EstateRoomExperienceMenu
          roomId="welcome-home"
          embedded
          onBackToEstate={() => undefined}
          onOpenAdaptPlanMyDay={() => undefined}
          onOpenCalendar={() => undefined}
          onOpenRemindersRhythms={() => undefined}
          onOpenCreateStudio={onOpenCreateStudio}
          onOpenProjects={onOpenProjects}
          onOpenDestinationGallery={onOpenDestinationGallery}
          onOpenCartographersStudio={onOpenCartographersStudio}
        />,
      );
    });
  }

  function openMyWork() {
    const trigger = container.querySelector(
      ".estate-room-experience-menu__trigger",
    ) as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();
    act(() => {
      trigger?.click();
    });
    const myWork = container.querySelector(
      '[data-testid="estate-room-menu-section-my-work"]',
    ) as HTMLButtonElement | null;
    expect(myWork).toBeTruthy();
    act(() => {
      myWork?.click();
    });
  }

  it("replaces top-level with Create, Projects, Destination Gallery, Cartographer's Studio", () => {
    renderMenu();
    openMyWork();
    expect(
      container
        .querySelector('[data-testid="estate-room-quick-choices"]')
        ?.getAttribute("data-welcome-home-panel"),
    ).toBe("focused-submenu");
    const labels = Array.from(
      container.querySelectorAll(
        '[data-testid="welcome-home-submenu-my-work"] .estate-room-experience-menu__item-label',
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual([
      "Create",
      "Projects",
      "Destination Gallery",
      "Cartographer’s Studio",
    ]);
    expect(
      container.querySelector('[data-testid="estate-create-submenu"]'),
    ).toBeFalsy();
    expect(
      container.querySelector('[data-testid="estate-room-menu-section-my-day"]'),
    ).toBeFalsy();
  });

  it("opens Create on first click", () => {
    renderMenu();
    openMyWork();
    const create = container.querySelector(
      '[data-testid="estate-open-create"]',
    ) as HTMLButtonElement | null;
    expect(create).toBeTruthy();
    act(() => {
      create?.click();
    });
    expect(onOpenCreateStudio).toHaveBeenCalledTimes(1);
  });

  it("opens Destination Gallery on first click", () => {
    renderMenu();
    openMyWork();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-destination-gallery"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenDestinationGallery).toHaveBeenCalledTimes(1);
  });

  it("keeps Cartographer's Studio as a working sibling", () => {
    renderMenu();
    openMyWork();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-cartographers-studio"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenCartographersStudio).toHaveBeenCalledTimes(1);
  });
});
