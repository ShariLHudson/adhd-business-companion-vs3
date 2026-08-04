"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BUILDER_DAY_LABELS,
  BUILDER_DAY_ORDER,
  REMINDER_BUILDER_FREQUENCIES,
  REMINDER_SAVED_TOAST,
  builderFormFromReminder,
  buildReminderFromBuilderForm,
  emptyReminderBuilderForm,
  formatReminderCollapsedSubtitle,
  formatReminderCreatedDate,
  formatReminderExpandedScheduleLabel,
  formatReminderNotificationLabel,
  getReminderExpandedTimes,
  isBuilderRecurringRule,
  validateReminderBuilderForm,
  type BuilderDayId,
  type ReminderBuilderFormState,
  type ReminderBuilderFrequency,
} from "@/lib/reminderBuilder";
import {
  completeReminder,
  deleteReminder,
  getActiveReminders,
  getReminders,
  pauseReminder,
  saveReminder,
  updateReminder,
  type Reminder,
  type ReminderNotificationChannel,
} from "@/lib/reminderStore";

const CARD_ROW =
  "overflow-hidden rounded-2xl border border-[#d4cdc3] text-left transition-colors hover:border-[#1e4f4f]/40";

const INPUT =
  "mt-1 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]";

const FREQ_LABELS: Record<ReminderBuilderFrequency, string> = {
  once: "Once",
  daily: "Daily",
  weekdays: "Weekdays (Mon–Fri)",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

function DayCheckboxes({
  selected,
  onChange,
  testIdPrefix,
}: {
  selected: BuilderDayId[];
  onChange: (days: BuilderDayId[]) => void;
  testIdPrefix: string;
}) {
  function toggle(day: BuilderDayId) {
    onChange(
      selected.includes(day)
        ? selected.filter((d) => d !== day)
        : [...selected, day],
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5" data-testid={`${testIdPrefix}-days`}>
      {BUILDER_DAY_ORDER.map((day) => (
        <label
          key={day}
          className="flex cursor-pointer items-center gap-2 text-sm text-[#2a2520]"
        >
          <input
            type="checkbox"
            checked={selected.includes(day)}
            onChange={() => toggle(day)}
            data-testid={`${testIdPrefix}-day-${day}`}
          />
          {BUILDER_DAY_LABELS[day]}
        </label>
      ))}
    </div>
  );
}

function TimeSlots({
  times,
  onChange,
  maxTimes,
}: {
  times: string[];
  onChange: (times: string[]) => void;
  maxTimes?: number;
}) {
  function updateTime(index: number, value: string) {
    const next = [...times];
    next[index] = value;
    onChange(next);
  }

  function addTime() {
    if (maxTimes === 1) return;
    onChange([...times, "09:00"]);
  }

  function removeTime(index: number) {
    if (times.length <= 1) return;
    onChange(times.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-2 space-y-2" data-testid="reminder-builder-time-slots">
      {times.map((time, index) => (
        <div key={index} className="flex items-end gap-2">
          <label className="flex-1 text-xs font-semibold text-[#6b635a]">
            Time {index + 1}
            <input
              type="time"
              value={time}
              onChange={(e) => updateTime(index, e.target.value)}
              className={INPUT}
              data-testid={`reminder-builder-time-${index}`}
            />
          </label>
          {times.length > 1 ? (
            <button
              type="button"
              onClick={() => removeTime(index)}
              className="mb-0.5 rounded-lg px-2 py-2 text-xs font-medium text-[#a85c4a] hover:bg-[#a85c4a]/10"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
      {maxTimes !== 1 && times.length < 8 ? (
        <button
          type="button"
          onClick={addTime}
          className="text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="reminder-builder-add-time"
        >
          + Add Time
        </button>
      ) : null}
    </div>
  );
}

function ReminderBuilder({
  initialForm,
  onSaved,
  onCancel,
}: {
  initialForm?: ReminderBuilderFormState;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ReminderBuilderFormState>(
    initialForm ?? emptyReminderBuilderForm(),
  );
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [touched, setTouched] = useState(Boolean(initialForm?.editId));

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
      setTouched(true);
      setAttemptedSave(false);
    }
  }, [initialForm]);

  const validation = validateReminderBuilderForm(form);
  const saveDisabled = !validation.valid;
  const showIssues =
    !validation.valid &&
    (attemptedSave || touched || Boolean(form.frequency));

  function patch(partial: Partial<ReminderBuilderFormState>) {
    setTouched(true);
    setSaveError(null);
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleFrequencyChange(freq: ReminderBuilderFrequency | "") {
    const next: Partial<ReminderBuilderFormState> = { frequency: freq };
    if (freq === "once" && form.times.length > 1) {
      next.times = [form.times[0] ?? "09:00"];
    } else if (freq && !form.times.some((t) => /^\d{2}:\d{2}$/.test(t))) {
      next.times = ["09:00"];
    }
    patch(next);
  }

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setAttemptedSave(true);
    setSaveError(null);

    const currentValidation = validateReminderBuilderForm(form);
    if (!currentValidation.valid) return;

    const payload = buildReminderFromBuilderForm(form);
    if (!payload) {
      setSaveError("Could not build this reminder — check the fields and try again.");
      return;
    }

    const saved = form.editId
      ? updateReminder(form.editId, payload)
      : saveReminder(payload);
    if (!saved) {
      setSaveError("Could not save — try again.");
      return;
    }

    setForm(emptyReminderBuilderForm());
    setAttemptedSave(false);
    setTouched(false);
    onSaved();
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-[#1e4f4f]/25 bg-[#f0f8f8]/40 p-4"
      data-testid="reminder-builder"
    >
      <p className="text-sm font-semibold text-[#1f1c19]">
        Reminder Builder™
        {form.editId ? (
          <span className="ml-2 text-xs font-normal text-[#6b635a]">Editing</span>
        ) : null}
      </p>

      <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
        Reminder name
        <input
          value={form.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Drink Water"
          className={INPUT}
          data-testid="reminder-builder-name"
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
        Frequency
        <select
          value={form.frequency}
          onChange={(e) =>
            handleFrequencyChange(
              e.target.value as ReminderBuilderFrequency | "",
            )
          }
          className={INPUT}
          data-testid="reminder-builder-frequency"
        >
          <option value="">Select frequency…</option>
          {REMINDER_BUILDER_FREQUENCIES.map((freq) => (
            <option key={freq} value={freq}>
              {FREQ_LABELS[freq]}
            </option>
          ))}
        </select>
      </label>

      {form.frequency === "once" ? (
        <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
          Date
          <input
            type="date"
            value={form.onceDate}
            onChange={(e) => patch({ onceDate: e.target.value })}
            className={INPUT}
            data-testid="reminder-builder-once-date"
          />
        </label>
      ) : null}

      {form.frequency === "weekly" ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-[#6b635a]">Days</p>
          <DayCheckboxes
            selected={form.weeklyDays}
            onChange={(weeklyDays) => patch({ weeklyDays })}
            testIdPrefix="reminder-builder-weekly"
          />
        </div>
      ) : null}

      {form.frequency === "monthly" ? (
        <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
          Day of month
          <select
            value={form.monthDay}
            onChange={(e) => patch({ monthDay: Number(e.target.value) })}
            className={INPUT}
            data-testid="reminder-builder-month-day"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
                {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of
                each month
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {form.frequency === "custom" ? (
        <>
          <div className="mt-3">
            <p className="text-xs font-semibold text-[#6b635a]">Days</p>
            <DayCheckboxes
              selected={form.customDays}
              onChange={(customDays) => patch({ customDays })}
              testIdPrefix="reminder-builder-custom"
            />
          </div>
          <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
            End date (optional)
            <input
              type="date"
              value={form.customEndDate}
              onChange={(e) => patch({ customEndDate: e.target.value })}
              className={INPUT}
              data-testid="reminder-builder-custom-end"
            />
          </label>
        </>
      ) : null}

      {form.frequency ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-[#6b635a]">
            {form.frequency === "weekdays"
              ? "Times (Monday–Friday)"
              : "Times"}
          </p>
          <TimeSlots
            times={form.times}
            onChange={(times) => patch({ times })}
            maxTimes={form.frequency === "once" ? 1 : undefined}
          />
        </div>
      ) : null}

      <label className="mt-3 block text-xs font-semibold text-[#6b635a]">
        Notification type
        <select
          value={form.channel}
          onChange={(e) =>
            patch({
              channel: e.target.value as ReminderNotificationChannel,
            })
          }
          className={INPUT}
        >
          <option value="desktop">Desktop</option>
          <option value="sound">Sound</option>
          <option value="both">Both</option>
        </select>
      </label>

      {showIssues ? (
        <div
          className="mt-3 rounded-xl border border-[#a85c4a]/35 bg-[#fff8f5] px-3 py-2 text-sm text-[#6b3d32]"
          data-testid="reminder-builder-issues"
        >
          <p className="font-semibold">Cannot save yet:</p>
          <ul className="mt-1 list-disc pl-5">
            {validation.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : saveDisabled ? (
        <p className="mt-3 text-xs text-[#6b635a]" data-testid="reminder-builder-hint">
          Complete the fields above to enable Save.
        </p>
      ) : null}

      {validation.valid ? (
        <p className="mt-3 text-xs text-[#1e4f4f]" data-testid="reminder-builder-ready">
          Ready — {validation.times.length}{" "}
          {validation.times.length === 1 ? "time" : "times"} ·{" "}
          {FREQ_LABELS[validation.frequency!]}
        </p>
      ) : null}

      {saveError ? (
        <p
          className="mt-3 text-sm text-[#a85c4a]"
          data-testid="reminder-builder-save-error"
        >
          {saveError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saveDisabled}
          onClick={() => handleSave()}
          className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          data-testid="reminder-builder-save"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(emptyReminderBuilderForm());
            setAttemptedSave(false);
            setTouched(false);
            onCancel?.();
          }}
          className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#6b635a]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReminderAccordionRow({
  reminder,
  variant,
  expanded,
  onToggle,
  onChange,
  onEdit,
}: {
  reminder: Reminder;
  variant: "upcoming" | "recurring" | "completed";
  expanded: boolean;
  onToggle: () => void;
  onChange: () => void;
  onEdit: (reminder: Reminder) => void;
}) {
  const paused = Boolean(reminder.paused);
  const subtitle = formatReminderCollapsedSubtitle(reminder);
  const times = getReminderExpandedTimes(reminder);
  const notification = formatReminderNotificationLabel(reminder.notificationChannel);
  const created = formatReminderCreatedDate(reminder.createdAt);

  return (
    <article
      className={CARD_ROW}
      data-testid={`reminder-row-${reminder.id}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#faf7f2]/60"
        aria-expanded={expanded}
      >
        <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden>
          {expanded ? "▼" : "▶"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#2a2520]">{reminder.title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[#9a8f82]">{subtitle}</p>
          ) : null}
        </div>
      </button>

      {expanded ? (
        <div
          className="border-t border-[#efe8de] px-4 pb-4 pt-3 text-sm text-[#4b463f]"
          data-testid={`reminder-row-expanded-${reminder.id}`}
        >
          {variant === "upcoming" ? (
            <div className="space-y-1">
              <p>{formatReminderExpandedScheduleLabel(reminder)}</p>
              <p>{times[0]}</p>
              <p className="text-[#6b635a]">{notification}</p>
            </div>
          ) : variant === "recurring" ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                  Schedule
                </p>
                <p className="mt-0.5">{formatReminderExpandedScheduleLabel(reminder)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                  Times
                </p>
                <ul className="mt-1 list-none space-y-0.5">
                  {times.map((time) => (
                    <li key={time}>• {time}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                  Notification
                </p>
                <p className="mt-0.5">{notification}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                  Created
                </p>
                <p className="mt-0.5">{created}</p>
              </div>
              {paused ? (
                <p className="text-xs font-medium text-[#a85c4a]">Paused</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[#6b635a]">{subtitle}</p>
              <p className="text-[#6b635a]">{notification}</p>
              <p className="text-[#6b635a]">Created {created}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {variant !== "completed" ? (
              <button
                type="button"
                className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                onClick={() => onEdit(reminder)}
              >
                Edit
              </button>
            ) : null}
            {variant === "upcoming" ? (
              <button
                type="button"
                className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                onClick={() => {
                  completeReminder(reminder.id);
                  onChange();
                }}
              >
                Complete
              </button>
            ) : null}
            {variant === "recurring" ? (
              <button
                type="button"
                className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                onClick={() => {
                  pauseReminder(reminder.id, !paused);
                  onChange();
                }}
              >
                {paused ? "Resume" : "Pause"}
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-xs font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
              onClick={() => {
                deleteReminder(reminder.id);
                onChange();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function RemindersPanel() {
  const [listVersion, setListVersion] = useState(0);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editForm, setEditForm] = useState<ReminderBuilderFormState | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => setListVersion((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("companion-reminders-updated", onUpdate);
    return () =>
      window.removeEventListener("companion-reminders-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const all = useMemo(() => getReminders(), [listVersion]);
  const active = getActiveReminders();
  const recurring = active.filter(
    (r) =>
      r.reminderType === "recurring" || isBuilderRecurringRule(r.recurrenceRule),
  );
  const upcoming = active.filter(
    (r) =>
      r.reminderType !== "recurring" && !isBuilderRecurringRule(r.recurrenceRule),
  );
  const completed = all.filter((r) => r.status === "completed");

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleSaved() {
    setToast(REMINDER_SAVED_TOAST);
    setBuilderOpen(false);
    setEditForm(null);
    setExpandedId(null);
    refresh();
  }

  function startEdit(reminder: Reminder) {
    setEditForm(builderFormFromReminder(reminder));
    setBuilderOpen(true);
    setExpandedId(null);
  }

  return (
    <div className="relative mt-4 flex flex-col gap-4">
      {toast ? (
        <p
          className="companion-fade-in rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-3 text-center text-sm font-semibold text-[#1e4f4f]"
          role="status"
          aria-live="polite"
          data-testid="reminder-saved-toast"
        >
          {toast}
        </p>
      ) : null}

      {builderOpen ? (
        <ReminderBuilder
          initialForm={editForm ?? undefined}
          onSaved={handleSaved}
          onCancel={() => {
            setBuilderOpen(false);
            setEditForm(null);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setBuilderOpen(true);
            setEditForm(null);
          }}
          className="rounded-xl border border-[#1e4f4f]/35 bg-[#f0f8f8]/50 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          data-testid="open-reminder-builder"
        >
          + New Reminder
        </button>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Upcoming ({upcoming.length})
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No upcoming reminders.</p>
          ) : (
            upcoming.map((r) => (
              <ReminderAccordionRow
                key={r.id}
                reminder={r}
                variant="upcoming"
                expanded={expandedId === r.id}
                onToggle={() => toggleExpanded(r.id)}
                onChange={() => {
                  setExpandedId(null);
                  refresh();
                }}
                onEdit={startEdit}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Recurring ({recurring.length})
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {recurring.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No recurring reminders.</p>
          ) : (
            recurring.map((r) => (
              <ReminderAccordionRow
                key={r.id}
                reminder={r}
                variant="recurring"
                expanded={expandedId === r.id}
                onToggle={() => toggleExpanded(r.id)}
                onChange={() => {
                  setExpandedId(null);
                  refresh();
                }}
                onEdit={startEdit}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
          Completed ({completed.length})
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {completed.length === 0 ? (
            <p className="text-sm text-[#6b635a]">None yet.</p>
          ) : (
            completed.map((r) => (
              <ReminderAccordionRow
                key={r.id}
                reminder={r}
                variant="completed"
                expanded={expandedId === r.id}
                onToggle={() => toggleExpanded(r.id)}
                onChange={() => {
                  setExpandedId(null);
                  refresh();
                }}
                onEdit={startEdit}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
