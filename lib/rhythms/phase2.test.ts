/**
 * Adaptive Rhythms Phase 2 — conversation + content creation.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  classifyRememberIntent,
  createReminderFromContent,
  createRhythmFromContent,
  defaultReminderScheduledAt,
  extractRhythmTitle,
  findSimilarActiveReminder,
  isUnsupportedLocationTrigger,
  listMemberRhythms,
  needsRememberClarification,
  parseCadenceFromText,
  sourceRefFromParkingLot,
  sourceRefFromThought,
  tryResolveRememberManagementCommand,
} from "./index";
import { getActiveReminders, saveReminder } from "@/lib/reminderStore";

beforeEach(() => {
  localStorage.clear();
});

describe("CONV-040 conversation distinction", () => {
  it("routes one-time vs recurring language", () => {
    expect(classifyRememberIntent("Remind me tomorrow to call Mary")).toBe(
      "reminder",
    );
    expect(
      classifyRememberIntent("Every Friday remind me to review finances"),
    ).toBe("rhythm");
    expect(classifyRememberIntent("Put it on my calendar")).toBe("calendar");
  });

  it("honestly declines unsupported location triggers", () => {
    expect(isUnsupportedLocationTrigger("Remind me when I get home")).toBe(
      true,
    );
    expect(classifyRememberIntent("Remind me when I get home")).toBe("unclear");
  });

  it("asks when remember language lacks timing and recurrence", () => {
    expect(needsRememberClarification("Remind me to follow up with Susan")).toBe(
      true,
    );
    expect(
      needsRememberClarification("Remind me tomorrow to follow up with Susan"),
    ).toBe(false);
    expect(
      needsRememberClarification("Every Monday remind me to follow up"),
    ).toBe(false);
  });

  it("parses cadence and title for complete rhythm instructions", () => {
    expect(parseCadenceFromText("Every Friday remind me to review finances")).toBe(
      "weekly",
    );
    expect(parseCadenceFromText("Remind me daily to drink water")).toBe("daily");
    expect(extractRhythmTitle("Every Friday remind me to review finances")).toMatch(
      /review finances/i,
    );
  });
});

describe("management commands (deterministic)", () => {
  it("lists, pauses, resumes, skips, and snoozes rhythms", () => {
    const created = createRhythmFromContent({
      title: "Finance Friday",
      cadence: "weekly",
      source: "conversation",
    });
    expect(created.ok).toBe(true);

    const list = tryResolveRememberManagementCommand("list my rhythms");
    expect(list?.reply).toMatch(/Finance Friday/);

    const paused = tryResolveRememberManagementCommand(
      "pause rhythm Finance Friday",
    );
    expect(paused?.reply).toMatch(/Paused/);
    expect(listMemberRhythms().find((r) => r.title === "Finance Friday")?.status).toBe(
      "paused",
    );

    const resumed = tryResolveRememberManagementCommand(
      "resume rhythm Finance Friday",
    );
    expect(resumed?.reply).toMatch(/Resumed/);

    createRhythmFromContent({
      title: "Water",
      cadence: "daily",
      source: "conversation",
      allowDuplicate: true,
    });
    const skip = tryResolveRememberManagementCommand("skip rhythm Water");
    expect(skip?.reply).toMatch(/Skipped/);

    const snooze = tryResolveRememberManagementCommand(
      "snooze rhythm Water for 15 minutes",
    );
    expect(snooze?.reply).toMatch(/15 minutes/);
  });

  it("lists reminders without AI", () => {
    saveReminder({
      title: "Call Mary",
      message: "Call Mary",
      reminderType: "one_time",
      scheduledAt: defaultReminderScheduledAt(),
      source: "chat",
    });
    const list = tryResolveRememberManagementCommand("show my reminders");
    expect(list?.reply).toMatch(/Call Mary/);
  });
});

describe("source links without deleting sources", () => {
  it("stores originatedFrom on reminder and rhythm", () => {
    const rem = createReminderFromContent({
      title: "Parked idea",
      scheduledAt: defaultReminderScheduledAt(),
      source: "parking_lot",
      sourceRef: sourceRefFromParkingLot("pl-1", "Parked idea"),
    });
    expect(rem.ok).toBe(true);
    if (rem.ok) {
      expect(rem.reminder.originatedFromId).toBe("pl-1");
      expect(rem.reminder.originatedFromKind).toBe("parking_lot_item");
    }

    const rhythm = createRhythmFromContent({
      title: "Thought rhythm",
      cadence: "weekly",
      source: "clear_my_mind",
      sourceRef: sourceRefFromThought("thought-9", "Thought rhythm"),
    });
    expect(rhythm.ok).toBe(true);
    if (rhythm.ok) {
      expect(rhythm.rhythm.originatedFromId).toBe("thought-9");
      expect(rhythm.rhythm.originatedFromKind).toBe("thought");
    }
  });
});

describe("duplicate protection", () => {
  it("returns existing active rhythm instead of duplicating", () => {
    const first = createRhythmFromContent({
      title: "Invoice review",
      cadence: "weekly",
      source: "conversation",
    });
    const second = createRhythmFromContent({
      title: "Invoice review",
      cadence: "weekly",
      source: "conversation",
    });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.duplicate).toBe(true);
      expect(second.rhythm.id).toBe(first.rhythm.id);
      expect(listMemberRhythms().filter((r) => r.title === "Invoice review")).toHaveLength(
        1,
      );
    }
  });

  it("returns existing active reminder instead of duplicating", () => {
    const first = createReminderFromContent({
      title: "Call the accountant",
      scheduledAt: defaultReminderScheduledAt(),
      source: "clear_my_mind",
    });
    const second = createReminderFromContent({
      title: "Call the accountant",
      scheduledAt: defaultReminderScheduledAt(),
      source: "clear_my_mind",
    });
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.duplicate).toBe(true);
      expect(findSimilarActiveReminder("Call the accountant")?.id).toBe(
        first.reminder.id,
      );
      expect(
        getActiveReminders().filter((r) => r.title === "Call the accountant"),
      ).toHaveLength(1);
    }
  });

  it("asks for cadence when rhythm recurrence is missing", () => {
    const result = createRhythmFromContent({
      title: "Review finances",
      source: "conversation",
      inferCadenceFromText: "Help me remember to review finances regularly",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("missing_cadence");
      expect(result.ask).toMatch(/daily|weekly/i);
    }
  });
});
