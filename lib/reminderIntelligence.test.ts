import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TimeBlock } from "./companionStore";
import {
  buildConfirmationReply,
  isReminderIntakeMessage,
  isReminderRequest,
  parseOffsets,
  parseReminderDraft,
  parseReminderFrequency,
  resolveReminderTurn,
  getReminderIntakeStep,
  isReminderIntakeAwaitingAnswer,
  validateReminderTimes,
} from "./reminderIntelligence";
import {
  clearFrictionlessPending,
  loadFrictionlessPending,
  resolveFrictionlessAction,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import { getActiveReminders, getReminders, clearReminderIntakeSession } from "./reminderStore";

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
    expect(isReminderRequest("Set up a reminder for me to drink water")).toBe(
      true,
    );
    expect(isReminderRequest("Create a reminder to stretch")).toBe(true);
    expect(isReminderRequest("Notify me 15 minutes before my sales call")).toBe(
      true,
    );
    expect(isReminderRequest("Don't let me forget to stretch")).toBe(true);
    expect(isReminderRequest("Remind me how to write an email")).toBe(false);
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
    expect(outcome.reply).toMatch(/when would you like the reminder/i);
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

  it("detects I need a reminder phrasing", () => {
    expect(isReminderRequest("I need a reminder to drink water.")).toBe(true);
    expect(isReminderRequest("Create a reminder for 10am")).toBe(true);
    expect(isReminderRequest("Notify me every day at 2pm")).toBe(true);
  });

  it("P0.33 multi-time daily flow", () => {
    const ask = resolveReminderTurn({
      userText: "Remind me to drink water",
      now: NOW,
    });
    expect(ask.kind).toBe("ask");
    if (ask.kind !== "ask") return;

    const times = resolveReminderTurn({
      userText: "10am, 1pm, and 5pm",
      draft: ask.draft,
      now: NOW,
    });
    expect(times.kind).toBe("ask");
    if (times.kind !== "ask") return;
    expect(times.reply).toMatch(/Every day/i);
    expect(times.draft.dailyTimes).toEqual(["10:00", "13:00", "17:00"]);

    const confirm = resolveReminderTurn({
      userText: "yes",
      draft: times.draft,
      now: NOW,
    });
    expect(confirm.kind).toBe("confirm");
    if (confirm.kind !== "confirm") return;
    expect(confirm.reply).toMatch(/Reminder created/i);
    expect(confirm.reminders[0]?.dailyTimes).toHaveLength(3);
    expect(confirm.reminders[0]?.recurrenceRule).toMatch(/^daily-multi@/);
    expect(getActiveReminders().filter((r) => r.status === "active")).toHaveLength(
      1,
    );
  });

  it("parse Create a reminder asks for name first", () => {
    const draft = parseReminderDraft("Create a reminder", NOW);
    expect(draft?.missing).toBe("name");
    expect(draft?.title).toBe("Reminder");
  });

  it("P0.57 golden path: createReminder → ask_name → ask_times → ask_frequency → save", () => {
    const start = resolveReminderTurn({
      userText: "Create a reminder",
      now: NOW,
    });
    expect(start.kind).toBe("ask");
    if (start.kind !== "ask") return;
    expect(getReminderIntakeStep(start.draft, start)).toBe("ask_name");
    expect(isReminderIntakeAwaitingAnswer(start.draft, start)).toBe(true);
    expect(start.reply).toMatch(/what should I remind you about/i);

    const named = resolveReminderTurn({
      userText: "Drink Water",
      draft: start.draft,
      now: NOW,
    });
    expect(named.kind).toBe("ask");
    if (named.kind !== "ask") return;
    expect(getReminderIntakeStep(named.draft, named)).toBe("ask_times");
    expect(named.draft.message).toBe("Drink Water");

    const timed = resolveReminderTurn({
      userText: "10am, 1pm, and 5pm",
      draft: named.draft,
      now: NOW,
    });
    expect(timed.kind).toBe("ask");
    if (timed.kind !== "ask") return;
    expect(getReminderIntakeStep(timed.draft, timed)).toBe("ask_frequency");

    const saved = resolveReminderTurn({
      userText: "weekdays",
      draft: timed.draft,
      now: NOW,
    });
    expect(saved.kind).toBe("confirm");
    if (saved.kind !== "confirm") return;
    expect(getReminderIntakeStep(timed.draft, saved)).toBe("complete");
    expect(isReminderIntakeAwaitingAnswer(null, saved)).toBe(false);
    expect(saved.reminders[0]?.recurrenceRule).toBe(
      "weekdays-multi@10:00,13:00,17:00",
    );
  });

  it("P0.57 multi-time weekdays flow: name → times → weekdays → save", () => {
    // step=createReminder → ask_times (name captured from first message)
    const askTimes = resolveReminderTurn({
      userText: "Remind me to drink water",
      now: NOW,
    });
    expect(askTimes.kind).toBe("ask");
    if (askTimes.kind !== "ask") return;
    expect(askTimes.draft.message).toMatch(/drink water/i);
    expect(askTimes.draft.missing).toBe("time");

    // times captured → ask_frequency
    const askFrequency = resolveReminderTurn({
      userText: "10am, 1pm, and 5pm",
      draft: askTimes.draft,
      now: NOW,
    });
    expect(askFrequency.kind).toBe("ask");
    if (askFrequency.kind !== "ask") return;
    expect(askFrequency.draft.missing).toBe("frequency");
    expect(askFrequency.draft.dailyTimes).toEqual(["10:00", "13:00", "17:00"]);
    expect(askFrequency.reply).toMatch(/weekdays/i);

    // user: weekdays → saveReminder → SUCCESS
    const saved = resolveReminderTurn({
      userText: "weekdays",
      draft: askFrequency.draft,
      now: NOW,
    });
    expect(saved.kind).toBe("confirm");
    if (saved.kind !== "confirm") return;
    expect(saved.reply).toMatch(/Reminder created/i);
    expect(saved.reminders[0]?.recurrenceRule).toBe(
      "weekdays-multi@10:00,13:00,17:00",
    );
    expect(saved.reminders[0]?.dailyTimes).toEqual(["10:00", "13:00", "17:00"]);
    expect(getActiveReminders().filter((r) => r.status === "active")).toHaveLength(
      1,
    );
  });

  it("starts intake immediately for set up a reminder phrasing", () => {
    const outcome = resolveReminderTurn({
      userText: "Set up a reminder for me to drink water",
      now: NOW,
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/when would you like the reminder/i);
    expect(outcome.reply).not.toMatch(/would you like me to help you set a reminder/i);
    expect(outcome.draft.message).toMatch(/drink water/i);
  });

  it("keeps yes inside reminder intake when time is still missing", () => {
    const draft = parseReminderDraft("Remind me to drink water", NOW);
    expect(draft?.missing).toBe("time");
    const outcome = resolveReminderTurn({
      userText: "yes",
      draft,
      now: NOW,
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/when would you like the reminder/i);
    expect(isReminderIntakeMessage(outcome.reply)).toBe(true);
  });

  it("clears stale strategy pending when a new reminder request starts", () => {
    saveFrictionlessPending({
      type: "strategy_offer",
      target: "playbook",
      context: "ugly-first-draft",
      strategyId: "ugly-first-draft",
      strategyTitle: "Start Ugly",
      initialPrompt: "I keep putting off my sales calls.",
      offeredAtTurn: 1,
      offerSummary: "Use Start Ugly",
    });
    expect(loadFrictionlessPending()).not.toBeNull();

    const decision = resolveFrictionlessAction({
      userText: "Remind me to drink water.",
      currentTurn: 4,
      timeBlocks: [],
    });
    expect(decision.category).toBe("reminder");
    expect(loadFrictionlessPending()).toBeNull();
    clearFrictionlessPending();
  });

  it("P0.48 chat frequency parser still supports weekday phrases", () => {
    for (const phrase of [
      "m-f",
      "mon-fri",
      "monday through friday",
      "weekdays",
      "every weekday",
    ]) {
      expect(parseReminderFrequency(phrase)).toBe("weekdays");
    }
  });

  it("P0.48 reports missing AM/PM instead of silent save failure", () => {
    const result = validateReminderTimes("10:00, 1:00, 5:00");
    expect(result.times).toBeNull();
    expect(result.issues.some((i) => /AM or PM/i.test(i))).toBe(true);
  });
});
