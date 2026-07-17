/**
 * 098 menu structure retained; 103–105 parents open shared windows.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  welcomeHomeMyDayDropdown,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeTwoDropdownMenus (098 + 103 shared windows)", () => {
  it("keeps exactly two My Day dropdown groups — not one combined four-item menu", () => {
    expect(WELCOME_HOME_MY_DAY_DROPDOWN_IDS).toHaveLength(2);
    const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
    const withChildren = myDay?.destinations.filter((d) => d.dropdownChildren);
    expect(withChildren).toHaveLength(2);
    expect(withChildren?.map((d) => d.id)).toEqual([
      "adapt-plan-my-day",
      "reminders-rhythms",
    ]);
  });

  it("routes Plan My Day and Adapt My Day as separate children", () => {
    const group = welcomeHomeMyDayDropdown("adapt-plan-my-day");
    expect(group?.label).toBe("Plan My Day / Adapt My Day");
    expect(group?.dropdownChildren).toEqual([
      { id: "plan-my-day", label: "Plan My Day" },
      { id: "adapt-my-day", label: "Adapt My Day" },
    ]);
  });

  it("routes Reminders and Rhythms as separate children", () => {
    const group = welcomeHomeMyDayDropdown("reminders-rhythms");
    expect(group?.label).toBe("Reminders / Rhythms");
    expect(group?.dropdownChildren).toEqual([
      { id: "reminders", label: "Reminders" },
      { id: "rhythms", label: "Rhythms" },
    ]);
  });

  it("menu wires parents to shared windows and children to shared openers", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/estate/EstateRoomExperienceMenu.tsx",
      ),
      "utf8",
    );
    expect(source).toMatch(/"plan-my-day":\s*onOpenPlanMyDay/);
    expect(source).toMatch(/"adapt-my-day":\s*onOpenAdaptMyDay/);
    expect(source).toMatch(/reminders:\s*onOpenReminders/);
    expect(source).toMatch(/rhythms:\s*onOpenRhythms/);
    expect(source).toMatch(/estate-room-experience-menu__dropdown-children/);
    expect(source).toMatch(/"adapt-plan-my-day":\s*onOpenAdaptPlanMyDay/);
    expect(source).toMatch(/"reminders-rhythms":\s*onOpenRemindersRhythms/);
  });

  it("CompanionPageClient opens shared windows for My Day pairs", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toMatch(
      /onOpenAdaptMyDay=\{\(\) => openPlanAdaptSharedCore\("adapt"\)\}/,
    );
    expect(source).toMatch(
      /onOpenPlanMyDay=\{\(\) => openPlanAdaptSharedCore\("plan"\)\}/,
    );
    expect(source).toMatch(
      /onOpenReminders=\{\(\) => openRemindersRhythmsCore\("reminders"\)\}/,
    );
    expect(source).toMatch(
      /onOpenRhythms=\{\(\) => openRemindersRhythmsCore\("rhythms"\)\}/,
    );
  });

  it("scroll containers exist for panel and nested dropdown children", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/estate-room-experience-menu.css"),
      "utf8",
    );
    expect(css).toMatch(/\.estate-room-experience-menu__panel-scroll/);
    expect(css).toMatch(/overflow-y:\s*auto/);
    expect(css).toMatch(/\.estate-room-experience-menu__dropdown-children/);
  });
});
