/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  cadenceLabel,
  formatRhythmWhen,
  getNotificationInventory,
  listTodayPendingTimeBlocks,
} from "./notificationInventory";
import { createMemberRhythm } from "@/lib/rhythms/store";
import { saveReminder } from "@/lib/reminderStore";
import { todayStr, type TimeBlock } from "@/lib/companionStore";
import type { MemberRhythm } from "@/lib/rhythms/types";

const TIME_BLOCKS_KEY = "companion-time-blocks-v1";

describe("notificationInventory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists active rhythms even when the reminder store is empty", () => {
    createMemberRhythm({
      title: "Morning check-in",
      cadence: "daily",
    });

    const inventory = getNotificationInventory();
    expect(inventory.upcomingReminders).toHaveLength(0);
    expect(inventory.activeRhythms.map((r) => r.title)).toContain(
      "Morning check-in",
    );
  });

  it("lists today’s pending time blocks separately from reminders", () => {
    const block: TimeBlock = {
      id: "tb-1",
      title: "Deep work",
      date: todayStr(),
      startTime: "15:00",
      durationMin: 45,
      energy: "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TIME_BLOCKS_KEY, JSON.stringify([block]));

    const inventory = getNotificationInventory();
    expect(inventory.todayTimeBlocks.map((b) => b.title)).toEqual([
      "Deep work",
    ]);
    expect(listTodayPendingTimeBlocks()).toHaveLength(1);
  });

  it("keeps classic reminders in their buckets", () => {
    saveReminder({
      title: "Call Jordan",
      message: "Follow up on proposal",
      reminderType: "one_time",
      scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
      source: "chat",
      status: "active",
    });

    const inventory = getNotificationInventory();
    expect(inventory.upcomingReminders.map((r) => r.title)).toContain(
      "Call Jordan",
    );
  });

  it("formats rhythm cadence labels", () => {
    expect(cadenceLabel("daily")).toBe("Daily");
    const sample: MemberRhythm = {
      id: "r1",
      title: "Check inbox",
      cadence: "daily",
      createdAt: "",
      updatedAt: "",
      category: "personal",
      status: "active",
      priority: "important",
      source: "user",
      schedule: { cadence: "weekly" },
      window: "morning",
      deliveryMethods: ["in_app"],
      quietHoursBehavior: "defer",
      snoozeDefaultsMinutes: [15, 30],
      nextDueAt: "2099-01-15T14:00:00.000Z",
    };
    expect(formatRhythmWhen(sample)).toMatch(/^Weekly · next /);
  });
});
