/**
 * Settings Fix 5 — Notification Sounds must only show a dropdown for a
 * category that a real event can actually play. Reminder, Rhythm, and
 * Priority Alert are wired to real events (see
 * CompanionPageClient.notificationSoundWiring.test.ts); Shari Check-In and
 * Attention Needed have no production trigger anywhere in the app, so they
 * must stay hidden rather than promise a sound that can never play.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

const SOURCE_PATH = "components/companion/NotificationSoundPreferences.tsx";

describe("NotificationSoundPreferences — honest visibility (Settings Fix 5)", () => {
  it("only Reminder, Rhythm, and Priority Alert are ever shown", () => {
    const source = read(SOURCE_PATH);
    const match = source.match(
      /const visibleFamilies = NOTIFICATION_SOUND_FAMILIES\.filter\(([\s\S]*?)\);/,
    );
    expect(match).not.toBeNull();
    const filterBody = match![1]!;
    expect(filterBody).toContain('family.id === "reminder"');
    expect(filterBody).toContain('family.id === "rhythm"');
    expect(filterBody).toContain('family.id === "priority-alert"');
    // Neither dead category may appear anywhere in the filter — not even as
    // a conditionally-true branch (that was the original bug).
    expect(filterBody).not.toContain("shari-check-in");
    expect(filterBody).not.toContain("attention-needed");
    // Priority Alert must not be gated behind an unrelated toggle now that
    // it is wired to a real event — it should always show, like Reminder
    // and Rhythm.
    expect(filterBody).not.toContain("attentionNeededEnabled");
  });

  it("removed the Attention Needed toggle and note — no dead control left for a hidden category", () => {
    const source = read(SOURCE_PATH);
    expect(source).not.toContain("Allow Attention Needed sounds");
    expect(source).not.toContain("attention-needed-toggle");
    expect(source).not.toContain("attention-needed-note");
    expect(source).not.toContain("attentionNeededEnabled");
    expect(source).not.toContain("SettingsToggle");
  });

  it("Test sound / preview / None still work for whichever families remain visible", () => {
    const source = read(SOURCE_PATH);
    expect(source).toContain("Test sound");
    expect(source).toContain("previewSelected(selected)");
    expect(source).toContain("None");
  });

  it("does not touch estate ambience, soundscape, or layered audio code", () => {
    const source = read(SOURCE_PATH);
    expect(source).not.toMatch(/estateAmbience|Soundscape|layeredAudio/i);
  });
});
