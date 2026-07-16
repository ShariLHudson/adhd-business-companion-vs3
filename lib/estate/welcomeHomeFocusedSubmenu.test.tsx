/**
 * Welcome Home — focused submenu replaces top-level (desktop + mobile).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import {
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_WANDER_GROUNDS,
} from "@/lib/estate/welcomeHomeNavigationStructure";

vi.mock("@/lib/estate/useIdleChromeReveal", () => ({
  useIdleChromeReveal: () => ({
    fullscreen: false,
    faded: false,
    bumpVisibility: () => undefined,
  }),
}));

describe("Welcome Home focused submenu", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onOpenAdaptPlanMyDay = vi.fn();
  const onOpenCalendar = vi.fn();
  const onOpenRemindersRhythms = vi.fn();
  const onExploreSpark = vi.fn();
  const onOpenSparkEstateGuide = vi.fn();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onOpenAdaptPlanMyDay.mockReset();
    onOpenCalendar.mockReset();
    onOpenRemindersRhythms.mockReset();
    onExploreSpark.mockReset();
    onOpenSparkEstateGuide.mockReset();
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
          onOpenAdaptPlanMyDay={onOpenAdaptPlanMyDay}
          onOpenCalendar={onOpenCalendar}
          onOpenRemindersRhythms={onOpenRemindersRhythms}
          onExploreSpark={onExploreSpark}
          onOpenSparkEstateGuide={onOpenSparkEstateGuide}
          onOpenProjects={() => undefined}
          onOpenDestinationGallery={() => undefined}
          onOpenCartographersStudio={() => undefined}
          onOpenClearMyMind={() => undefined}
          onOpenParkingLot={() => undefined}
          onOpenBreathe={() => undefined}
          onOpenSpinTheWheel={() => undefined}
          onOpenPeacefulPlaces={() => undefined}
          onOpenSoundscapes={() => undefined}
          onOpenJournal={() => undefined}
          onOpenEvidenceVault={() => undefined}
          onOpenHallOfAccomplishments={() => undefined}
          onOpenChamber={() => undefined}
          onOpenBoardroom={() => undefined}
        />,
      );
    });
  }

  function openMenu() {
    const trigger = container.querySelector(
      ".estate-room-experience-menu__trigger",
    ) as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();
    act(() => {
      trigger?.click();
    });
  }

  function openCategory(id: string) {
    const btn = container.querySelector(
      `[data-testid="estate-room-menu-section-${id}"]`,
    ) as HTMLButtonElement | null;
    expect(btn).toBeTruthy();
    act(() => {
      btn?.click();
    });
  }

  it("opens with five top-level categories plus Wander — no destinations yet", () => {
    renderMenu();
    openMenu();
    const panel = container.querySelector(
      '[data-testid="estate-room-quick-choices"]',
    );
    expect(panel?.getAttribute("data-welcome-home-panel")).toBe("top-level");
    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      expect(
        container.querySelector(
          `[data-testid="estate-room-menu-section-${category.id}"]`,
        ),
      ).toBeTruthy();
    }
    expect(
      container.querySelector('[data-testid="estate-open-wander-the-grounds"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="estate-open-adapt-plan-my-day"]'),
    ).toBeFalsy();
    expect(
      container.querySelector('[data-testid="welcome-home-nav-back"]'),
    ).toBeFalsy();
  });

  it("My Day replaces top-level with exactly three destinations + back + heading", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");

    const panel = container.querySelector(
      '[data-testid="estate-room-quick-choices"]',
    );
    expect(panel?.getAttribute("data-welcome-home-panel")).toBe(
      "focused-submenu",
    );
    expect(
      container.querySelector('[data-testid="welcome-home-nav-back"]')
        ?.textContent,
    ).toContain("Back to Welcome Home");
    expect(
      container.querySelector('[data-testid="welcome-home-submenu-heading"]')
        ?.textContent,
    ).toBe("My Day");

    const labels = Array.from(
      container.querySelectorAll(
        '[data-testid="welcome-home-submenu-my-day"] .estate-room-experience-menu__item-label',
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual([
      "Adapt / Plan My Day",
      "Calendar",
      "Reminders / Rhythms",
    ]);

    // Top-level categories must not remain visible underneath.
    expect(
      container.querySelector('[data-testid="estate-room-menu-section-my-work"]'),
    ).toBeFalsy();
    expect(
      container.querySelector(
        '[data-testid="estate-room-menu-section-take-a-moment"]',
      ),
    ).toBeFalsy();
    expect(
      container.querySelector('[data-testid="estate-open-wander-the-grounds"]'),
    ).toBeFalsy();
  });

  it("Back returns to top-level without closing the menu", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");
    act(() => {
      (
        container.querySelector(
          '[data-testid="welcome-home-nav-back"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="estate-room-quick-choices"]'),
    ).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="estate-room-quick-choices"]')
        ?.getAttribute("data-welcome-home-panel"),
    ).toBe("top-level");
    expect(
      container.querySelector('[data-testid="estate-room-menu-section-my-day"]'),
    ).toBeTruthy();
  });

  it("destination click opens once, closes menu, clears submenu", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-adapt-plan-my-day"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenAdaptPlanMyDay).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('[data-testid="estate-room-quick-choices"]'),
    ).toBeFalsy();
  });

  it("Reminders / Rhythms opens shared entrance on first click", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-reminders-rhythms"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenRemindersRhythms).toHaveBeenCalledTimes(1);
  });

  it.each(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id))(
    "category %s replaces top-level with only its destinations",
    (categoryId) => {
      const category = WELCOME_HOME_NAV_CATEGORIES.find(
        (c) => c.id === categoryId,
      )!;
      renderMenu();
      openMenu();
      openCategory(categoryId);

      expect(
        container
          .querySelector('[data-testid="estate-room-quick-choices"]')
          ?.getAttribute("data-welcome-home-panel"),
      ).toBe("focused-submenu");

      for (const other of WELCOME_HOME_NAV_CATEGORIES) {
        if (other.id === categoryId) continue;
        expect(
          container.querySelector(
            `[data-testid="estate-room-menu-section-${other.id}"]`,
          ),
        ).toBeFalsy();
      }

      const labels = Array.from(
        container.querySelectorAll(
          `[data-testid="welcome-home-submenu-${categoryId}"] .estate-room-experience-menu__item-label`,
        ),
      ).map((el) => el.textContent?.trim());
      expect(labels).toEqual(category.destinations.map((d) => d.label));
    },
  );

  it("Wander the Grounds replaces top-level with Explore Estate + Spark Estate Guide", () => {
    renderMenu();
    openMenu();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-wander-the-grounds"]',
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container
        .querySelector('[data-testid="estate-room-quick-choices"]')
        ?.getAttribute("data-welcome-home-panel"),
    ).toBe("focused-submenu");
    expect(
      container.querySelector('[data-testid="welcome-home-nav-back"]')
        ?.textContent,
    ).toContain("Back to Welcome Home");
    expect(
      container.querySelector('[data-testid="welcome-home-submenu-heading"]')
        ?.textContent,
    ).toBe(WELCOME_HOME_WANDER_GROUNDS.label);

    const labels = Array.from(
      container.querySelectorAll(
        '[data-testid="welcome-home-submenu-wander-the-grounds"] .estate-room-experience-menu__item-label',
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(["Explore Estate", "Spark Estate Guide"]);

    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      expect(
        container.querySelector(
          `[data-testid="estate-room-menu-section-${category.id}"]`,
        ),
      ).toBeFalsy();
    }
  });

  it("Spark Estate Guide destination opens once and closes the menu", () => {
    renderMenu();
    openMenu();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-wander-the-grounds"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-spark-estate-guide"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenSparkEstateGuide).toHaveBeenCalledTimes(1);
    expect(onExploreSpark).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-testid="estate-room-quick-choices"]'),
    ).toBeFalsy();
  });
});
