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

describe("welcomeHomeNavigationStructure (Prompt 146)", () => {
  it("has finalized intention categories with Estate last", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "my-work",
      "get-advice",
      "take-a-moment",
      "audio",
      "chamber",
      "board",
      "spark-estate",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.label)).toEqual([
      "Today",
      "Work to Create",
      "Guidance",
      "Focus & Reflection",
      "Audio",
      "Chamber",
      "Board",
      "Estate",
    ]);
    expect(welcomeHomeNavMaxDepth()).toBe(3);
    for (const category of WELCOME_HOME_NAV_CATEGORIES) {
      expect(category.subtitle.length).toBeGreaterThan(12);
    }
  });

  it("keeps Today planning destinations (Schedule label for calendar)", () => {
    const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
    expect(myDay?.label).toBe("Today");
    expect(myDay?.destinations.map((d) => d.id)).toEqual([
      "adapt-plan-my-day",
      "calendar",
      "reminders-rhythms",
    ]);
    expect(myDay?.destinations.map((d) => d.label)).toEqual([
      "Plan My Day / Adapt My Day",
      "Schedule",
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

  it("puts Cartography under Work to Create and Strategies under Guidance", () => {
    const byId = Object.fromEntries(
      WELCOME_HOME_NAV_CATEGORIES.map((c) => [
        c.id,
        c.destinations.map((d) => d.label),
      ]),
    );
    expect(byId["my-work"]).toEqual([
      "Create",
      "Projects",
      "Templates",
      "Blueprints",
      "Cartography",
      "Continue Working",
      "Spin the Wheel",
    ]);
    expect(byId["get-advice"]).toEqual(["Strategies"]);
    expect(byId["take-a-moment"]).toEqual([
      "Talk It Out",
      "Clear My Mind",
      "Parking Lot",
      "Breathe",
      "Journal",
      "Evidence Vault",
      "Hall of Accomplishments",
    ]);
    expect(byId["audio"]).toEqual(["Peaceful Moments", "Soundscapes"]);
    expect(byId["chamber"]).toEqual(["Chamber of Momentum"]);
    expect(byId["board"]).toEqual(["Boardroom"]);

    expect(WELCOME_HOME_NAV_CATEGORIES.some((c) => c.id === "cartography")).toBe(
      false,
    );

    const reflectFlat = welcomeHomeFlattenCategoryDestinations("take-a-moment");
    expect(
      WELCOME_HOME_MY_STORY_DESTINATION_IDS.every((id) =>
        reflectFlat.some((d) => d.id === id),
      ),
    ).toBe(true);
    expect(reflectFlat.some((d) => d.id === "peaceful-places")).toBe(false);
    expect(reflectFlat.some((d) => d.id === "strategy-library")).toBe(false);
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
    expect(source).toMatch(/onOpenTemplates/);
    expect(source).toMatch(/onOpenContinueWorking/);
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
