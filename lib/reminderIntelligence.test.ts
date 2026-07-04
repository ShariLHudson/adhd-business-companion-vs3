import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TimeBlock } from "./companionStore";
import {
  buildConfirmationReply,
  isReminderRequest,
  parseOffsets,
  parseReminderDraft,
  resolveReminderTurn,
} from "./reminderIntelligence";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import { getReminders, clearReminderIntakeSession } from "./reminderStore";

const NOW = new Date("2026-06-24T10:00:00.000Z");

function block(title: string, date: string, startTime: string): TimeBlock {
  return {
    id: `tb-${title}`,
    title,
    date,
    startTime,
    durationMin: 30,
    status: "pending",
    createdAt: NOW.toISOString(),
  };
}

describe("reminderIntelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearReminderIntakeSession();
  });

  it("detects natural-language reminder requests", () => {
    expect(isReminderRequest("Remind me to drink water at 2 PM")).toBe(true);
    expect(isReminderRequest("Notify me 15 minutes before my sales call")).toBe(
      true,
    );
    expect(isReminderRequest("Don't let me forget to stretch")).toBe(true);
    expect(isReminderRequest("Remind me how to write an email")).toBe(false);
  });

  it("does not treat list-making as a reminder when member says don't forget", () => {
    expect(
      isReminderRequest(
        "i have a lot in my head and need to make a list of things i need to do so i don't forget",
      ),
    ).toBe(false);
    const outcome = resolveReminderTurn({
      userText:
        "i have a lot in my head and need to make a list of things i need to do so i don't forget",
      now: NOW,
    });
    expect(outcome.kind).toBe("not_reminder");
  });

  it("exits reminder intake when member wants to write the list now", () => {
    const first = resolveReminderTurn({
      userText: "Remind me to call the dentist",
      now: NOW,
    });
    expect(first.kind).toBe("ask");
    if (first.kind !== "ask") return;

    const second = resolveReminderTurn({
      userText: "i need to write the list right now",
      draft: first.draft,
      now: NOW,
    });
    expect(second.kind).toBe("not_reminder");
  });

  it("creates a one-time reminder with confirmation", () => {
    const outcome = resolveReminderTurn({
      userText: "Remind me to drink water at 2 PM",
      now: NOW,
    });
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.reply).toMatch(/Got it/i);
    expect(outcome.reply).toMatch(/drink water/i);
    expect(outcome.reply).toMatch(/2/i);
    expect(outcome.reminders[0]?.reminderType).toBe("one_time");
    expect(getReminders()).toHaveLength(1);
  });

  it("creates a recurring hourly reminder", () => {
    const outcome = resolveReminderTurn({
      userText: "Remind me every hour to stretch",
      now: NOW,
    });
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.reply).toMatch(/every hour/i);
    expect(outcome.reply).toMatch(/stretch/i);
    expect(outcome.reminders[0]?.reminderType).toBe("recurring");
    expect(outcome.reminders[0]?.recurrenceRule).toBe("hourly");
  });

  it("asks when time is missing", () => {
    const outcome = resolveReminderTurn({
      userText: "Remind me to drink water",
      now: NOW,
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/when would you like me to remind you/i);
  });

  it("asks am/pm for ambiguous clock times", () => {
    const draft = parseReminderDraft("Remind me at 2", NOW);
    expect(draft?.missing).toBe("am_pm");
    const outcome = resolveReminderTurn({
      userText: "Remind me at 2",
      now: NOW,
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/2 AM or 2 PM/i);
  });

  it("asks which event when calendar match is missing", () => {
    const outcome = resolveReminderTurn({
      userText: "Notify me 15 minutes before my sales call",
      timeBlocks: [],
      now: NOW,
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/sales call/i);
  });

  it("confirms event offset when a calendar block matches", () => {
    const outcome = resolveReminderTurn({
      userText: "Notify me 15 minutes before my sales call",
      timeBlocks: [block("Sales call with Acme", "2026-06-24", "14:00")],
      now: NOW,
    });
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.reply).toMatch(/15 minutes before/i);
    expect(outcome.reply).toMatch(/sales call/i);
    expect(outcome.reminders[0]?.reminderType).toBe("event_offset");
    expect(outcome.reminders[0]?.offsets).toEqual([15]);
  });

  it("preserves 15-minute advance offset for event reminders", () => {
    expect(parseOffsets("Notify me 15 minutes before my sales call")).toEqual([15]);
    const draft = parseReminderDraft(
      "Notify me 15 minutes before my sales call",
      NOW,
    );
    expect(draft?.reminderType).toBe("event_offset");
    expect(draft?.offsets).toEqual([15]);
  });

  it("parses multiple offsets for the same event", () => {
    const offsets = parseOffsets(
      "Remind me about my webinar 1 day before, 1 hour before, and 15 minutes before",
    );
    expect(offsets).toEqual(expect.arrayContaining([1440, 60, 15]));
    const outcome = resolveReminderTurn({
      userText:
        "Remind me about my webinar 1 day before, 1 hour before, and 15 minutes before",
      timeBlocks: [block("Webinar launch", "2026-06-25", "10:00")],
      now: NOW,
    });
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.reminders.length).toBeGreaterThanOrEqual(1);
    expect(outcome.reply).toMatch(/notify you/i);
  });

  it("builds short confirmation copy", () => {
    const localTwoPm = new Date(
      NOW.getFullYear(),
      NOW.getMonth(),
      NOW.getDate(),
      14,
      0,
      0,
      0,
    );
    const reply = buildConfirmationReply(
      [
        {
          id: "r1",
          title: "Drink water",
          message: "drink water",
          reminderType: "one_time",
          scheduledAt: localTwoPm.toISOString(),
          source: "chat",
          createdAt: NOW.toISOString(),
          status: "active",
        },
      ],
      NOW,
    );
    expect(reply).toMatch(/Got it — I'll remind you to drink water today at/i);
    expect(reply).toMatch(/2:00 PM/i);
  });

  it("routes reminders without relationship intelligence", () => {
    const decision = resolveFrictionlessAction({
      userText: "Remind me to drink water at 2 PM",
      currentTurn: 3,
      timeBlocks: [],
    });
    expect(decision.category).toBe("reminder");
    expect(decision.suppressRelationship).toBe(true);
    expect(decision.localReply).toMatch(/Got it/i);
    expect(
      buildRelationshipLeadParagraph("Remind me to drink water at 2 PM", NOW, {
        suppressForRouting: true,
      }),
    ).toBeNull();
  });

  it("does not route reminders to Create or Visual Thinking", () => {
    const decision = resolveFrictionlessAction({
      userText: "Remind me to follow up with Sarah tomorrow morning",
      currentTurn: 2,
      timeBlocks: [],
    });
    expect(decision.category).toBe("reminder");
    expect(decision.workspaceOffer).toBeNull();
    expect(decision.localReply).not.toMatch(/Visual Thinking|Create/i);
  });
});
