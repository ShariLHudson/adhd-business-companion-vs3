/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeReminder,
  deleteReminder,
  getReminders,
  saveReminder,
  snoozeReminder,
  updateReminder,
} from "@/lib/reminderStore";
import {
  EMPTY_REMINDER_FORM,
  partitionReminders,
  reminderPayloadFromForm,
} from "./reminderForm";

describe("Reminders room store actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a text-only reminder and lists it under Upcoming", () => {
    saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Pick up dry cleaning",
      }),
    );
    const { upcoming, recurring } = partitionReminders(getReminders());
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]!.title).toBe("Pick up dry cleaning");
    expect(recurring).toHaveLength(0);
  });

  it("creates a dated reminder in Upcoming", () => {
    saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Dentist",
        date: "2026-09-01",
        time: "15:00",
      }),
    );
    const { upcoming } = partitionReminders(getReminders());
    expect(upcoming[0]!.scheduledAt).toBeTruthy();
  });

  it("creates a repeating reminder in Recurring", () => {
    saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Water plants",
        repeat: "daily",
        time: "08:00",
      }),
    );
    const { recurring, upcoming } = partitionReminders(getReminders());
    expect(recurring).toHaveLength(1);
    expect(recurring[0]!.recurrenceRule).toBe("daily@08:00");
    expect(upcoming).toHaveLength(0);
  });

  it("creates monthly and yearly reminders under Recurring", () => {
    saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Rent",
        repeat: "monthly",
        date: "2026-07-01",
        time: "09:00",
      }),
    );
    saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Anniversary note",
        repeat: "yearly",
        date: "2026-03-15",
        time: "10:00",
      }),
    );
    const { recurring } = partitionReminders(getReminders());
    const rent = recurring.find((r) => r.title === "Rent");
    const anniversary = recurring.find((r) => r.title === "Anniversary note");
    expect(rent?.recurrenceRule).toBe("monthly@01@09:00");
    expect(anniversary?.recurrenceRule).toBe("yearly@03-15@10:00");
    expect(rent?.reminderType).toBe("recurring");
    expect(anniversary?.reminderType).toBe("recurring");
  });

  it("completes, edits, deletes, snoozes, and moves date", () => {
    const created = saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Follow up",
        date: "2026-08-10",
        time: "11:00",
      }),
    );

    updateReminder(created.id, { title: "Follow up — edited" });
    expect(getReminders().find((r) => r.id === created.id)?.title).toBe(
      "Follow up — edited",
    );

    const until = new Date("2026-08-10T12:00:00.000Z").toISOString();
    snoozeReminder(created.id, until);
    expect(getReminders().find((r) => r.id === created.id)?.snoozedUntil).toBe(
      until,
    );

    updateReminder(created.id, {
      scheduledAt: new Date("2026-08-20T11:00:00.000Z").toISOString(),
      snoozedUntil: undefined,
    });
    expect(
      getReminders().find((r) => r.id === created.id)?.scheduledAt,
    ).toContain("2026-08-20");

    completeReminder(created.id);
    const parts = partitionReminders(getReminders());
    expect(parts.completed.map((r) => r.id)).toContain(created.id);
    expect(parts.upcoming.map((r) => r.id)).not.toContain(created.id);

    deleteReminder(created.id);
    expect(getReminders().find((r) => r.id === created.id)).toBeUndefined();
  });

  it("throws when an edit cannot persist and keeps the prior reminder", () => {
    const created = saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Keep original",
      }),
    );
    const proto = Object.getPrototypeOf(localStorage);
    const originalSet = proto.setItem as (key: string, value: string) => void;
    const setItem = vi
      .spyOn(proto, "setItem")
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (String(value).includes("Should not stick")) {
          throw new Error("quota");
        }
        return originalSet.call(this, key, value);
      });
    expect(() =>
      updateReminder(created.id, { title: "Should not stick" }),
    ).toThrow("REMINDER_PERSIST_FAILED");
    setItem.mockRestore();
    expect(getReminders().find((r) => r.id === created.id)?.title).toBe(
      "Keep original",
    );
  });
});
