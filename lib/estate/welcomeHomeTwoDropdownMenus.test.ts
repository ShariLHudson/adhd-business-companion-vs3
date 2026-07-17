/**
 * 098 — Restore two My Day dropdown menus with independent child routes.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  WELCOME_HOME_NAV_CATEGORIES,
  welcomeHomeMyDayDropdown,
} from "./welcomeHomeNavigationStructure";

describe("welcomeHomeTwoDropdownMenus (098)", () => {
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

  it("menu wires each child to its own opener — not a combined chooser", () => {
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
    // Parent rows must not call the legacy combined openers as navigation.
    expect(source).toMatch(/"adapt-plan-my-day":\s*undefined/);
    expect(source).toMatch(/"reminders-rhythms":\s*undefined/);
  });

  it("CompanionPageClient opens Adapt via openAdaptMyDayCore", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toMatch(/onOpenAdaptMyDay=\{\(\) => openAdaptMyDayCore\(\)\}/);
    expect(source).toMatch(/onOpenPlanMyDay=\{\(\) => openPlanMyDayCore\(\)\}/);
    expect(source).toMatch(/onOpenReminders=\{\(\) => openRemindersCore\(\)\}/);
    expect(source).toMatch(/onOpenRhythms=\{\(\) => openRhythmsCore\(\)\}/);
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
