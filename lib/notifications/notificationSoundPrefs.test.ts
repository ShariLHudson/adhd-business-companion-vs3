/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { NOTIFICATION_SOUND_FAMILIES } from "./notificationSoundCatalog";
import {
  DEFAULT_NOTIFICATION_SOUND_PREFS,
  getNotificationSoundPrefs,
  saveNotificationSoundPrefs,
} from "./notificationSoundPrefs";
import { NOTIFICATION_SOUND_PREFS_KEY } from "./notificationSoundTypes";
import { resolveDeliverableSoundEvent } from "./resolveNotificationSoundEvent";
import {
  resolveSoundOptionForEvent,
} from "./playNotificationSound";

beforeEach(() => {
  localStorage.clear();
});

describe("notificationSoundPrefs", () => {
  it("defaults to calm family sounds with Shari check-in off", () => {
    const prefs = getNotificationSoundPrefs();
    expect(prefs.reminderSoundId).toBe("soft-bell");
    expect(prefs.rhythmSoundId).toBe("wind-chime");
    expect(prefs.priorityAlertSoundId).toBe("priority-soft");
    expect(prefs.shariCheckInSoundId).toBe(null);
    expect(prefs.attentionNeededSoundId).toBe("soft-alert");
  });

  it("saves each family independently and persists after reload", () => {
    saveNotificationSoundPrefs({ reminderSoundId: "piano-note" });
    saveNotificationSoundPrefs({ rhythmSoundId: null });
    const mid = getNotificationSoundPrefs();
    expect(mid.reminderSoundId).toBe("piano-note");
    expect(mid.rhythmSoundId).toBe(null);
    expect(mid.priorityAlertSoundId).toBe(
      DEFAULT_NOTIFICATION_SOUND_PREFS.priorityAlertSoundId,
    );

    const raw = localStorage.getItem(NOTIFICATION_SOUND_PREFS_KEY);
    expect(raw).toBeTruthy();
    localStorage.setItem(NOTIFICATION_SOUND_PREFS_KEY, raw!);
    expect(getNotificationSoundPrefs().reminderSoundId).toBe("piano-note");
    expect(getNotificationSoundPrefs().rhythmSoundId).toBe(null);
  });

  it("rejects stale version writes", () => {
    const first = saveNotificationSoundPrefs({ reminderSoundId: "clear-chime" });
    const rejected = saveNotificationSoundPrefs({
      reminderSoundId: "nature-tone",
      version: first.version - 1,
    });
    expect(rejected.reminderSoundId).toBe("clear-chime");
    expect(rejected.version).toBe(first.version);
  });

  it("exposes five limited families with None support", () => {
    expect(NOTIFICATION_SOUND_FAMILIES.map((f) => f.id)).toEqual([
      "reminder",
      "rhythm",
      "priority-alert",
      "shari-check-in",
      "attention-needed",
    ]);
    for (const family of NOTIFICATION_SOUND_FAMILIES) {
      expect(family.options.length).toBeGreaterThan(0);
    }
  });
});

describe("notification sound routing", () => {
  it("routes rhythms and critical reminders to distinct families", () => {
    expect(
      resolveDeliverableSoundEvent({
        kind: "rhythm",
        id: "r1",
        title: "Walk",
        body: "",
        priority: "supportive",
      }),
    ).toBe("rhythm");
    expect(
      resolveDeliverableSoundEvent({
        kind: "reminder",
        id: "m1",
        title: "Dentist",
        body: "",
        priority: "important",
      }),
    ).toBe("reminder");
    expect(
      resolveDeliverableSoundEvent({
        kind: "reminder",
        id: "m2",
        title: "Board call",
        body: "",
        priority: "critical",
      }),
    ).toBe("priority-alert");
  });

  it("resolves None for disabled categories", () => {
    saveNotificationSoundPrefs({
      reminderSoundId: null,
      attentionNeededEnabled: false,
    });
    expect(resolveSoundOptionForEvent("reminder")).toBe(null);
    expect(resolveSoundOptionForEvent("attention-needed")).toBe(null);
  });
});

describe("NotificationSoundPreferences UI contract", () => {
  it("provides preview and save controls without a second save button", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/NotificationSoundPreferences.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("Play");
    expect(source).toContain("saveNotificationSoundPrefs");
    expect(source).toContain("aria-label={`Play ${option.label} preview`}");
    expect(source).toContain("None");
    expect(source).not.toMatch(/Save changes/i);
  });

  it("Settings Notifications hosts the sound preferences panel", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "components/companion/SettingsPanel.tsx"),
      "utf8",
    );
    expect(source).toContain("NotificationSoundPreferences");
    expect(source).toContain("Test reminder sound");
  });
});
