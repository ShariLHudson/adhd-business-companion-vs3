/**
 * Welcome Home — focused submenu replaces top-level (desktop + mobile).
 * My Day restores two nested dropdowns (098).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";

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
  const onOpenPlanMyDay = vi.fn();
  const onOpenAdaptMyDay = vi.fn();
  const onOpenCalendar = vi.fn();
  const onOpenRemindersRhythms = vi.fn();
  const onOpenReminders = vi.fn();
  const onOpenRhythms = vi.fn();
  const onExploreSpark = vi.fn();
  const onOpenSparkEstateGuide = vi.fn();
  const onOpenStrategyLibrary = vi.fn();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onOpenAdaptPlanMyDay.mockReset();
    onOpenPlanMyDay.mockReset();
    onOpenAdaptMyDay.mockReset();
    onOpenCalendar.mockReset();
    onOpenRemindersRhythms.mockReset();
    onOpenReminders.mockReset();
    onOpenRhythms.mockReset();
    onExploreSpark.mockReset();
    onOpenSparkEstateGuide.mockReset();
    onOpenStrategyLibrary.mockReset();
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
          onOpenPlanMyDay={onOpenPlanMyDay}
          onOpenAdaptMyDay={onOpenAdaptMyDay}
          onOpenCalendar={onOpenCalendar}
          onOpenRemindersRhythms={onOpenRemindersRhythms}
          onOpenReminders={onOpenReminders}
          onOpenRhythms={onOpenRhythms}
          onExploreSpark={onExploreSpark}
          onOpenSparkEstateGuide={onOpenSparkEstateGuide}
          onOpenStrategyLibrary={onOpenStrategyLibrary}
          onOpenCreateStudio={() => undefined}
          onOpenProjects={() => undefined}
          onOpenDestinationGallery={() => undefined}
          onOpenCartographersStudio={() => undefined}
          onOpenTalkItOut={() => undefined}
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

  it("opens with five top-level categories ending in Estate — no destinations yet", () => {
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
      container.querySelector('[data-testid="estate-room-menu-section-spark-estate"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="estate-open-adapt-plan-my-day"]'),
    ).toBeFalsy();
    expect(
      container.querySelector('[data-testid="welcome-home-nav-back"]'),
    ).toBeFalsy();
  });

  it("My Day replaces top-level with three rows (two dropdowns + Calendar)", () => {
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
    ).toBe("Today");

    const labels = Array.from(
      container.querySelectorAll(
        '[data-testid="welcome-home-submenu-my-day"] .estate-room-experience-menu__item--dropdown-toggle .estate-room-experience-menu__item-label, [data-testid="welcome-home-submenu-my-day"] > .estate-room-experience-menu__item--nav:not(.estate-room-experience-menu__item--dropdown-toggle):not(.estate-room-experience-menu__item--dropdown-child) .estate-room-experience-menu__item-label',
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual([
      "Plan My Day / Adapt My Day",
      "Calendar",
      "Reminders / Rhythms",
    ]);

    expect(
      container.querySelector(
        '[data-testid="welcome-home-dropdown-adapt-plan-my-day"]',
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        '[data-testid="welcome-home-dropdown-reminders-rhythms"]',
      ),
    ).toBeTruthy();

    expect(
      container.querySelector('[data-testid="estate-room-menu-section-my-work"]'),
    ).toBeFalsy();
    expect(
      container.querySelector(
        '[data-testid="estate-room-menu-section-take-a-moment"]',
      ),
    ).toBeFalsy();
    expect(
      container.querySelector(
        '[data-testid="estate-room-menu-section-spark-estate"]',
      ),
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

  it("Plan My Day / Adapt My Day parent opens shared window", () => {
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
    expect(onOpenPlanMyDay).not.toHaveBeenCalled();
    expect(onOpenAdaptMyDay).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-testid="estate-room-quick-choices"]'),
    ).toBeFalsy();
  });

  it("Reminders / Rhythms parent opens shared window; child opens Reminders", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");
    act(() => {
      (
        container.querySelector(
          '[data-testid="welcome-home-dropdown-toggle-reminders-rhythms"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenRemindersRhythms).not.toHaveBeenCalled();

    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-reminders"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenReminders).toHaveBeenCalledTimes(1);
    expect(onOpenRhythms).not.toHaveBeenCalled();
  });

  it("Adapt My Day child opens Adapt shared selection", () => {
    renderMenu();
    openMenu();
    openCategory("my-day");
    act(() => {
      (
        container.querySelector(
          '[data-testid="welcome-home-dropdown-toggle-adapt-plan-my-day"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-adapt-my-day"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenAdaptMyDay).toHaveBeenCalledTimes(1);
    expect(onOpenPlanMyDay).not.toHaveBeenCalled();
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

      const expectedTopLabels = category.destinations.map((d) => d.label);
      const labels = Array.from(
        container.querySelectorAll(
          `[data-testid="welcome-home-submenu-${categoryId}"] .estate-room-experience-menu__item--dropdown-toggle .estate-room-experience-menu__item-label, [data-testid="welcome-home-submenu-${categoryId}"] > .estate-room-experience-menu__item--nav:not(.estate-room-experience-menu__item--dropdown-child) .estate-room-experience-menu__item-label`,
        ),
      ).map((el) => el.textContent?.trim());
      // Deduplicate toggle labels that also match the broader nav selector.
      const unique = [...new Set(labels)];
      expect(unique).toEqual(expectedTopLabels);
    },
  );

  it("Estate replaces top-level with Wander the Grounds + Spark Estate Guide", () => {
    renderMenu();
    openMenu();
    openCategory("spark-estate");

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
    ).toBe("Estate");

    const labels = Array.from(
      container.querySelectorAll(
        '[data-testid="welcome-home-submenu-spark-estate"] .estate-room-experience-menu__item-label',
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(["Wander the Grounds", "Spark Estate Guide"]);

    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      if (category.id === "spark-estate") continue;
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
    openCategory("spark-estate");
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

  it("Wander the Grounds opens Explore without opening the Guide", () => {
    renderMenu();
    openMenu();
    openCategory("spark-estate");
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-wander-the-grounds"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onExploreSpark).toHaveBeenCalledTimes(1);
    expect(onOpenSparkEstateGuide).not.toHaveBeenCalled();
  });
});
