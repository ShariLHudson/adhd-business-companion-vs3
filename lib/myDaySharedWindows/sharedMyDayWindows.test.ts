/**
 * 103–105 — Shared Plan/Adapt and Reminders/Rhythms windows.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ADAPT_MY_DAY_ITEM,
  PLAN_ADAPT_SHARED_SECTION,
  PLAN_MY_DAY_ITEM,
  REMINDER_ITEM,
  REMINDER_VS_RHYTHM_DIFFERENCE,
  REMINDERS_RHYTHMS_SHARED_SECTION,
  RHYTHM_ITEM,
} from "./index";
// REMINDER_VS_RHYTHM_DIFFERENCE asserted in copy contract above

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("shared My Day windows (103–105)", () => {
  it("keeps approved explanation copy for both windows", () => {
    expect(PLAN_MY_DAY_ITEM.description).toMatch(/realistic plan/i);
    expect(ADAPT_MY_DAY_ITEM.description).toMatch(/energy, motivation/i);
    expect(REMINDER_ITEM.description).toMatch(/specific thing/i);
    expect(RHYTHM_ITEM.description).toMatch(/recurring support/i);
    expect(REMINDER_VS_RHYTHM_DIFFERENCE).toMatch(
      /one specific action.*repeatedly over time/i,
    );
  });

  it("exports stable shared section ids", () => {
    expect(PLAN_ADAPT_SHARED_SECTION).toBe("adapt-plan-my-day");
    expect(REMINDERS_RHYTHMS_SHARED_SECTION).toBe("reminders-rhythms");
  });

  it("PlanAdaptSharedWindow owns one How Do I and both child choices", () => {
    const source = read("components/companion/PlanAdaptSharedWindow.tsx");
    expect(source).toContain("plan-adapt-shared-window");
    expect(source).toContain("plan-adapt-shared-how-do-i");
    expect(source).toContain("plan-adapt-shared-choice-plan");
    expect(source).toContain("plan-adapt-shared-choice-adapt");
    expect(source).toContain("AdaptMyDayCheckIn");
    expect(source).toContain("PlanDaySimpleAdd");
    expect(source).toContain("plan-adapt-shared-how-do-i-toggle");
    expect(source).toContain("md:grid-cols-2");
    expect(source).toContain("plan-adapt-open-plan");
    expect(source).toContain("plan-adapt-open-adapt");
    expect(source).toContain("PLAN_MY_DAY_ITEM.supports");
    expect(source).toContain("ADAPT_MY_DAY_ITEM.supports");
    expect(source).not.toContain("reminders-how-do-i");
  });

  it("Plan/Adapt copy includes supports lists and open labels", () => {
    expect(PLAN_MY_DAY_ITEM.openLabel).toBe("Open Plan My Day");
    expect(ADAPT_MY_DAY_ITEM.openLabel).toBe("Open Adapt My Day");
    expect(PLAN_MY_DAY_ITEM.supports.length).toBeGreaterThan(3);
    expect(ADAPT_MY_DAY_ITEM.supports.length).toBeGreaterThan(3);
  });

  it("RemindersRhythmsEntrancePanel is a shared window with inline content", () => {
    const source = read(
      "components/companion/RemindersRhythmsEntrancePanel.tsx",
    );
    expect(source).toContain('data-shared-window="true"');
    expect(source).toContain("reminders-rhythms-shared-how-do-i");
    expect(source).toContain("reminders-rhythms-difference-cue");
    expect(source).toContain("RemindersRoomPanel");
    expect(source).toContain("RhythmsRoomPanel");
    expect(source).toContain("embedded");
    expect(source).toContain("REMINDER_VS_RHYTHM_DIFFERENCE");
    expect(source).toContain("reminders-rhythms-shared-how-do-i-toggle");
  });

  it("Welcome Home parents open shared windows", () => {
    const menu = read(
      "components/companion/estate/EstateRoomExperienceMenu.tsx",
    );
    expect(menu).toMatch(/"adapt-plan-my-day":\s*onOpenAdaptPlanMyDay/);
    expect(menu).toMatch(/"reminders-rhythms":\s*onOpenRemindersRhythms/);
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function openPlanAdaptSharedCore");
    expect(client).toContain(
      'openStandaloneFocusSectionCore("adapt-plan-my-day")',
    );
    expect(client).toContain(
      "onOpenAdaptPlanMyDay={() => openPlanAdaptSharedCore(null)}",
    );
    expect(client).toContain(
      'onOpenPlanMyDay={() => openPlanAdaptSharedCore("plan")}',
    );
    expect(client).toContain(
      'onOpenAdaptMyDay={() => openPlanAdaptSharedCore("adapt")}',
    );
    expect(client).toContain(
      "onOpenRemindersRhythms={() => openRemindersRhythmsCore(null)}",
    );
    expect(client).toContain(
      'onOpenReminders={() => openRemindersRhythmsCore("reminders")}',
    );
    expect(client).toContain(
      'onOpenRhythms={() => openRemindersRhythmsCore("rhythms")}',
    );
  });

  it("room panels support embedded mode without duplicate shells", () => {
    const reminders = read("components/companion/RemindersRoomPanel.tsx");
    const rhythms = read("components/companion/RhythmsRoomPanel.tsx");
    expect(reminders).toContain("embedded = false");
    expect(reminders).toContain("if (embedded) return body");
    expect(rhythms).toContain("embedded = false");
    expect(rhythms).toContain("if (embedded) return body");
  });
});
