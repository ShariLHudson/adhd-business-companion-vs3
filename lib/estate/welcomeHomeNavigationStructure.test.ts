import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_FORBIDDEN_LABELS,
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_WANDER_GROUNDS,
  welcomeHomeHasExperienceControls,
  welcomeHomeMyDayDestinationIds,
  welcomeHomeNavMaxDepth,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeNavigationStructure", () => {
  it("has five intent categories and max depth two", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES).toHaveLength(5);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "my-work",
      "take-a-moment",
      "my-story",
      "get-advice",
    ]);
    expect(welcomeHomeNavMaxDepth()).toBe(2);
  });

  it("places Wander the Grounds outside categories", () => {
    expect(WELCOME_HOME_WANDER_GROUNDS.label).toBe("Wander the Grounds");
    expect(WELCOME_HOME_WANDER_GROUNDS.opens).toBe("explore-estate");
    expect(
      WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "wander-the-grounds"),
    ).toBe(false);
  });

  it("My Day has exactly three combined destinations", () => {
    const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
    expect(myDay?.destinations.map((d) => d.id)).toEqual([
      "adapt-plan-my-day",
      "calendar",
      "reminders-rhythms",
    ]);
    expect(myDay?.destinations.map((d) => d.label)).toEqual([
      "Adapt / Plan My Day",
      "Calendar",
      "Reminders / Rhythms",
    ]);
    expect(welcomeHomeMyDayDestinationIds()).toHaveLength(3);
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
      "Projects",
      "Destination Gallery",
      "Cartographer’s Studio",
    ]);
    expect(byId["take-a-moment"]).toEqual([
      "Clear My Mind",
      "Parking Lot",
      "Breathe",
      "Spin the Wheel",
      "Peaceful Places",
      "Soundscapes",
    ]);
    expect(byId["my-story"]).toEqual([
      "Journal Gazebo",
      "Evidence Vault",
      "Hall of Accomplishments",
    ]);
    expect(byId["get-advice"]).toEqual([
      "Chamber of Momentum",
      "Boardroom",
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

  it("opens Peaceful Places and Soundscapes as destinations, not nested flyouts", () => {
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
    expect(source).toMatch(/focusedCategory/);
    expect(source).toMatch(/focused-submenu/);
    expect(source).toMatch(/‹ Back to Welcome Home/);
    expect(source).not.toMatch(/expandedCategory/);
    expect(source).not.toMatch(/mobileDrillIn/);
    expect(source).not.toMatch(/isExpanded && !mobileDrillIn/);
    expect(source).toMatch(/onOpenRemindersRhythms/);
    expect(source).toMatch(/onOpenAdaptPlanMyDay/);
  });
});
