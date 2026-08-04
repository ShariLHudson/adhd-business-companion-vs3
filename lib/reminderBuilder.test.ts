import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  builderFormFromReminder,
  buildReminderFromBuilderForm,
  emptyReminderBuilderForm,
  formatReminderCollapsedSubtitle,
  formatReminderNotificationLabel,
  getReminderExpandedTimes,
  REMINDER_SAVED_TOAST,
  validateReminderBuilderForm,
} from "./reminderBuilder";
import {
  deleteReminder,
  getReminders,
  saveReminder,
} from "./reminderStore";

describe("reminderBuilder P0.49", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("once reminder with date saves", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Doctor Appointment",
      frequency: "once" as const,
      onceDate: "2026-07-15",
      times: ["14:00"],
    };
    expect(validateReminderBuilderForm(form).valid).toBe(true);
    const payload = buildReminderFromBuilderForm(form);
    expect(payload?.reminderType).toBe("one_time");
    saveReminder(payload!);
    expect(getReminders()[0]?.title).toBe("Doctor Appointment");
  });

  it("daily reminder with multiple times saves", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Stretch",
      frequency: "daily" as const,
      times: ["10:00", "15:00"],
    };
    const payload = buildReminderFromBuilderForm(form);
    expect(payload?.recurrenceRule).toBe("daily-multi@10:00,15:00");
    saveReminder(payload!);
    expect(getReminders()).toHaveLength(1);
  });

  it("weekdays reminder saves Drink Water scenario", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Drink Water",
      frequency: "weekdays" as const,
      times: ["10:00", "13:00", "17:00"],
    };
    const payload = buildReminderFromBuilderForm(form);
    expect(payload?.recurrenceRule).toBe("weekdays-multi@10:00,13:00,17:00");
    saveReminder(payload!);
    expect(getReminders()[0]?.dailyTimes).toEqual(["10:00", "13:00", "17:00"]);
  });

  it("weekly reminder requires at least one day", () => {
    const invalid = validateReminderBuilderForm({
      ...emptyReminderBuilderForm(),
      name: "Gym",
      frequency: "weekly",
      times: ["08:00"],
      weeklyDays: [],
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.issues).toContain("Select at least one day of the week");

    const valid = validateReminderBuilderForm({
      ...emptyReminderBuilderForm(),
      name: "Gym",
      frequency: "weekly",
      times: ["08:00"],
      weeklyDays: ["mon", "wed"],
    });
    expect(valid.valid).toBe(true);
    const payload = buildReminderFromBuilderForm({
      ...emptyReminderBuilderForm(),
      name: "Gym",
      frequency: "weekly",
      times: ["08:00"],
      weeklyDays: ["mon", "wed"],
    });
    expect(payload?.recurrenceRule).toBe("weekly-days@mon,wed@08:00");
  });

  it("monthly reminder saves", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Invoice",
      frequency: "monthly" as const,
      monthDay: 15,
      times: ["09:00"],
    };
    const payload = buildReminderFromBuilderForm(form);
    expect(payload?.recurrenceRule).toBe("monthly@15@09:00");
    saveReminder(payload!);
    expect(getReminders()).toHaveLength(1);
  });

  it("custom reminder saves with optional end date", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Sprint review",
      frequency: "custom" as const,
      customDays: ["fri"],
      customEndDate: "2026-12-31",
      times: ["16:00"],
    };
    const payload = buildReminderFromBuilderForm(form);
    expect(payload?.recurrenceRule).toBe(
      "custom-days@fri@16:00@end:2026-12-31",
    );
    saveReminder(payload!);
    expect(getReminders()).toHaveLength(1);
  });

  it("validation explains missing requirements", () => {
    const result = validateReminderBuilderForm(emptyReminderBuilderForm());
    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Enter a reminder name");
    expect(result.issues).toContain("Select a frequency");
    expect(result.issues).not.toContain("Add at least one reminder time");

    const needsTime = validateReminderBuilderForm({
      ...emptyReminderBuilderForm(),
      name: "Water",
      frequency: "daily",
      times: [""],
    });
    expect(needsTime.valid).toBe(false);
    expect(needsTime.issues).toContain("Add at least one reminder time");
  });

  it("round-trips edit form from saved reminder", () => {
    const form = {
      ...emptyReminderBuilderForm(),
      name: "Drink Water",
      frequency: "weekdays" as const,
      times: ["10:00", "13:00", "17:00"],
    };
    const saved = saveReminder(buildReminderFromBuilderForm(form)!);
    const restored = builderFormFromReminder(saved);
    expect(restored.name).toBe("Drink Water");
    expect(restored.frequency).toBe("weekdays");
    expect(restored.times).toEqual(["10:00", "13:00", "17:00"]);
  });

  it("delete removes reminder immediately", () => {
    const saved = saveReminder(
      buildReminderFromBuilderForm({
        ...emptyReminderBuilderForm(),
        name: "Temp",
        frequency: "daily",
        times: ["09:00"],
      })!,
    );
    deleteReminder(saved.id);
    expect(getReminders()).toHaveLength(0);
  });

  it("collapsed subtitle summarizes weekdays without listing every time", () => {
    const saved = saveReminder(
      buildReminderFromBuilderForm({
        ...emptyReminderBuilderForm(),
        name: "Drink Water",
        frequency: "weekdays",
        times: ["09:00", "12:00", "15:00"],
      })!,
    );
    expect(formatReminderCollapsedSubtitle(saved)).toBe(
      "Weekdays • 3 times/day",
    );
    expect(getReminderExpandedTimes(saved)).toEqual([
      "9:00 AM",
      "12:00 PM",
      "3:00 PM",
    ]);
  });

  it("collapsed subtitle for one-time reminders uses day and time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T10:00:00"));
    const saved = saveReminder(
      buildReminderFromBuilderForm({
        ...emptyReminderBuilderForm(),
        name: "Call Mom",
        frequency: "once",
        onceDate: "2026-06-25",
        times: ["14:00"],
      })!,
    );
    expect(formatReminderCollapsedSubtitle(saved)).toMatch(/Tomorrow/);
    expect(formatReminderCollapsedSubtitle(saved)).toMatch(/2:00 PM/);
    vi.useRealTimers();
  });

  it("notification labels match Reminder Center copy", () => {
    expect(formatReminderNotificationLabel("both")).toBe("Desktop + Sound");
    expect(formatReminderNotificationLabel("desktop")).toBe(
      "Desktop notification",
    );
    expect(REMINDER_SAVED_TOAST).toBe("✓ Reminder saved.");
  });
});
