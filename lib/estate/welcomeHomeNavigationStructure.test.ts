import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_DESTINATION_ALIASES,
  WELCOME_HOME_FORBIDDEN_LABELS,
  WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  WELCOME_HOME_MY_STORY_DESTINATION_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_WANDER_GROUNDS,
  resolveWelcomeHomeDestinationAlias,
  welcomeHomeFlattenCategoryDestinations,
  welcomeHomeHasExperienceControls,
  welcomeHomeMyDayDestinationIds,
  welcomeHomeMyDayDropdown,
  welcomeHomeNavMaxDepth,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeNavigationStructure (Prompt 144)", () => {
  it("has intention categories with Estate last and max depth three", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "my-work",
      "take-a-moment",
      "audio",
      "cartography",
      "get-advice",
      "spark-estate",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label)).toEqual([
      "Today",
      "Work to Create",
      "Focus & Reflection",
      "Audio",
      "Cartography",
      "Guidance",
      "Estate",
    ]);
    expect(welcomeHomeNavMaxDepth()).toBe(3);
    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      expect(category.subtitle.length).toBeGreaterThan(12);
    }
  });

  it("keeps Today planning destinations unchanged (Plan My Day lives here)", () => {
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
    expect(WELCOME_HOME_NAV_CATEGORIES.at(-1)?.id).toBe("spark-estate");
    expect(WELCOME_HOME_WANDER_GROUNDS.label).toBe("Wander the Grounds");
  });

  it("reshapes Work to Create, Focus & Reflection, Audio, and Cartography", () => {
    const byId = Object.fromEntries(
      WELCOME_HOME_NAV_CATEGORIES.map((c) => [
        c.id,
        c.destinations.map((d) => d.label),
      ]),
    );
    expect(byId["my-work"]).toEqual([
      "Create New Work",
      "Projects",
      "Strategies",
      "Spin the Wheel",
      "Destination Gallery",
    ]);
    expect(byId["take-a-moment"]).toEqual([
      "Talk It Out",
      "Clear My Mind",
      "Parking Lot",
      "Breathe",
      "Browse more",
    ]);
    expect(byId["audio"]).toEqual([
      "Peaceful Moments",
      "Soundscapes",
      "Nature Sounds",
      "Focus Audio",
      "Guided Audio",
      "Relaxation Audio",
    ]);
    expect(byId["cartography"]).toEqual(["Cartographer’s Studio"]);
    expect(byId["get-advice"]).toEqual([
      "Chamber of Momentum",
      "Boardroom",
    ]);

    const browse = welcomeHomeMyDayDropdown("reflect-more");
    expect(browse?.dropdownChildren?.map((c) => c.id)).toEqual([
      "journal",
      "evidence-vault",
      "hall-of-accomplishments",
    ]);
    expect(browse?.dropdownChildren?.map((c) => c.id)).not.toContain(
      "peaceful-places",
    );
    expect(browse?.dropdownChildren?.map((c) => c.id)).not.toContain(
      "spin-the-wheel",
    );

    const reflectFlat = welcomeHomeFlattenCategoryDestinations("take-a-moment");
    expect(
      WELCOME_HOME_MY_STORY_DESTINATION_IDS.every((id) =>
        reflectFlat.some((d) => d.id === id),
      ),
    ).toBe(true);
    expect(reflectFlat.some((d) => d.id === "breathe")).toBe(true);
    expect(reflectFlat.some((d) => d.id === "peaceful-places")).toBe(false);
  });

  it("aliases Audio destinations without breaking routing", () => {
    expect(resolveWelcomeHomeDestinationAlias("nature-sounds")).toBe(
      "peaceful-places",
    );
    expect(resolveWelcomeHomeDestinationAlias("guided-audio")).toBe(
      "soundscapes",
    );
    expect(resolveWelcomeHomeDestinationAlias("relaxation-audio")).toBe(
      "soundscapes",
    );
    expect(WELCOME_HOME_DESTINATION_ALIASES["explore-estate"]).toBe(
      "wander-the-grounds",
    );
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

  it("opens Peaceful Moments and Soundscapes from Audio, not Focus & Reflection", () => {
    const audio = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "audio");
    expect(audio?.destinations.map((d) => d.id)).toEqual(
      expect.arrayContaining(["peaceful-places", "soundscapes", "focus-audio"]),
    );
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    expect(source).toMatch(/onOpenPeacefulPlaces/);
    expect(source).toMatch(/onOpenSoundscapes/);
    expect(source).toMatch(/onOpenFocusAudio/);
    expect(source).toMatch(/welcome-home-category-subtitle/);
    expect(source).not.toMatch(/data-testid="estate-room-chat-toggle"/);
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
    expect(source).toMatch(/onOpenReminders/);
    expect(source).toMatch(/onOpenPlanMyDay/);
    expect(source).toMatch(/dropdownChildren/);
    expect(source).toMatch(/openFocusedPanel\(category\.id\)/);
  });
});
