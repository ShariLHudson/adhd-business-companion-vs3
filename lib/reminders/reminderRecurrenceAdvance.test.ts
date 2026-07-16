/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { afterReminderFired } from "@/lib/reminderAlerts";
import { nextRecurrenceFire } from "@/lib/reminderIntelligence";
import { getReminders, saveReminder } from "@/lib/reminderStore";
import { EMPTY_REMINDER_FORM, reminderPayloadFromForm } from "./reminderForm";

describe("nextRecurrenceFire", () => {
  it("advances monthly and yearly rules", () => {
    const from = new Date("2026-07-01T09:00:00.000Z");
    const monthly = nextRecurrenceFire("monthly@01@09:00", from);
    expect(monthly).toBeTruthy();
    expect(new Date(monthly!).getTime()).toBeGreaterThan(from.getTime());

    const yearlyFrom = new Date("2026-03-15T10:00:00.000Z");
    const yearly = nextRecurrenceFire("yearly@03-15@10:00", yearlyFrom);
    expect(yearly).toBeTruthy();
    expect(new Date(yearly!).getFullYear()).toBe(2027);
  });

  it("keeps custom rules recurring with a next fire", () => {
    const from = new Date("2026-07-01T12:00:00.000Z");
    const next = nextRecurrenceFire("custom@every other Tuesday", from);
    expect(next).toBeTruthy();
    expect(new Date(next!).getTime()).toBeGreaterThan(from.getTime());
  });
});

describe("afterReminderFired recurring", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not complete a monthly recurring reminder after fire", () => {
    const created = saveReminder(
      reminderPayloadFromForm({
        ...EMPTY_REMINDER_FORM,
        title: "Monthly books",
        repeat: "monthly",
        date: "2026-07-01",
        time: "09:00",
      }),
    );
    const before = getReminders().find((r) => r.id === created.id)!;
    afterReminderFired(before, new Date("2026-07-01T09:05:00.000Z").getTime());
    const after = getReminders().find((r) => r.id === created.id)!;
    expect(after.status).toBe("active");
    expect(after.reminderType).toBe("recurring");
    expect(after.scheduledAt).toBeTruthy();
    expect(new Date(after.scheduledAt!).getTime()).toBeGreaterThan(
      new Date(before.scheduledAt!).getTime(),
    );
  });
});
