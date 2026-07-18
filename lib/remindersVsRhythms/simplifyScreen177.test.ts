/**
 * Package 177 — Reminders & Rhythms simplification source contracts.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("177 Reminders & Rhythms simplification", () => {
  it("entrance panel uses tabs instead of dual choice cards", () => {
    const entrance = read(
      "components/companion/RemindersRhythmsEntrancePanel.tsx",
    );
    expect(entrance).toContain('role="tablist"');
    expect(entrance).toContain("reminders-rhythms-tabs");
    expect(entrance).toContain("data-active-tab={activeTab}");
    expect(entrance).toContain("REMINDERS_RHYTHMS_TAB_STORAGE_KEY");
    expect(entrance).not.toContain("entrance-reminder-card");
    expect(entrance).not.toContain("entrance-rhythm-card");
  });

  it("does not show Start with a template or How rhythms work (arrival already explains)", () => {
    const chrome = read("components/companion/ReminderRhythmRoomChrome.tsx");
    const reminders = read("components/companion/RemindersRoomPanel.tsx");
    const rhythms = read("components/companion/RhythmsRoomPanel.tsx");
    expect(chrome).not.toContain("Start with a template");
    expect(chrome).not.toContain("How rhythms work");
    expect(chrome).not.toContain("reminders-template-dropdown");
    expect(chrome).not.toContain("rhythms-template-dropdown");
    expect(reminders).not.toContain("ReminderStartExamples");
    expect(rhythms).not.toContain("RhythmStartExamples");
    expect(rhythms).not.toContain("RhythmsAreFlexibleSection");
  });

  it("embedded rhythms hides sounds and today; paused collapses", () => {
    const rhythms = read("components/companion/RhythmsRoomPanel.tsx");
    expect(rhythms).toMatch(
      /!embedded \? \([\s\S]*<NotificationSoundPreferences \/>[\s\S]*\) : null/,
    );
    expect(rhythms).toContain("collapsedByDefault={embedded}");
    expect(rhythms).toContain("hideEmptyCta={embedded}");
    expect(rhythms).toContain("rhythms-snooze-");
    expect(rhythms).toMatch(/!embedded \? \([\s\S]*rhythms-today/);
  });

  it("embedded reminders hides bottom settings and actions explained", () => {
    const reminders = read("components/companion/RemindersRoomPanel.tsx");
    expect(reminders).toContain('!embedded ? <ReminderActionsExplained /> : null');
    expect(reminders).toContain("Create a Reminder");
    expect(reminders).toContain("collapsedByDefault={embedded}");
    expect(reminders).toMatch(
      /!embedded \? \([\s\S]*reminders-bottom-settings/,
    );
  });

  it("embedded rhythms has at most one Create a Rhythm CTA in body", () => {
    const rhythms = read("components/companion/RhythmsRoomPanel.tsx");
    const embeddedSection = rhythms.slice(
      rhythms.indexOf("hideEmptyCta={embedded}"),
    );
    const createMatches = embeddedSection.match(/Create a Rhythm/g) ?? [];
    expect(createMatches.length).toBeLessThanOrEqual(2);
    expect(rhythms).toContain('data-testid="rhythms-show-add-form"');
  });

  it("notification sounds compact mode shares one about accordion", () => {
    const sounds = read(
      "components/companion/NotificationSoundPreferences.tsx",
    );
    expect(sounds).toContain("compactAbout");
    expect(sounds).toContain("About notification sounds");
    expect(sounds).toContain("notification-sound-help-compact");
    const entrance = read(
      "components/companion/RemindersRhythmsEntrancePanel.tsx",
    );
    expect(entrance).toContain("compactAbout");
    expect(entrance).toContain("reminders-rhythms-open-sounds");
  });
});
