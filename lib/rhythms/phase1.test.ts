/**
 * Adaptive Rhythms Phase 1 — required engine matrix.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  completeRhythmOccurrence,
  createMemberRhythm,
  dedupeLinkedDeliverables,
  deliverableOccurrenceKey,
  filterDeliverables,
  getMemberRhythm,
  isInQuietHours,
  isWithinFlexibleWindow,
  linkRhythmAndReminder,
  listMemberRhythms,
  migrateLegacyMyRhythmsOnce,
  pauseRhythm,
  resolveNextDueAt,
  resumeRhythm,
  saveRhythmPrefs,
  skipRhythmOccurrence,
  snoozeRhythm,
  WINDOW_DEFAULT_TIMES,
  WINDOW_END_TIMES,
  windowEndForRhythm,
} from "./index";
import {
  getReminders,
  saveReminder,
  type Reminder,
} from "@/lib/reminderStore";

beforeEach(() => {
  localStorage.clear();
  saveRhythmPrefs({
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    notificationLevel: "active",
    dailyFrequencyCap: "none",
    promptedCountToday: 0,
    promptedCountDate: "2026-07-12",
    dayCondition: null,
  });
});

describe("existing reminder compatibility", () => {
  it("preserves reminder fields including linkedRhythmId and priority", () => {
    const rem = saveReminder({
      title: "Call Mary",
      message: "Call Mary tomorrow",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T15:00:00").toISOString(),
      source: "chat",
      priority: "critical",
      linkedRhythmId: "rhythm-placeholder",
    });
    expect(rem.priority).toBe("critical");
    expect(rem.linkedRhythmId).toBe("rhythm-placeholder");
    expect(getReminders().some((r) => r.id === rem.id)).toBe(true);
  });

  it("includes due reminders in load manager output", () => {
    const rem = saveReminder({
      title: "Submit invoice",
      message: "Submit invoice",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T09:00:00").toISOString(),
      source: "chat",
      priority: "important",
    });
    const due = filterDeliverables(
      [],
      [rem],
      new Date("2026-07-12T10:00:00"),
    );
    expect(due).toHaveLength(1);
    expect(due[0]!.kind).toBe("reminder");
    expect(due[0]!.id).toBe(rem.id);
  });
});

describe("migration safety and repeat execution", () => {
  it("migrates companion-my-rhythms-v1 once without duplicating on repeat", () => {
    localStorage.setItem(
      "companion-my-rhythms-v1",
      JSON.stringify([
        {
          id: "legacy-1",
          title: "Friday finance",
          cadence: "weekly",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "legacy-2",
          title: "Water",
          cadence: "daily",
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ]),
    );

    const first = migrateLegacyMyRhythmsOnce();
    expect(first.migrated).toBe(true);
    expect(first.count).toBe(2);
    expect(listMemberRhythms()).toHaveLength(2);

    const second = migrateLegacyMyRhythmsOnce();
    expect(second.migrated).toBe(false);
    expect(second.count).toBe(2);
    expect(listMemberRhythms()).toHaveLength(2);
    expect(listMemberRhythms().map((r) => r.id).sort()).toEqual([
      "legacy-1",
      "legacy-2",
    ]);
  });

  it("dedupes by id when legacy list contains duplicates", () => {
    localStorage.setItem(
      "companion-my-rhythms-v1",
      JSON.stringify([
        {
          id: "dup",
          title: "A",
          cadence: "daily",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "dup",
          title: "A again",
          cadence: "daily",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );
    const result = migrateLegacyMyRhythmsOnce();
    expect(result.count).toBe(1);
  });
});

describe("flexible windows", () => {
  it("opens morning at 9 and closes at noon", () => {
    expect(WINDOW_DEFAULT_TIMES.morning.hour).toBe(9);
    expect(WINDOW_END_TIMES.morning.hour).toBe(12);
    const r = createMemberRhythm({
      title: "Morning",
      cadence: "daily",
      window: "morning",
    });
    const open = new Date("2026-07-12T09:00:00");
    const mid = new Date("2026-07-12T10:30:00");
    const closed = new Date("2026-07-12T13:00:00");
    const withDue = {
      ...r,
      nextDueAt: open.toISOString(),
    };
    expect(isWithinFlexibleWindow(withDue, mid)).toBe(true);
    expect(isWithinFlexibleWindow(withDue, closed)).toBe(false);
    expect(windowEndForRhythm(withDue, open)?.getHours()).toBe(12);
  });

  it("honors custom window start and end", () => {
    const r = createMemberRhythm({
      title: "Custom",
      cadence: "daily",
      window: "custom",
      schedule: {
        cadence: "daily",
        customWindowStart: "10:00",
        customWindowEnd: "11:30",
      },
    });
    const open = new Date("2026-07-13T10:00:00");
    const withDue = { ...r, nextDueAt: open.toISOString() };
    expect(isWithinFlexibleWindow(withDue, new Date("2026-07-13T11:00:00"))).toBe(
      true,
    );
    expect(isWithinFlexibleWindow(withDue, new Date("2026-07-13T12:00:00"))).toBe(
      false,
    );
  });
});

describe("quiet hours", () => {
  it("detects wrapping midnight quiet hours", () => {
    expect(isInQuietHours(new Date("2026-07-12T22:00:00"))).toBe(true);
    expect(isInQuietHours(new Date("2026-07-12T10:00:00"))).toBe(false);
  });

  it("defers nextDueAt past quiet hours by default", () => {
    const r = createMemberRhythm({
      title: "Late",
      cadence: "daily",
      window: "exact",
      schedule: { cadence: "daily", exactTime: "22:30" },
      quietHoursBehavior: "defer",
    });
    const due = resolveNextDueAt(r, new Date("2026-07-12T12:00:00"));
    expect(due).toBeTruthy();
    const hour = new Date(due!).getHours();
    expect(hour).toBe(8);
  });

  it("allow_critical keeps critical due inside quiet hours", () => {
    const r = createMemberRhythm({
      title: "Meds",
      cadence: "daily",
      priority: "critical",
      quietHoursBehavior: "allow_critical",
      window: "exact",
      schedule: { cadence: "daily", exactTime: "22:00" },
    });
    const due = resolveNextDueAt(r, new Date("2026-07-12T12:00:00"));
    expect(new Date(due!).getHours()).toBe(22);
  });
});

describe("pause and resume", () => {
  it("clears nextDueAt on pause and restores on resume", () => {
    const r = createMemberRhythm({ title: "Water", cadence: "daily" });
    const paused = pauseRhythm(r.id);
    expect(paused?.status).toBe("paused");
    expect(paused?.nextDueAt).toBeUndefined();
    const resumed = resumeRhythm(r.id);
    expect(resumed?.status).toBe("active");
    expect(resumed?.nextDueAt).toBeTruthy();
  });
});

describe("skip versus complete", () => {
  it("skip records occurrence date; complete records lastPromptedAt", () => {
    const r = createMemberRhythm({ title: "Check-in", cadence: "daily" });
    const day = new Date("2026-07-12T10:00:00");
    const skipped = skipRhythmOccurrence(r.id, day);
    expect(skipped?.skippedOccurrenceDates).toContain("2026-07-12");
    expect(skipped?.lastPromptedAt).toBeFalsy();

    const r2 = createMemberRhythm({ title: "Evening", cadence: "daily" });
    const done = completeRhythmOccurrence(r2.id, day);
    expect(done?.lastPromptedAt).toBeTruthy();
    expect(done?.skippedOccurrenceDates ?? []).not.toContain("2026-07-12");
  });
});

describe("snooze behavior", () => {
  it("moves nextDueAt forward by minutes", () => {
    const r = createMemberRhythm({ title: "Focus", cadence: "daily" });
    const from = new Date("2026-07-12T10:00:00");
    const snoozed = snoozeRhythm(r.id, 45, from);
    expect(new Date(snoozed!.nextDueAt!).getTime()).toBe(
      from.getTime() + 45 * 60_000,
    );
  });

  it("occurrence key changes after snooze so session dedupe can re-fire", () => {
    const before = {
      kind: "rhythm" as const,
      id: "r1",
      title: "t",
      body: "b",
      priority: "supportive" as const,
      dueAt: "2026-07-12T10:00:00.000Z",
    };
    const after = {
      ...before,
      dueAt: "2026-07-12T10:45:00.000Z",
    };
    expect(deliverableOccurrenceKey(before)).not.toBe(
      deliverableOccurrenceKey(after),
    );
  });
});

describe("duplicate delivery prevention", () => {
  it("suppresses rhythm when linked reminder is also due", () => {
    const rhythm = createMemberRhythm({
      title: "Finance Friday",
      cadence: "weekly",
      priority: "important",
    });
    const rem = saveReminder({
      title: "Finance Friday",
      message: "Review finances",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T09:00:00").toISOString(),
      source: "rhythm",
      priority: "important",
    });
    linkRhythmAndReminder(rhythm.id, rem.id);
    const linkedRhythm = getMemberRhythm(rhythm.id)!;
    const linkedRem = getReminders().find((r) => r.id === rem.id)!;

    const due = filterDeliverables(
      [
        {
          ...linkedRhythm,
          nextDueAt: new Date("2026-07-12T09:00:00").toISOString(),
        },
      ],
      [linkedRem],
      new Date("2026-07-12T10:00:00"),
    );
    expect(due).toHaveLength(1);
    expect(due[0]!.kind).toBe("reminder");
  });

  it("dedupeLinkedDeliverables drops rhythm when reminder carries rhythmId", () => {
    const items = dedupeLinkedDeliverables([
      {
        kind: "rhythm",
        id: "r1",
        title: "A",
        body: "",
        priority: "important",
      },
      {
        kind: "reminder",
        id: "rem1",
        title: "A",
        body: "",
        priority: "important",
        rhythmId: "r1",
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]!.kind).toBe("reminder");
  });
});

describe("timezone and daylight-saving behavior", () => {
  it("advances daily across a spring-forward local morning", () => {
    // US DST spring forward 2026-03-08 — local Date math should still land next calendar day.
    const r = createMemberRhythm({
      title: "DST daily",
      cadence: "daily",
      window: "morning",
    });
    const from = new Date(2026, 2, 8, 10, 0, 0); // Mar 8 2026 local
    const due = resolveNextDueAt(
      { ...r, nextDueAt: undefined },
      from,
    );
    expect(due).toBeTruthy();
    const next = new Date(due!);
    expect(next.getHours()).toBe(9);
    // Next morning window after 10:00 on the 8th → 9:00 on the 9th
    expect(next.getDate()).toBe(9);
  });

  it("advances daily across a fall-back local evening", () => {
    const r = createMemberRhythm({
      title: "DST evening",
      cadence: "daily",
      window: "evening",
    });
    const from = new Date(2026, 10, 1, 20, 0, 0); // Nov 1 2026 local (DST ends Nov 1 in US)
    const due = resolveNextDueAt(r, from);
    expect(due).toBeTruthy();
    const next = new Date(due!);
    expect(next.getHours()).toBe(WINDOW_DEFAULT_TIMES.evening.hour);
    expect(next.getDate()).toBeGreaterThanOrEqual(1);
  });
});

describe("several items becoming due together", () => {
  it("caps non-critical deliverables and keeps critical", () => {
    saveRhythmPrefs({
      dailyFrequencyCap: 3,
      notificationLevel: "active",
      quietHoursStart: "23:59",
      quietHoursEnd: "00:00",
      promptedCountToday: 0,
      promptedCountDate: "2026-07-12",
    });
    const dueAt = new Date("2026-07-12T09:00:00").toISOString();
    const rhythms = [
      createMemberRhythm({ title: "C1", cadence: "daily", priority: "critical" }),
      createMemberRhythm({ title: "I1", cadence: "daily", priority: "important" }),
      createMemberRhythm({ title: "I2", cadence: "daily", priority: "important" }),
      createMemberRhythm({ title: "S1", cadence: "daily", priority: "supportive" }),
      createMemberRhythm({ title: "S2", cadence: "daily", priority: "supportive" }),
      createMemberRhythm({ title: "S3", cadence: "daily", priority: "supportive" }),
    ].map((r) => ({ ...r, nextDueAt: dueAt }));

    const due = filterDeliverables(
      rhythms,
      [] as Reminder[],
      new Date("2026-07-12T10:00:00"),
    );
    expect(due.some((d) => d.priority === "critical")).toBe(true);
    expect(due.filter((d) => d.priority !== "critical")).toHaveLength(3);
    expect(due.length).toBeLessThanOrEqual(4);
  });
});
