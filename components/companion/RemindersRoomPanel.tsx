"use client";

import { useCallback, useEffect, useState } from "react";
import { RemindersRoomShell } from "@/components/companion/RemindersRoomShell";
import { RemindersNotificationSettings } from "@/components/companion/RemindersNotificationSettings";
import {
  ComparisonExpandable,
  HowToUseBlock,
  PersistentDifferenceCue,
  PreviewCard,
  ReminderActionsExplained,
  ReminderStartExamples,
  RoomArrivalBlock,
} from "@/components/companion/ReminderRhythmRoomChrome";
import { NotificationSoundPreferences } from "@/components/companion/NotificationSoundPreferences";
import {
  PLAN_MY_DAY_MORNING_COPY,
} from "@/lib/planMyDay/morningRoom";
import {
  completeReminder,
  deleteReminder,
  getReminders,
  saveReminder,
  snoozeReminder,
  updateReminder,
  type Reminder,
} from "@/lib/reminderStore";
import {
  EMPTY_REMINDER_FORM,
  REMINDER_REPEAT_OPTIONS,
  REMINDER_SAVE_FAILURE_MESSAGE,
  REMINDERS_HOW_DO_I_COPY,
  formValuesFromReminder,
  formatReminderWhen,
  partitionReminders,
  reminderPayloadFromForm,
  reminderSaveSuccessMessage,
  type ReminderFormValues,
  type ReminderRepeatOption,
} from "@/lib/reminders/reminderForm";
import { scrollRoomListToTestId } from "@/lib/planMyDay/scrollRoomList";
import {
  REMINDER_START_EXAMPLES,
  buildReminderPreview,
  clearReminderFormDraft,
  loadReminderFormDraft,
  saveReminderFormDraft,
} from "@/lib/remindersVsRhythms";

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white px-4 py-3 text-left";
const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";
const BTN_TEAL_SOFT =
  "rounded-xl border border-[#1e4f4f]/40 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10";

function RemindersHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="reminders-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="reminders-how-do-i-toggle"
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="reminders-how-do-i-body"
        >
          {REMINDERS_HOW_DO_I_COPY}
        </p>
      ) : null}
    </div>
  );
}

function ReminderForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  values: ReminderFormValues;
  onChange: (next: ReminderFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const set = <K extends keyof ReminderFormValues>(
    key: K,
    value: ReminderFormValues[K],
  ) => onChange({ ...values, [key]: value });

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-[#e7dfd4] bg-white/90 p-4"
      data-testid="reminders-add-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="block text-sm font-semibold text-[#1f1c19]">
        What should I remind you about?
        <input
          className={FIELD}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
          data-testid="reminders-field-title"
          placeholder="Call the accountant…"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[#1f1c19]">
          Date
          <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
          <input
            type="date"
            className={FIELD}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            data-testid="reminders-field-date"
          />
        </label>
        <label className="block text-sm font-semibold text-[#1f1c19]">
          Time
          <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
          <input
            type="time"
            className={FIELD}
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            data-testid="reminders-field-time"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Repeat
        <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
        <select
          className={FIELD}
          value={values.repeat}
          onChange={(e) =>
            set("repeat", e.target.value as ReminderRepeatOption)
          }
          data-testid="reminders-field-repeat"
        >
          {REMINDER_REPEAT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {values.repeat === "custom" ? (
        <label className="block text-sm font-semibold text-[#1f1c19]">
          Custom repeat
          <input
            className={FIELD}
            value={values.customRepeatNote}
            onChange={(e) => set("customRepeatNote", e.target.value)}
            placeholder="Every 2 weeks…"
            data-testid="reminders-field-custom-repeat"
          />
        </label>
      ) : null}
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Notes
        <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
        <textarea
          className={`${FIELD} min-h-[4rem]`}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          data-testid="reminders-field-notes"
        />
      </label>
      <div className="room-form-actions flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} data-testid="reminders-save">
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={onCancel}
            data-testid="reminders-cancel-edit"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function ReminderRow({
  reminder,
  onChanged,
}: {
  reminder: Reminder;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ReminderFormValues>(() =>
    formValuesFromReminder(reminder),
  );
  const [moving, setMoving] = useState(false);
  const [moveDate, setMoveDate] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setDraft(formValuesFromReminder(reminder));
  }, [reminder]);

  if (editing) {
    return (
      <li className={CARD} data-testid={`reminder-row-${reminder.id}`}>
        <ReminderForm
          values={draft}
          onChange={(next) => {
            setRowError(null);
            setDraft(next);
          }}
          submitLabel="Save changes"
          onCancel={() => {
            setRowError(null);
            setEditing(false);
          }}
          onSubmit={() => {
            if (!draft.title.trim()) return;
            try {
              const payload = reminderPayloadFromForm(draft);
              const saved = updateReminder(reminder.id, {
                title: payload.title,
                message: payload.message,
                reminderType: payload.reminderType,
                scheduledAt: payload.scheduledAt,
                recurrenceRule: payload.recurrenceRule,
              });
              if (!saved) {
                setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
                return;
              }
              const confirmed = getReminders().find((r) => r.id === reminder.id);
              if (!confirmed) {
                setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
                return;
              }
              setRowError(null);
              setEditing(false);
              onChanged();
            } catch {
              setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
            }
          }}
        />
        {rowError ? (
          <p
            className="mt-2 text-sm font-medium text-[#6b3f2a]"
            role="status"
            data-testid={`reminder-edit-error-${reminder.id}`}
          >
            {rowError}
          </p>
        ) : null}
      </li>
    );
  }

  return (
    <li className={CARD} data-testid={`reminder-row-${reminder.id}`}>
      <p className="font-semibold text-[#2a2520]">{reminder.title}</p>
      <p className="mt-0.5 text-sm text-[#6b635a]">
        {formatReminderWhen(reminder)}
      </p>
      {reminder.message && reminder.message !== reminder.title ? (
        <p className="mt-1 text-sm text-[#4b463f]">{reminder.message}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={BTN_TEAL_SOFT}
          data-testid={`reminder-complete-${reminder.id}`}
          onClick={() => {
            try {
              completeReminder(reminder.id);
              setRowError(null);
              onChanged();
            } catch {
              setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
            }
          }}
        >
          Complete
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          data-testid={`reminder-snooze-${reminder.id}`}
          onClick={() => {
            try {
              const until = new Date();
              until.setMinutes(until.getMinutes() + 15);
              snoozeReminder(reminder.id, until.toISOString());
              setRowError(null);
              onChanged();
            } catch {
              setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
            }
          }}
        >
          Snooze 15m
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          data-testid={`reminder-more-${reminder.id}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          More
        </button>
      </div>
      {moreOpen ? (
        <div
          className="mt-2 flex flex-wrap gap-2 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2"
          data-testid={`reminder-more-menu-${reminder.id}`}
        >
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`reminder-edit-${reminder.id}`}
            onClick={() => {
              setRowError(null);
              setEditing(true);
              setMoreOpen(false);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`reminder-move-${reminder.id}`}
            onClick={() => setMoving((v) => !v)}
          >
            Move date
          </button>
          {reminder.reminderType === "recurring" ? (
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`reminder-end-recurrence-${reminder.id}`}
              onClick={() => {
                try {
                  updateReminder(reminder.id, {
                    reminderType: "one_time",
                    recurrenceRule: undefined,
                  });
                  setRowError(null);
                  onChanged();
                } catch {
                  setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
                }
              }}
            >
              End recurrence
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-[#a85c4a]/40 px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
            data-testid={`reminder-delete-${reminder.id}`}
            onClick={() => {
              try {
                deleteReminder(reminder.id);
                setRowError(null);
                onChanged();
              } catch {
                setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
              }
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      {rowError ? (
        <p
          className="mt-2 text-sm font-medium text-[#6b3f2a]"
          role="status"
          data-testid={`reminder-row-error-${reminder.id}`}
        >
          {rowError}
        </p>
      ) : null}
      {moving ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm font-semibold text-[#1f1c19]">
            New date
            <input
              type="date"
              className={FIELD}
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
              data-testid={`reminder-move-date-${reminder.id}`}
            />
          </label>
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid={`reminder-move-save-${reminder.id}`}
            onClick={() => {
              if (!moveDate.trim()) return;
              const timePart = reminder.scheduledAt
                ? new Date(reminder.scheduledAt)
                : null;
              const hour = timePart ? timePart.getHours() : 9;
              const minute = timePart ? timePart.getMinutes() : 0;
              const next = new Date(
                `${moveDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
              );
              if (Number.isNaN(next.getTime())) return;
              try {
                updateReminder(reminder.id, {
                  scheduledAt: next.toISOString(),
                  snoozedUntil: undefined,
                });
                setMoving(false);
                setMoveDate("");
                setRowError(null);
                onChanged();
              } catch {
                setRowError(REMINDER_SAVE_FAILURE_MESSAGE);
              }
            }}
          >
            Save date
          </button>
        </div>
      ) : null}
    </li>
  );
}

function ReminderSection({
  title,
  empty,
  items,
  testId,
  onChanged,
  onAddFocus,
}: {
  title: string;
  empty: string;
  items: Reminder[];
  testId: string;
  onChanged: () => void;
  onAddFocus: () => void;
}) {
  return (
    <section className="mt-6" data-testid={testId}>
      <h2 className="text-lg font-semibold text-[#1f1c19]">{title}</h2>
      {items.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-5">
          <p className="text-base text-[#6b635a]">{empty}</p>
          <button
            type="button"
            className={`${BTN_TEAL_SOFT} mt-3`}
            onClick={onAddFocus}
            data-testid={`${testId}-add-cta`}
          >
            Add a Reminder
          </button>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((r) => (
            <ReminderRow key={r.id} reminder={r} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </section>
  );
}

function dateWithOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function RemindersRoomPanel({
  onBack,
  registerBack,
  embedded = false,
}: {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Inside shared Reminders / Rhythms window — no shell or duplicate How Do I. */
  embedded?: boolean;
}) {
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState<ReminderFormValues>(EMPTY_REMINDER_FORM);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    setForm(loadReminderFormDraft());
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("companion-reminders-updated", onUpdate);
    return () =>
      window.removeEventListener("companion-reminders-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!registerBack || embedded) return;
    // Never call onBack/goBack from the interceptor — that re-enters goBack and stack-overflows.
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack, embedded]);

  const all = getReminders();
  const { upcoming, recurring, completed } = partitionReminders(all);
  const preview = buildReminderPreview(form);

  function updateForm(next: ReminderFormValues) {
    setForm(next);
    saveReminderFormDraft(next);
  }

  function focusAddForm() {
    setShowAddForm(true);
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('[data-testid="reminders-field-title"]')
        ?.focus();
    }, 40);
  }

  function applyExample(exampleId: string) {
    const ex = REMINDER_START_EXAMPLES.find((e) => e.id === exampleId);
    if (!ex) return;
    const next: ReminderFormValues = {
      title: ex.form.title,
      date: dateWithOffset(ex.form.dateOffsetDays),
      time: ex.form.time,
      repeat: ex.form.repeat,
      notes: ex.form.notes,
      customRepeatNote: ex.form.customRepeatNote,
    };
    updateForm(next);
    focusAddForm();
  }

  function handleSave() {
    if (saving) return;
    if (!form.title.trim()) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const created = saveReminder(reminderPayloadFromForm(form));
      const confirmed = getReminders().find((r) => r.id === created.id);
      if (!confirmed) {
        setStatusTone("error");
        setStatusMessage(REMINDER_SAVE_FAILURE_MESSAGE);
        return;
      }
      setForm(EMPTY_REMINDER_FORM);
      clearReminderFormDraft();
      setStatusTone("success");
      setStatusMessage(reminderSaveSuccessMessage(confirmed));
      refresh();
      window.setTimeout(() => {
        scrollRoomListToTestId(`reminder-row-${confirmed.id}`);
        const section =
          confirmed.reminderType === "recurring"
            ? "reminders-recurring"
            : "reminders-upcoming";
        if (
          !document.querySelector(
            `[data-testid="reminder-row-${confirmed.id}"]`,
          )
        ) {
          scrollRoomListToTestId(section);
        }
      }, 80);
    } catch {
      setStatusTone("error");
      setStatusMessage(REMINDER_SAVE_FAILURE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  const body = (
      <div
        className="plan-day-morning-note flex h-full min-h-0 flex-col"
        data-testid="reminders-room-panel"
        data-embedded={embedded ? "true" : "false"}
        data-tick={tick}
      >
        {!embedded ? (
          <header className="reminders-rhythms-shell__header">
            <button
              type="button"
              className="plan-day-morning-note__previous"
              onClick={onBack}
              data-testid="app-back-button"
              aria-label="Previous Screen"
            >
              <span aria-hidden="true">←</span>
              <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
            </button>
            <h1
              className="plan-day-morning-note__title mt-2"
              data-testid="reminders-title"
            >
              Reminders
            </h1>
          </header>
        ) : (
          <h2
            className="plan-day-morning-note__title mt-2 text-xl"
            data-testid="reminders-title"
          >
            Reminders
          </h2>
        )}

        <div className="reminders-rhythms-shell__content flex flex-col gap-2">
          {!embedded ? <RemindersHowDoI /> : null}
          {!embedded ? <HowToUseBlock kind="reminders" /> : null}
          {!embedded ? <PersistentDifferenceCue kind="reminders" /> : null}
          {!embedded ? (
            <RoomArrivalBlock
              kind="reminders"
              onPrimary={focusAddForm}
              onShowComparison={() => setComparisonOpen(true)}
            />
          ) : null}
          {!embedded ? (
            <ComparisonExpandable
              open={comparisonOpen}
              onToggle={() => setComparisonOpen((v) => !v)}
              testIdPrefix="reminders"
            />
          ) : null}
          <ReminderStartExamples onUse={applyExample} />
          <ReminderActionsExplained />

          <section className="mt-6" data-testid="reminders-add-section">
            <h2 className="mb-3 text-lg font-semibold text-[#1f1c19]">
              Add a Reminder
            </h2>
            {showAddForm || form.title.trim() ? (
              <>
                <ReminderForm
                  values={form}
                  onChange={updateForm}
                  onSubmit={handleSave}
                  submitLabel="Save Reminder"
                />
                {form.title.trim() ? (
                  <PreviewCard
                    title="Before you save"
                    testId="reminders-presave-preview"
                    lines={[
                      { label: "What", value: preview.what },
                      { label: "When", value: preview.when },
                      { label: "Repeat", value: preview.repeat },
                      { label: "Sound", value: preview.sound },
                      { label: "Quiet hours", value: preview.quietHours },
                    ]}
                  />
                ) : null}
              </>
            ) : (
              <button
                type="button"
                className={BTN_PRIMARY}
                data-testid="reminders-show-add-form"
                onClick={focusAddForm}
              >
                Add a Reminder
              </button>
            )}
            {statusMessage ? (
              <p
                className={
                  statusTone === "success"
                    ? "mt-3 text-base font-medium text-[#1e4f4f]"
                    : "mt-3 text-base font-medium text-[#6b3f2a]"
                }
                role="status"
                aria-live="polite"
                data-testid={
                  statusTone === "success"
                    ? "reminders-save-success"
                    : "reminders-save-error"
                }
              >
                {statusMessage}
              </p>
            ) : null}
          </section>

          <ReminderSection
            title="Upcoming"
            empty="No upcoming reminders yet."
            items={upcoming}
            testId="reminders-upcoming"
            onChanged={refresh}
            onAddFocus={focusAddForm}
          />
          <ReminderSection
            title="Recurring"
            empty="No recurring reminders yet."
            items={recurring}
            testId="reminders-recurring"
            onChanged={refresh}
            onAddFocus={focusAddForm}
          />
          <ReminderSection
            title="Completed"
            empty="No completed reminders yet."
            items={completed}
            testId="reminders-completed"
            onChanged={refresh}
            onAddFocus={focusAddForm}
          />

          <section
            className="mt-8 border-t border-[#e7dfd4] pt-6"
            data-testid="reminders-bottom-settings"
          >
            <RemindersNotificationSettings />
            <div className="mt-6">
              <NotificationSoundPreferences />
            </div>
            {!embedded ? (
              <button
                type="button"
                className={`${BTN_SECONDARY} mt-6`}
                onClick={onBack}
                data-testid="reminders-bottom-back"
              >
                Back
              </button>
            ) : null}
          </section>
        </div>
      </div>
  );

  if (embedded) return body;
  return (
    <RemindersRoomShell onOutsideDismiss={onBack}>{body}</RemindersRoomShell>
  );
}
