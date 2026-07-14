import { describe, expect, it } from "vitest";
import {
  EMPTY_REMINDER_FORM,
  buildRecurrenceRule,
  buildScheduledAt,
  formValuesFromReminder,
  partitionReminders,
  reminderPayloadFromForm,
  repeatOptionFromReminder,
} from "./reminderForm";
import type { Reminder } from "@/lib/reminderStore";

function rem(partial: Partial<Reminder> & Pick<Reminder, "id">): Reminder {
  return {
    id: partial.id,
    title: partial.title ?? "Title",
    message: partial.message ?? "Title",
    reminderType: partial.reminderType ?? "one_time",
    source: partial.source ?? "chat",
    createdAt: partial.createdAt ?? "2026-07-13T12:00:00.000Z",
    status: partial.status ?? "active",
    scheduledAt: partial.scheduledAt,
    recurrenceRule: partial.recurrenceRule,
  };
}

describe("reminderForm", () => {
  it("builds a text-only one-time reminder without date or time", () => {
    const payload = reminderPayloadFromForm({
      ...EMPTY_REMINDER_FORM,
      title: "Call Sam",
    });
    expect(payload.title).toBe("Call Sam");
    expect(payload.message).toBe("Call Sam");
    expect(payload.reminderType).toBe("one_time");
    expect(payload.scheduledAt).toBeUndefined();
    expect(payload.recurrenceRule).toBeUndefined();
  });

  it("treats date and time as optional and combines when both present", () => {
    expect(buildScheduledAt("", "09:00")).toBeUndefined();
    const scheduled = buildScheduledAt("2026-08-01", "14:30");
    expect(scheduled).toBeTruthy();
    expect(new Date(scheduled!).getHours()).toBe(14);
  });

  it("maps daily and weekly repeats to store-compatible rules", () => {
    expect(buildRecurrenceRule("daily", "", "09:00", "")).toBe("daily@09:00");
    expect(buildRecurrenceRule("weekly", "2026-07-13", "10:00", "")).toMatch(
      /^weekly@\w+@10:00$/,
    );
  });

  it("partitions upcoming, recurring, and completed", () => {
    const parts = partitionReminders([
      rem({ id: "1", reminderType: "one_time", status: "active" }),
      rem({
        id: "2",
        reminderType: "recurring",
        recurrenceRule: "daily@09:00",
        status: "active",
      }),
      rem({ id: "3", status: "completed" }),
    ]);
    expect(parts.upcoming.map((r) => r.id)).toEqual(["1"]);
    expect(parts.recurring.map((r) => r.id)).toEqual(["2"]);
    expect(parts.completed.map((r) => r.id)).toEqual(["3"]);
  });

  it("round-trips form values from a reminder", () => {
    const reminder = rem({
      id: "r1",
      title: "Invoice",
      message: "Send invoice",
      reminderType: "recurring",
      recurrenceRule: "daily@08:00",
      scheduledAt: "2026-07-14T08:00:00.000Z",
    });
    expect(repeatOptionFromReminder(reminder)).toBe("daily");
    const form = formValuesFromReminder(reminder);
    expect(form.title).toBe("Invoice");
    expect(form.notes).toBe("Send invoice");
    expect(form.repeat).toBe("daily");
  });
});
