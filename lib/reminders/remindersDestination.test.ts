/**
 * Welcome Home → My Workday → Reminders destination contract.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { sidebarNavForSection } from "@/lib/companionUi";

const REMINDERS_COPY =
  "Add something you do not want to forget. A date and time are optional.";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Reminders dedicated destination", () => {
  const client = read("app/companion/CompanionPageClient.tsx");
  const menu = read(
    "components/companion/estate/EstateRoomExperienceMenu.tsx",
  );
  const panel = read("components/companion/RemindersRoomPanel.tsx");
  const notif = read(
    "components/companion/RemindersNotificationSettings.tsx",
  );

  it("wires My Workday Reminders to openRemindersCore", () => {
    expect(menu).toMatch(/data-testid="estate-open-reminders"/);
    expect(client).toMatch(/onOpenReminders=\{\(\) => openRemindersCore\(\)\}/);
  });

  it("openRemindersCore opens reminders section — not Settings or Plan My Day", () => {
    const fn = client.match(
      /function openRemindersCore\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openStandaloneFocusSectionCore("reminders")');
    expect(fn).not.toContain("openHowDoISettings");
    expect(fn).not.toContain("openPlanMyDayCore");
    expect(fn).not.toContain('"notifications"');
    expect(fn).not.toContain('"plan-my-day"');
  });

  it("renders RemindersRoomPanel for reminders section", () => {
    expect(client).toMatch(
      /activeSection === "reminders"[\s\S]*?<RemindersRoomPanel/,
    );
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("reminders");
    expect(sidebarNavForSection("reminders")).toBe("plan-my-day");
  });

  it("exposes Add a Reminder, lists, and notification settings in required order markers", () => {
    expect(panel).toContain("reminders-how-do-i");
    expect(panel).toContain("app-back-button");
    expect(panel).toContain("reminders-title");
    expect(panel).toContain("reminders-add-section");
    expect(panel).toContain('testId="reminders-upcoming"');
    expect(panel).toContain('testId="reminders-recurring"');
    expect(panel).toContain('testId="reminders-completed"');
    expect(panel).toContain("RemindersNotificationSettings");
    expect(notif).toContain("reminders-notification-settings");
    expect(panel).toContain("Save Reminder");
    expect(panel).toContain("REMINDERS_HOW_DO_I_COPY");
    expect(read("lib/reminders/reminderForm.ts")).toContain(REMINDERS_COPY);
    const howDoI = panel.indexOf('data-testid="reminders-how-do-i"');
    const add = panel.indexOf('data-testid="reminders-add-section"');
    const upcoming = panel.indexOf('testId="reminders-upcoming"');
    const completed = panel.indexOf('testId="reminders-completed"');
    const settings = panel.lastIndexOf("<RemindersNotificationSettings");
    expect(howDoI).toBeGreaterThan(-1);
    expect(howDoI).toBeLessThan(add);
    expect(add).toBeLessThan(upcoming);
    expect(upcoming).toBeLessThan(completed);
    expect(completed).toBeLessThan(settings);
  });
});
