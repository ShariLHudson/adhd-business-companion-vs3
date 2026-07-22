import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_FORBIDDEN_LABELS,
  WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_WANDER_GROUNDS,
  welcomeHomeHasExperienceControls,
  welcomeHomeMyDayDestinationIds,
  welcomeHomeMyDayDropdown,
  welcomeHomeNavMaxDepth,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeNavigationStructure", () => {
  it("has six categories with Estate last and max depth three for Today dropdowns", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES).toHaveLength(6);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "my-work",
      "take-a-moment",
      "my-story",
      "get-advice",
      "spark-estate",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label)).toEqual([
      "Today",
      "Create",
      "Reflect",
      "My Story",
      "Guidance",
      "Estate",
    ]);
    expect(welcomeHomeNavMaxDepth()).toBe(3);
  });

  it("places Wander the Grounds and Spark Estate Guide under Estate", () => {
    const sparkEstate = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "spark-estate",
    );
    expect(sparkEstate?.label).toBe("Estate");
    expect(sparkEstate?.destinations.map((d) => d.id)).toEqual([
      "wander-the-grounds",
      "spark-estate-guide",
    ]);
    expect(sparkEstate?.destinations.map((d) => d.label)).toEqual([
      "Wander the Grounds",
      "Spark Estate Guide",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.at(-1)?.id).toBe("spark-estate");
    expect(WELCOME_HOME_WANDER_GROUNDS.label).toBe("Wander the Grounds");
  });

  it("Today has two dropdown groups plus Calendar — children are independently routable", () => {
    const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
    expect(myDay?.label).toBe("Today");
    expect(myDay?.destinations.map((d) => d.id)).toEqual([
      "adapt-plan-my-day",
      "calendar",
      "reminders-rhythms",
    ]);
    expect(myDay?.destinations.map((d) => d.label)).toEqual([
      "Plan My Day / Adapt My Day",
      "Calendar",
      "Reminders / Rhythms",
    ]);
    expect(welcomeHomeMyDayDestinationIds()).toHaveLength(3);
    expect(WELCOME_HOME_MY_DAY_DROPDOWN_IDS).toEqual([
      "adapt-plan-my-day",
      "reminders-rhythms",
    ]);

    const planAdapt = welcomeHomeMyDayDropdown("adapt-plan-my-day");
    expect(planAdapt?.dropdownChildren?.map((c) => c.id)).toEqual([
      "plan-my-day",
      "adapt-my-day",
    ]);
    expect(planAdapt?.dropdownChildren?.map((c) => c.label)).toEqual([
      "Plan My Day",
      "Adapt My Day",
    ]);

    const remindersRhythms = welcomeHomeMyDayDropdown("reminders-rhythms");
    expect(remindersRhythms?.dropdownChildren?.map((c) => c.id)).toEqual([
      "reminders",
      "rhythms",
    ]);
    expect(remindersRhythms?.dropdownChildren?.map((c) => c.label)).toEqual([
      "Reminders",
      "Rhythms",
    ]);

    // Children are nested — not top-level My Day rows.
    expect(myDay?.destinations.some((d) => d.id === "plan-my-day")).toBe(false);
    expect(myDay?.destinations.some((d) => d.id === "reminders")).toBe(false);
    expect(myDay?.destinations.some((d) => d.id === "rhythms")).toBe(false);
  });

  it("lists exact destinations for every category", () => {
    const byId = Object.fromEntries(
      WELCOME_HOME_NAV_CATEGORIES.map((c) => [
        c.id,
        c.destinations.map((d) => d.label),
      ]),
    );
    expect(byId["my-work"]).toEqual([
      "Create",
      "Projects",
      "Destination Gallery",
      "Cartographer’s Studio",
    ]);
    expect(byId["take-a-moment"]).toEqual([
      "Talk It Out",
      "Clear My Mind",
      "Parking Lot",
      "Breathe",
      "Spin the Wheel",
      "Peaceful Moments",
      "Soundscapes",
    ]);
    const talk = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "take-a-moment",
    )?.destinations.find((d) => d.id === "talk-it-out");
    expect(talk?.supportLine).toMatch(/one thoughtful question/i);
    expect(byId["my-story"]).toEqual([
      "Journal Gazebo",
      "Evidence Vault",
      "Hall of Accomplishments",
    ]);
    expect(byId["get-advice"]).toEqual([
      "Chamber of Momentum",
      "Boardroom",
      "Strategy Library",
    ]);
    expect(byId["spark-estate"]).toEqual([
      "Wander the Grounds",
      "Spark Estate Guide",
    ]);
  });

  it("never includes Experience Controls in Welcome Home categories", () => {
    expect(
      welcomeHomeHasExperienceControls(
        WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label),
      ),
    ).toBe(false);
    for (const forbidden of WELCOME_HOME_FORBIDDEN_LABELS) {
      const blob = JSON.stringify(WELCOME_HOME_NAV_CATEGORIES);
      expect(blob.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("opens Peaceful Moments and Soundscapes as destinations, not nested flyouts", () => {
    const takeAMoment = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "take-a-moment",
    );
    expect(takeAMoment?.destinations.map((d) => d.id)).toEqual(
      expect.arrayContaining(["peaceful-places", "soundscapes"]),
    );
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    expect(source).not.toMatch(/peacefulPlacesExpanded/);
    expect(source).not.toMatch(/soundscapesExpanded/);
    expect(source).toMatch(/onOpenPeacefulPlaces/);
    expect(source).toMatch(/onOpenSoundscapes/);
    expect(source).not.toMatch(/data-testid="estate-room-chat-toggle"/);
    expect(source).not.toMatch(/Chat off/);
    expect(source).not.toMatch(/Chat on/);
  });

  it("uses focused submenu replace — not accordion stack under top-level", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    expect(source).toMatch(/focusedPanel/);
    expect(source).toMatch(/focused-submenu/);
    expect(source).toMatch(/‹ Back to Welcome Home/);
    expect(source).not.toMatch(/expandedCategory/);
    expect(source).not.toMatch(/mobileDrillIn/);
    expect(source).not.toMatch(/isExpanded && !mobileDrillIn/);
    expect(source).toMatch(/onOpenReminders/);
    expect(source).toMatch(/onOpenRhythms/);
    expect(source).toMatch(/onOpenPlanMyDay/);
    expect(source).toMatch(/onOpenAdaptMyDay/);
    expect(source).toMatch(/dropdownChildren/);
    expect(source).toMatch(/welcome-home-dropdown-/);
    expect(source).toMatch(/onOpenSparkEstateGuide/);
    expect(source).toMatch(/openFocusedPanel\(category\.id\)/);
    expect(source).toMatch(/spark-estate/);
  });
});
