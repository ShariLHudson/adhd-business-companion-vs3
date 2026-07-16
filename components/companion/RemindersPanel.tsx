"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteReminder,
  snoozeReminder,
  type Reminder,
} from "@/lib/reminderStore";
import {
  formatRhythmWhen,
  formatTimeBlockWhen,
  getNotificationInventory,
} from "@/lib/notifications/notificationInventory";

const CARD =
  "rounded-2xl border px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/40";

function formatWhen(r: Reminder): string {
  if (r.recurrenceRule) {
    if (r.recurrenceRule === "hourly") return "Every hour";
    if (r.recurrenceRule.startsWith("daily@")) return "Every day";
    if (r.recurrenceRule.startsWith("weekdays@")) return "Weekdays";
    if (r.recurrenceRule.startsWith("weekly@")) {
      const day = r.recurrenceRule.split("@")[1];
      return `Every ${day}`;
    }
    return r.recurrenceRule;
  }
  if (r.reminderType === "event_offset" && r.offsets?.length) {
    const offset = r.offsets[0]!;
    const label =
      offset >= 60 ? `${offset / 60}h before` : `${offset}m before`;
    return `${label}${r.eventTitle ? ` · ${r.eventTitle}` : ""}`;
  }
  if (r.scheduledAt) {
    return new Date(r.scheduledAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "Scheduled";
}

function ReminderRow({
  reminder,
  onChange,
}: {
  reminder: Reminder;
  onChange: () => void;
}) {
  const snooze = (minutes: number) => {
    const until = new Date();
    until.setMinutes(until.getMinutes() + minutes);
    snoozeReminder(reminder.id, until.toISOString());
    onChange();
  };

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#2a2520]">{reminder.title}</p>
          <p className="mt-0.5 text-sm text-[#6b635a]">{formatWhen(reminder)}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
            onClick={() => snooze(15)}
          >
            Snooze 15m
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-medium text-[#a85c4a] hover:bg-[#a85c4a]/10"
            onClick={() => {
              deleteReminder(reminder.id);
              onChange();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function RemindersPanel() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("companion-reminders-updated", onUpdate);
    window.addEventListener("companion-rhythms-updated", onUpdate);
    return () => {
      window.removeEventListener("companion-reminders-updated", onUpdate);
      window.removeEventListener("companion-rhythms-updated", onUpdate);
    };
  }, [refresh]);

  const inventory = getNotificationInventory();
  const {
    activeRhythms,
    todayTimeBlocks,
    upcomingReminders,
    recurringReminders,
    completedReminders,
  } = inventory;

  return (
    <div className="mt-4 flex flex-col gap-4" key={tick}>
      <p className="text-sm text-[#6b635a]">
        Chimes can come from rhythms, time blocks, or reminders. Everything that
        can sound is listed below.
      </p>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Active rhythms
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {activeRhythms.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No active rhythms.</p>
          ) : (
            activeRhythms.map((rhythm) => (
              <div key={rhythm.id} className={CARD}>
                <p className="font-semibold text-[#2a2520]">{rhythm.title}</p>
                <p className="mt-0.5 text-sm text-[#6b635a]">
                  {formatRhythmWhen(rhythm)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Today&apos;s time blocks
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {todayTimeBlocks.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No time blocks today.</p>
          ) : (
            todayTimeBlocks.map((block) => (
              <div key={block.id} className={CARD}>
                <p className="font-semibold text-[#2a2520]">{block.title}</p>
                <p className="mt-0.5 text-sm text-[#6b635a]">
                  {formatTimeBlockWhen(block)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Upcoming reminders
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No upcoming reminders.</p>
          ) : (
            upcomingReminders.map((r) => (
              <ReminderRow key={r.id} reminder={r} onChange={refresh} />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Recurring reminders
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {recurringReminders.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No recurring reminders.</p>
          ) : (
            recurringReminders.map((r) => (
              <ReminderRow key={r.id} reminder={r} onChange={refresh} />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Completed reminders
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {completedReminders.length === 0 ? (
            <p className="text-sm text-[#6b635a]">None yet.</p>
          ) : (
            completedReminders.slice(0, 8).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm text-[#6b635a]"
              >
                {r.title}
                <button
                  type="button"
                  className="ml-2 text-[#a85c4a]"
                  onClick={() => {
                    deleteReminder(r.id);
                    refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
