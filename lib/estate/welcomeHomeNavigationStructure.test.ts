import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_DESTINATION_ALIASES,
  WELCOME_HOME_FORBIDDEN_LABELS,
  WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  WELCOME_HOME_MY_STORY_DESTINATION_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  WELCOME_HOME_NAV_DROPDOWN_IDS,
  WELCOME_HOME_WANDER_GROUNDS,
  resolveWelcomeHomeDestinationAlias,
  welcomeHomeFlattenCategoryDestinations,
  welcomeHomeHasExperienceControls,
  welcomeHomeMyDayDestinationIds,
  welcomeHomeMyDayDropdown,
  welcomeHomeNavMaxDepth,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeNavigationStructure (Welcome Home IA)", () => {
  it("has finalized intention categories with Spark Estates last", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "build",
      "get-advice",
      "take-a-moment",
      "reflection",
      "audio",
      "spark-estates",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label)).toEqual([
      "Today",
      "Build",
      "Guidance",
      "Focus",
      "Reflection",
      "Audio",
      "Spark Estates",
    ]);
    expect(welcomeHomeNavMaxDepth()).toBe(3);
    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      expect(category.subtitle.length).toBeGreaterThan(12);
    }
  });

  it("keeps Today planning destinations (Calendar label)", () => {
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

  it("places Wander the Estate and Spark Estate Guide under Spark Estates", () => {
    const sparkEstate = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "spark-estates",
    );
    expect(sparkEstate?.label).toBe("Spark Estates");
    expect(sparkEstate?.destinations.map((d) => d.id)).toEqual([
      "wander-the-grounds",
      "spark-estate-guide",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.at(-1)?.id).toBe("spark-estates");
    expect(WELCOME_HOME_WANDER_GROUNDS.label).toBe("Wander the Estate");
  });

  it("places Build / Guidance / Focus / Reflection destinations in IA order", () => {
    const byId = Object.fromEntries(
      WELCOME_HOME_NAV_CATEGORIES.map((c) => [
        c.id,
        c.destinations.map((d) => d.label),
      ]),
    );
    expect(byId.build).toEqual([
      "Create",
      "Projects",
      "Cartography",
    ]);
    expect(byId["get-advice"]).toEqual([
      "Chamber of Momentum",
      "Boardroom",
      "Strategy Chamber",
    ]);
    expect(byId["take-a-moment"]).toEqual([
      "Talk It Out",
      "Clear My Mind",
      "Parking Lot",
      "Breathe",
      "Focus Library",
    ]);
    expect(byId.reflection).toEqual([
      "Journal",
      "Evidence Vault",
      "Hall of Accomplishments",
    ]);
    expect(byId.audio).toEqual(["Peaceful Moments", "Soundscapes"]);

    expect(WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "chamber")).toBe(
      false,
    );
    expect(WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "board")).toBe(
      false,
    );
    expect(WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "my-work")).toBe(
      false,
    );
    expect(WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "cartography")).toBe(
      false,
    );

    const focusFlat = welcomeHomeFlattenCategoryDestinations("take-a-moment");
    const reflectFlat = welcomeHomeFlattenCategoryDestinations("reflection");
    expect(
      WELCOME_HOME_MY_STORY_DESTINATION_IDS.every((id) =>
        reflectFlat.some((d) => d.id === id),
      ),
    ).toBe(true);
    expect(
      WELCOME_HOME_MY_STORY_DESTINATION_IDS.every(
        (id) => !focusFlat.some((d) => d.id === id),
      ),
    ).toBe(true);
    expect(reflectFlat.some((d) => d.id === "peaceful-places")).toBe(false);
    expect(reflectFlat.some((d) => d.id === "strategy-library")).toBe(false);
    expect(focusFlat.some((d) => d.id === "journal")).toBe(false);

    const focusLibrary = welcomeHomeMyDayDropdown("focus-library");
    expect(focusLibrary?.dropdownChildren?.map((c) => c.id)).toEqual([
      "start-focus-session",
      "time-blocking",
      "body-double",
      "timers",
    ]);
    expect(WELCOME_HOME_NAV_DROPDOWN_IDS).toContain("focus-library");
  });

  it("aliases retired Audio destinations without listing them in the menu", () => {
    expect(resolveWelcomeHomeDestinationAlias("nature-sounds")).toBe(
      "peaceful-places",
    );
    expect(resolveWelcomeHomeDestinationAlias("guided-audio")).toBe(
      "soundscapes",
    );
    expect(resolveWelcomeHomeDestinationAlias("relaxation-audio")).toBe(
      "soundscapes",
    );
    expect(resolveWelcomeHomeDestinationAlias("focus-audio")).toBe(
      "peaceful-places",
    );
    expect(WELCOME_HOME_DESTINATION_ALIASES["explore-estate"]).toBe(
      "wander-the-grounds",
    );
    expect(resolveWelcomeHomeDestinationAlias("timers")).toBe(
      "start-focus-session",
    );
    const audio = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "audio");
    expect(audio?.destinations.map((d) => d.id)).toEqual([
      "peaceful-places",
      "soundscapes",
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

  it("opens Peaceful Moments and Soundscapes from Audio only", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    expect(source).toMatch(/onOpenPeacefulPlaces/);
    expect(source).toMatch(/onOpenSoundscapes/);
    expect(source).toMatch(/onOpenFocusLibrary/);
    expect(source).toMatch(/onOpenFocusTimer/);
    expect(source).toMatch(/onOpenBodyDouble/);
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
  });
});

