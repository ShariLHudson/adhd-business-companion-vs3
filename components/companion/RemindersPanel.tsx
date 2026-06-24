"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteReminder,
  getActiveReminders,
  getReminders,
  snoozeReminder,
  type Reminder,
} from "@/lib/reminderStore";

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
    return () =>
      window.removeEventListener("companion-reminders-updated", onUpdate);
  }, [refresh]);

  const all = getReminders();
  const active = getActiveReminders();
  const recurring = active.filter((r) => r.reminderType === "recurring");
  const upcoming = active.filter((r) => r.reminderType !== "recurring");
  const completed = all.filter((r) => r.status === "completed");

  return (
    <div className="mt-4 flex flex-col gap-4" key={tick}>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Upcoming
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No upcoming reminders.</p>
          ) : (
            upcoming.map((r) => (
              <ReminderRow key={r.id} reminder={r} onChange={refresh} />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Recurring
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {recurring.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No recurring reminders.</p>
          ) : (
            recurring.map((r) => (
              <ReminderRow key={r.id} reminder={r} onChange={refresh} />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Completed
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {completed.length === 0 ? (
            <p className="text-sm text-[#6b635a]">None yet.</p>
          ) : (
            completed.slice(0, 8).map((r) => (
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
