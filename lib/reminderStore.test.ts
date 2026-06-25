import { beforeEach, describe, expect, it, vi } from "vitest";
import { pruneReminders, type Reminder } from "./reminderStore";

function makeReminder(
  partial: Partial<Reminder> & Pick<Reminder, "id" | "status">,
): Reminder {
  return {
    id: partial.id,
    title: partial.title ?? "Test",
    message: partial.message ?? "Message",
    reminderType: partial.reminderType ?? "one_time",
    source: partial.source ?? "chat",
    createdAt: partial.createdAt ?? "2026-01-01T12:00:00.000Z",
    status: partial.status,
    lastFiredAt: partial.lastFiredAt,
    scheduledAt: partial.scheduledAt,
  };
}

describe("pruneReminders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T12:00:00.000Z"));
  });

  it("keeps all active reminders", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeReminder({ id: `a-${i}`, status: "active" }),
    );
    expect(pruneReminders(items)).toHaveLength(10);
  });

  it("drops completed reminders older than 14 days", () => {
    const items = [
      makeReminder({
        id: "old",
        status: "completed",
        lastFiredAt: "2026-05-01T12:00:00.000Z",
      }),
      makeReminder({
        id: "recent",
        status: "completed",
        lastFiredAt: "2026-06-20T12:00:00.000Z",
      }),
    ];
    const pruned = pruneReminders(items);
    expect(pruned.map((r) => r.id)).toEqual(["recent"]);
  });

  it("caps total stored reminders", () => {
    const items = [
      ...Array.from({ length: 80 }, (_, i) =>
        makeReminder({ id: `active-${i}`, status: "active" }),
      ),
      ...Array.from({ length: 80 }, (_, i) =>
        makeReminder({
          id: `done-${i}`,
          status: "completed",
          lastFiredAt: "2026-06-24T12:00:00.000Z",
        }),
      ),
    ];
    expect(pruneReminders(items).length).toBeLessThanOrEqual(120);
  });

  it("aggressive mode keeps only active reminders", () => {
    const items = [
      makeReminder({ id: "active", status: "active" }),
      makeReminder({
        id: "done",
        status: "completed",
        lastFiredAt: "2026-06-24T12:00:00.000Z",
      }),
    ];
    expect(pruneReminders(items, "aggressive").map((r) => r.id)).toEqual([
      "active",
    ]);
  });
});
