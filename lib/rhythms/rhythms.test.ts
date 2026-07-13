/**
 * Phase 1 Adaptive Rhythms engine tests.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  createMemberRhythm,
  pauseRhythm,
  resumeRhythm,
  skipRhythmOccurrence,
  snoozeRhythm,
  completeRhythmOccurrence,
  resolveNextDueAt,
  isInQuietHours,
  getRhythmPrefs,
  saveRhythmPrefs,
  filterDeliverables,
  classifyRememberIntent,
  createRhythmFromContent,
  previewProfileRhythms,
  activateRhythmProfile,
  saveRhythmSuggestion,
  acceptRhythmSuggestion,
  setDayCondition,
  shouldOfferSnoozeProtection,
  noteSnoozePattern,
  dismissSnoozeProtection,
  getMemberRhythm,
  WINDOW_DEFAULT_TIMES,
  proposeInvoiceFridaySuggestion,
} from "./index";
import type { Reminder } from "@/lib/reminderStore";

beforeEach(() => {
  localStorage.clear();
});

describe("rhythm store + scheduling", () => {
  it("creates a rhythm with nextDueAt", () => {
    const r = createMemberRhythm({
      title: "Friday finance",
      cadence: "weekly",
      window: "afternoon",
      schedule: { cadence: "weekly", weekdays: ["friday"] },
      category: "business",
    });
    expect(r.title).toBe("Friday finance");
    expect(r.status).toBe("active");
    expect(r.nextDueAt).toBeTruthy();
    expect(r.category).toBe("business");
  });

  it("pauses and resumes", () => {
    const r = createMemberRhythm({ title: "Water", cadence: "daily" });
    const paused = pauseRhythm(r.id);
    expect(paused?.status).toBe("paused");
    expect(paused?.nextDueAt).toBeUndefined();
    const resumed = resumeRhythm(r.id);
    expect(resumed?.status).toBe("active");
    expect(resumed?.nextDueAt).toBeTruthy();
  });

  it("skips an occurrence without deleting the rhythm", () => {
    const r = createMemberRhythm({ title: "Check-in", cadence: "daily" });
    const skipped = skipRhythmOccurrence(r.id);
    expect(skipped?.skippedOccurrenceDates?.length).toBeGreaterThan(0);
    expect(skipped?.status).toBe("active");
  });

  it("snoozes by minutes", () => {
    const r = createMemberRhythm({ title: "Focus", cadence: "daily" });
    const from = new Date("2026-07-12T10:00:00");
    const snoozed = snoozeRhythm(r.id, 30, from);
    expect(new Date(snoozed!.nextDueAt!).getTime()).toBe(
      from.getTime() + 30 * 60_000,
    );
  });

  it("completes occurrence and schedules next", () => {
    const r = createMemberRhythm({ title: "Evening reset", cadence: "daily" });
    const done = completeRhythmOccurrence(r.id, new Date("2026-07-12T18:00:00"));
    expect(done?.lastPromptedAt).toBeTruthy();
    expect(done?.nextDueAt).toBeTruthy();
  });

  it("uses morning window default hour", () => {
    expect(WINDOW_DEFAULT_TIMES.morning.hour).toBe(9);
    const r = createMemberRhythm({
      title: "Morning",
      cadence: "daily",
      window: "morning",
    });
    const due = resolveNextDueAt(r, new Date("2026-07-12T10:00:00"));
    expect(due).toBeTruthy();
    const hour = new Date(due!).getHours();
    expect(hour).toBe(9);
  });
});

describe("quiet hours + load manager", () => {
  it("detects quiet hours wrapping midnight", () => {
    saveRhythmPrefs({ quietHoursStart: "21:00", quietHoursEnd: "08:00" });
    const prefs = getRhythmPrefs();
    expect(isInQuietHours(new Date("2026-07-12T22:00:00"), prefs)).toBe(true);
    expect(isInQuietHours(new Date("2026-07-12T10:00:00"), prefs)).toBe(false);
  });

  it("suppresses optional when important is due", () => {
    saveRhythmPrefs({
      notificationLevel: "active",
      dailyFrequencyCap: "none",
      quietHoursStart: "23:59",
      quietHoursEnd: "00:00",
      promptedCountToday: 0,
      promptedCountDate: "2026-07-12",
    });
    const rhythms = [
      createMemberRhythm({
        title: "Optional spark",
        cadence: "daily",
        priority: "optional",
      }),
      createMemberRhythm({
        title: "Invoice",
        cadence: "daily",
        priority: "important",
      }),
    ].map((r) => ({
      ...r,
      nextDueAt: new Date("2026-07-12T09:00:00").toISOString(),
    }));

    const due = filterDeliverables(rhythms, [], new Date("2026-07-12T10:00:00"));
    expect(due.some((d) => d.title === "Invoice")).toBe(true);
    expect(due.some((d) => d.title === "Optional spark")).toBe(false);
  });

  it("respects critical-only quiet notification level", () => {
    saveRhythmPrefs({
      notificationLevel: "quiet",
      dailyFrequencyCap: "none",
      quietHoursStart: "23:59",
      quietHoursEnd: "00:00",
    });
    const r = createMemberRhythm({
      title: "Meds",
      cadence: "daily",
      priority: "critical",
    });
    const supportive = createMemberRhythm({
      title: "Stretch",
      cadence: "daily",
      priority: "supportive",
    });
    const list = [r, supportive].map((x) => ({
      ...x,
      nextDueAt: new Date("2026-07-12T09:00:00").toISOString(),
    }));
    const due = filterDeliverables(list, [] as Reminder[], new Date("2026-07-12T10:00:00"));
    expect(due).toHaveLength(1);
    expect(due[0]!.priority).toBe("critical");
  });
});

describe("CONV-040 intent classification", () => {
  it("classifies reminder vs rhythm vs calendar", () => {
    expect(classifyRememberIntent("Remind me tomorrow to call Mary")).toBe(
      "reminder",
    );
    expect(classifyRememberIntent("Every Friday remind me to review finances")).toBe(
      "rhythm",
    );
    expect(classifyRememberIntent("Put it on my calendar")).toBe("calendar");
    expect(classifyRememberIntent("Remind me when I get home")).toBe("unclear");
  });

  it("creates rhythm from content", () => {
    const result = createRhythmFromContent({
      title: "Call Susan about the website",
      cadence: "weekly",
      source: "clear_my_mind",
      category: "business",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rhythm.source).toBe("clear_my_mind");
      expect(result.rhythm.title).toContain("Susan");
      expect(result.duplicate).toBe(false);
    }
  });
});

describe("profiles + suggestions", () => {
  it("previews gentle companion without activating", () => {
    const preview = previewProfileRhythms("gentle_companion");
    expect(preview.length).toBeGreaterThan(0);
  });

  it("activates only selected profile templates", () => {
    const created = activateRhythmProfile("gentle_companion", [
      "Morning welcome",
    ]);
    expect(created).toHaveLength(1);
    expect(created[0]!.title).toBe("Morning welcome");
    expect(created[0]!.source).toBe("profile");
  });

  it("accepts a suggestion into an active rhythm", () => {
    const suggestion = saveRhythmSuggestion({
      title: "Invoice review",
      reason: "You check invoices often on Fridays.",
      proposedCategory: "business",
      proposedCadence: "weekly",
      patternKey: "invoices-friday",
    });
    expect(suggestion).toBeTruthy();
    const rhythm = acceptRhythmSuggestion(suggestion!.id);
    expect(rhythm?.title).toBe("Invoice review");
    expect(rhythm?.source).toBe("suggestion");
  });

  it("proposes invoice friday smart suggestion once", () => {
    const first = proposeInvoiceFridaySuggestion();
    const second = proposeInvoiceFridaySuggestion();
    expect(first).toBeTruthy();
    expect(second).toBeNull();
  });
});

describe("adaptive day condition + snooze protection", () => {
  it("sets day condition for today", () => {
    setDayCondition("low_energy");
    expect(getRhythmPrefs().dayCondition).toBe("low_energy");
  });

  it("offers snooze protection after repeated snoozes", () => {
    const r = createMemberRhythm({ title: "Write", cadence: "daily" });
    noteSnoozePattern(r.id);
    noteSnoozePattern(r.id);
    expect(shouldOfferSnoozeProtection(r.id)).toBe(false);
    noteSnoozePattern(r.id);
    expect(shouldOfferSnoozeProtection(r.id)).toBe(true);
  });

  it("dismissal prevents immediate re-prompt without changing schedule", () => {
    const r = createMemberRhythm({ title: "Review", cadence: "daily" });
    noteSnoozePattern(r.id);
    noteSnoozePattern(r.id);
    noteSnoozePattern(r.id);
    dismissSnoozeProtection(r.id, "leave_as_is");
    expect(shouldOfferSnoozeProtection(r.id)).toBe(false);
    expect(getMemberRhythm(r.id)?.schedule.exactTime).toBeUndefined();
  });
});
