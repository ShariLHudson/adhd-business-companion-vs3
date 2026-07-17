"use client";

import { useCallback, useEffect, useState } from "react";
import { RhythmsRoomShell } from "@/components/companion/RhythmsRoomShell";
import {
  ComparisonExpandable,
  HowToUseBlock,
  PersistentDifferenceCue,
  PreviewCard,
  RhythmStartExamples,
  RoomArrivalBlock,
  RhythmsAreFlexibleSection,
} from "@/components/companion/ReminderRhythmRoomChrome";
import { NotificationSoundPreferences } from "@/components/companion/NotificationSoundPreferences";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { getPlanDayOwnerUserId } from "@/lib/planMyDay/planDayOwner";
import {
  completeRhythmOccurrence,
  createMemberRhythm,
  deleteMemberRhythm,
  getMemberRhythm,
  listMemberRhythms,
  pauseRhythm,
  resumeRhythm,
  skipRhythmOccurrence,
  updateMemberRhythm,
  type MemberRhythm,
  type RhythmCadence,
  type Weekday,
} from "@/lib/rhythms";
import {
  EMPTY_RHYTHM_FORM,
  MONTH_OPTIONS,
  NTH_WEEKDAY_OPTIONS,
  RHYTHM_CUSTOM_NOTE_REQUIRED_MESSAGE,
  RHYTHM_FREQUENCY_OPTIONS,
  RHYTHM_SAVE_FAILURE_MESSAGE,
  RHYTHM_TITLE_REQUIRED_MESSAGE,
  RHYTHMS_HOW_DO_I_COPY,
  WEEKDAY_OPTIONS,
  formValuesFromRhythm,
  rhythmPayloadFromForm,
  rhythmSaveSuccessMessage,
  summarizeRhythmSchedule,
  type DailyMode,
  type MonthlyMode,
  type NthWeekday,
  type RhythmFormValues,
} from "@/lib/rhythms/rhythmForm";
import { scrollRoomListToTestId } from "@/lib/planMyDay/scrollRoomList";
import {
  RHYTHM_START_EXAMPLES,
  buildRhythmPreview,
  clearRhythmFormDraft,
  loadRhythmFormDraft,
  partitionRhythmsForLists,
  saveRhythmFormDraft,
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

function RhythmsHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="rhythms-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="rhythms-how-do-i-toggle"
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="rhythms-how-do-i-body"
        >
          {RHYTHMS_HOW_DO_I_COPY}
        </p>
      ) : null}
    </div>
  );
}

function WeekdayPicker({
  selected,
  onChange,
  testId,
}: {
  selected: Weekday[];
  onChange: (next: Weekday[]) => void;
  testId: string;
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-2" data-testid={testId}>
      {WEEKDAY_OPTIONS.map((day) => {
        const on = selected.includes(day.id);
        return (
          <button
            key={day.id}
            type="button"
            className={
              on
                ? "rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]"
            }
            aria-pressed={on}
            onClick={() => {
              if (on) {
                const next = selected.filter((d) => d !== day.id);
                onChange(next.length ? next : [day.id]);
              } else {
                onChange([...selected, day.id]);
              }
            }}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}

function RhythmForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  saving = false,
}: {
  values: RhythmFormValues;
  onChange: (next: RhythmFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
  saving?: boolean;
}) {
  const set = <K extends keyof RhythmFormValues>(
    key: K,
    value: RhythmFormValues[K],
  ) => onChange({ ...values, [key]: value });

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-[#e7dfd4] bg-white/90 p-4"
      data-testid="rhythms-add-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (saving) return;
        onSubmit();
      }}
    >
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Rhythm name
        <input
          className={FIELD}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
          data-testid="rhythms-field-title"
          placeholder="Morning planning…"
        />
      </label>
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Short description
        <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
        <input
          className={FIELD}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          data-testid="rhythms-field-description"
          placeholder="A quiet start to the day"
        />
      </label>
      <label className="block text-sm font-semibold text-[#1f1c19]">
        Frequency
        <select
          className={FIELD}
          value={values.cadence}
          onChange={(e) => set("cadence", e.target.value as RhythmCadence)}
          required
          data-testid="rhythms-field-frequency"
        >
          {RHYTHM_FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {values.cadence === "daily" ? (
        <div data-testid="rhythms-daily-options">
          <p className="text-sm font-semibold text-[#1f1c19]">Daily options</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { id: "every_day", label: "Every day" },
                { id: "weekdays", label: "Weekdays" },
                { id: "selected_days", label: "Selected days" },
              ] as { id: DailyMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={
                  values.dailyMode === opt.id
                    ? "rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                    : BTN_SECONDARY
                }
                onClick={() => set("dailyMode", opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {values.dailyMode === "selected_days" ? (
            <WeekdayPicker
              selected={values.weekdays}
              onChange={(weekdays) => set("weekdays", weekdays)}
              testId="rhythms-daily-weekdays"
            />
          ) : null}
        </div>
      ) : null}

      {values.cadence === "weekly" ? (
        <div data-testid="rhythms-weekly-options">
          <p className="text-sm font-semibold text-[#1f1c19]">
            Days of the week
          </p>
          <WeekdayPicker
            selected={values.weekdays}
            onChange={(weekdays) => set("weekdays", weekdays)}
            testId="rhythms-weekly-weekdays"
          />
        </div>
      ) : null}

      {values.cadence === "monthly" ? (
        <div className="flex flex-col gap-3" data-testid="rhythms-monthly-options">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "day_of_month", label: "Day of month" },
                { id: "nth_weekday", label: "Weekday of month" },
              ] as { id: MonthlyMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={
                  values.monthlyMode === opt.id
                    ? "rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                    : BTN_SECONDARY
                }
                onClick={() => set("monthlyMode", opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {values.monthlyMode === "day_of_month" ? (
            <label className="block text-sm font-semibold text-[#1f1c19]">
              Day of month
              <input
                type="number"
                min={1}
                max={31}
                className={FIELD}
                value={values.dayOfMonth}
                onChange={(e) => set("dayOfMonth", Number(e.target.value))}
                data-testid="rhythms-field-day-of-month"
              />
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#1f1c19]">
                Which
                <select
                  className={FIELD}
                  value={values.nthWeekday}
                  onChange={(e) =>
                    set("nthWeekday", e.target.value as NthWeekday)
                  }
                  data-testid="rhythms-field-nth"
                >
                  {NTH_WEEKDAY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#1f1c19]">
                Weekday
                <select
                  className={FIELD}
                  value={values.monthlyWeekday}
                  onChange={(e) =>
                    set("monthlyWeekday", e.target.value as Weekday)
                  }
                  data-testid="rhythms-field-monthly-weekday"
                >
                  {WEEKDAY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      ) : null}

      {values.cadence === "quarterly" ? (
        <label
          className="block text-sm font-semibold text-[#1f1c19]"
          data-testid="rhythms-quarterly-options"
        >
          Starting month
          <select
            className={FIELD}
            value={values.quarterlyStartMonth}
            onChange={(e) =>
              set("quarterlyStartMonth", Number(e.target.value))
            }
            data-testid="rhythms-field-quarterly-month"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {values.cadence === "yearly" ? (
        <div
          className="grid gap-3 sm:grid-cols-2"
          data-testid="rhythms-yearly-options"
        >
          <label className="block text-sm font-semibold text-[#1f1c19]">
            Month
            <select
              className={FIELD}
              value={values.yearlyMonth}
              onChange={(e) => set("yearlyMonth", Number(e.target.value))}
              data-testid="rhythms-field-yearly-month"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#1f1c19]">
            Day
            <input
              type="number"
              min={1}
              max={31}
              className={FIELD}
              value={values.yearlyDay}
              onChange={(e) => set("yearlyDay", Number(e.target.value))}
              data-testid="rhythms-field-yearly-day"
            />
          </label>
        </div>
      ) : null}

      {values.cadence === "custom" ? (
        <label
          className="block text-sm font-semibold text-[#1f1c19]"
          data-testid="rhythms-custom-options"
        >
          How often?
          <input
            className={FIELD}
            value={values.customNote}
            onChange={(e) => set("customNote", e.target.value)}
            placeholder="Every 2 weeks…"
            required
            data-testid="rhythms-field-custom"
          />
          <span className="mt-1 block text-xs font-normal text-[#6b635a]">
            Examples: Every 2 weeks · Every 3 months · First Monday of each
            month · Selected days
          </span>
        </label>
      ) : null}

      <label className="block text-sm font-semibold text-[#1f1c19]">
        Time
        <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
        <input
          type="time"
          className={FIELD}
          value={values.time}
          onChange={(e) => set("time", e.target.value)}
          data-testid="rhythms-field-time"
        />
      </label>
      {values.cadence !== "custom" ? (
        <label className="block text-sm font-semibold text-[#1f1c19]">
          Notes
          <span className="ml-1 font-normal text-[#6b635a]">(optional)</span>
          <textarea
            className={`${FIELD} min-h-[4rem]`}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            data-testid="rhythms-field-notes"
          />
        </label>
      ) : null}
      <div className="room-form-actions flex flex-wrap gap-2">
        <button
          type="submit"
          className={BTN_PRIMARY}
          data-testid="rhythms-save"
          disabled={saving}
          aria-busy={saving || undefined}
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={onCancel}
            data-testid="rhythms-cancel-edit"
            disabled={saving}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function RhythmRow({
  rhythm,
  onChanged,
}: {
  rhythm: MemberRhythm;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RhythmFormValues>(() =>
    formValuesFromRhythm(rhythm),
  );
  const [rowError, setRowError] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setDraft(formValuesFromRhythm(rhythm));
  }, [rhythm]);

  if (editing) {
    return (
      <li className={CARD} data-testid={`rhythms-row-${rhythm.id}`}>
        <RhythmForm
          values={draft}
          onChange={(next) => {
            setRowError(null);
            setDraft(next);
          }}
          submitLabel="Save Changes"
          onCancel={() => {
            setDraft(formValuesFromRhythm(rhythm));
            setRowError(null);
            setEditing(false);
          }}
          onSubmit={() => {
            if (!draft.title.trim()) return;
            try {
              const payload = rhythmPayloadFromForm(draft);
              const saved = updateMemberRhythm(rhythm.id, {
                title: payload.title,
                details: payload.details,
                cadence: payload.cadence,
                customNote: payload.customNote,
                schedule: payload.schedule,
                window: payload.window,
              });
              if (!saved || !getMemberRhythm(rhythm.id)) {
                setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
                return;
              }
              setRowError(null);
              setEditing(false);
              onChanged();
            } catch {
              setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
            }
          }}
        />
        {rowError ? (
          <p
            className="mt-2 text-sm font-medium text-[#6b3f2a]"
            role="status"
            data-testid={`rhythms-edit-error-${rhythm.id}`}
          >
            {rowError}
          </p>
        ) : null}
      </li>
    );
  }

  const paused = rhythm.status === "paused";

  return (
    <li className={CARD} data-testid={`rhythms-row-${rhythm.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-[#1f1c19]">{rhythm.title}</p>
          {rhythm.details ? (
            <p className="mt-1 text-sm text-[#6b635a]">{rhythm.details}</p>
          ) : null}
          <p className="mt-1 text-sm text-[#6b635a]">
            {summarizeRhythmSchedule(rhythm)}
          </p>
          {paused ? (
            <p
              className="mt-1 text-sm font-semibold text-[#6b635a]"
              data-testid={`rhythms-paused-${rhythm.id}`}
            >
              Paused
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={BTN_TEAL_SOFT}
          onClick={() => {
            try {
              completeRhythmOccurrence(rhythm.id);
              setRowError(null);
              onChanged();
            } catch {
              setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
            }
          }}
          data-testid={`rhythms-complete-${rhythm.id}`}
        >
          Complete
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            try {
              skipRhythmOccurrence(rhythm.id);
              setRowError(null);
              onChanged();
            } catch {
              setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
            }
          }}
          data-testid={`rhythms-skip-${rhythm.id}`}
        >
          Skip
        </button>
        {paused ? (
          <button
            type="button"
            className={BTN_TEAL_SOFT}
            onClick={() => {
              try {
                resumeRhythm(rhythm.id);
                setRowError(null);
                onChanged();
              } catch {
                setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
              }
            }}
            data-testid={`rhythms-resume-${rhythm.id}`}
          >
            Resume
          </button>
        ) : (
          <button
            type="button"
            className={BTN_TEAL_SOFT}
            onClick={() => {
              try {
                pauseRhythm(rhythm.id);
                setRowError(null);
                onChanged();
              } catch {
                setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
              }
            }}
            data-testid={`rhythms-pause-${rhythm.id}`}
          >
            Pause
          </button>
        )}
        <button
          type="button"
          className={BTN_SECONDARY}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
          data-testid={`rhythms-more-${rhythm.id}`}
        >
          More
        </button>
      </div>
      {moreOpen ? (
        <div
          className="mt-2 flex flex-wrap gap-2 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2"
          data-testid={`rhythms-more-menu-${rhythm.id}`}
        >
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              setRowError(null);
              setEditing(true);
              setMoreOpen(false);
            }}
            data-testid={`rhythms-edit-${rhythm.id}`}
          >
            Edit / Reschedule
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              try {
                deleteMemberRhythm(rhythm.id);
                setRowError(null);
                onChanged();
              } catch {
                setRowError(RHYTHM_SAVE_FAILURE_MESSAGE);
              }
            }}
            data-testid={`rhythms-delete-${rhythm.id}`}
          >
            Stop
          </button>
        </div>
      ) : null}
      {rowError ? (
        <p
          className="mt-2 text-sm font-medium text-[#6b3f2a]"
          role="status"
          data-testid={`rhythms-row-error-${rhythm.id}`}
        >
          {rowError}
        </p>
      ) : null}
    </li>
  );
}

function RhythmListSection({
  title,
  empty,
  items,
  testId,
  onChanged,
  onAddFocus,
}: {
  title: string;
  empty: string;
  items: MemberRhythm[];
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
            Create a Rhythm
          </button>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((r) => (
            <RhythmRow key={r.id} rhythm={r} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function RhythmsRoomPanel({
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
  const [form, setForm] = useState<RhythmFormValues>(EMPTY_RHYTHM_FORM);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [saving, setSaving] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    setForm(loadRhythmFormDraft());
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("companion-rhythms-updated", onUpdate);
    return () =>
      window.removeEventListener("companion-rhythms-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!registerBack || embedded) return;
    // Never call onBack/goBack from the interceptor — that re-enters goBack and stack-overflows.
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack, embedded]);

  void tick;
  const lists = partitionRhythmsForLists(listMemberRhythms());
  const preview = buildRhythmPreview(form);

  function updateForm(next: RhythmFormValues) {
    setStatusMessage(null);
    setForm(next);
    saveRhythmFormDraft(next);
  }

  function focusAddForm() {
    setShowAddForm(true);
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('[data-testid="rhythms-field-title"]')
        ?.focus();
    }, 40);
  }

  function applyExample(exampleId: string) {
    const ex = RHYTHM_START_EXAMPLES.find((e) => e.id === exampleId);
    if (!ex) return;
    const next: RhythmFormValues = {
      ...EMPTY_RHYTHM_FORM,
      title: ex.form.title,
      description: ex.form.description,
      cadence: ex.form.cadence,
      time: ex.form.time,
      weekdays:
        "weekdays" in ex.form && ex.form.weekdays
          ? [...ex.form.weekdays]
          : EMPTY_RHYTHM_FORM.weekdays,
      dailyMode:
        ex.form.cadence === "daily"
          ? "every_day"
          : EMPTY_RHYTHM_FORM.dailyMode,
    };
    updateForm(next);
    focusAddForm();
  }

  function handleSave() {
    if (saving) return;
    if (!form.title.trim()) {
      setStatusTone("error");
      setStatusMessage(RHYTHM_TITLE_REQUIRED_MESSAGE);
      return;
    }
    if (form.cadence === "custom" && !form.customNote.trim()) {
      setStatusTone("error");
      setStatusMessage(RHYTHM_CUSTOM_NOTE_REQUIRED_MESSAGE);
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = rhythmPayloadFromForm(form);
      const ownerUserId = getPlanDayOwnerUserId();
      const created = createMemberRhythm({
        ...payload,
        ownerUserId,
      });
      // Persist already succeeded if create returns — trust the return value
      // even if an immediate re-read glitches.
      const confirmed = getMemberRhythm(created.id) ?? created;
      setForm(EMPTY_RHYTHM_FORM);
      clearRhythmFormDraft();
      setStatusTone("success");
      setStatusMessage(
        `Saved under Active. ${rhythmSaveSuccessMessage(confirmed.cadence)}`,
      );
      refresh();
      window.setTimeout(() => {
        scrollRoomListToTestId(`rhythms-row-${confirmed.id}`);
        if (
          !document.querySelector(
            `[data-testid="rhythms-row-${confirmed.id}"]`,
          )
        ) {
          scrollRoomListToTestId("rhythms-active");
        }
      }, 80);
    } catch {
      setStatusTone("error");
      setStatusMessage(RHYTHM_SAVE_FAILURE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  const body = (
      <div
        className="plan-day-morning-note flex flex-col gap-2 pb-10"
        data-testid="rhythms-room-panel"
        data-embedded={embedded ? "true" : "false"}
      >
        {!embedded ? <RhythmsHowDoI /> : null}
        {!embedded ? <HowToUseBlock kind="rhythms" /> : null}
        {!embedded ? (
          <div className="mt-3">
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
          </div>
        ) : null}
        {embedded ? (
          <h2
            className="plan-day-morning-note__title mt-2 text-xl"
            data-testid="rhythms-title"
          >
            Rhythms
          </h2>
        ) : (
          <h1
            className="plan-day-morning-note__title mt-4"
            data-testid="rhythms-title"
          >
            Rhythms
          </h1>
        )}
        {!embedded ? <PersistentDifferenceCue kind="rhythms" /> : null}
        {!embedded ? (
          <RoomArrivalBlock
            kind="rhythms"
            onPrimary={focusAddForm}
            onShowComparison={() => setComparisonOpen(true)}
          />
        ) : null}
        {!embedded ? (
          <ComparisonExpandable
            open={comparisonOpen}
            onToggle={() => setComparisonOpen((v) => !v)}
            testIdPrefix="rhythms"
          />
        ) : null}
        <RhythmsAreFlexibleSection />
        <RhythmStartExamples onUse={applyExample} />

        <section className="mt-6" data-testid="rhythms-add-section">
          <h2 className="mb-3 text-lg font-semibold text-[#1f1c19]">
            Create a Rhythm
          </h2>
          {showAddForm || form.title.trim() ? (
            <>
              <RhythmForm
                values={form}
                onChange={updateForm}
                onSubmit={handleSave}
                submitLabel="Save Rhythm"
                saving={saving}
              />
              {form.title.trim() ? (
                <PreviewCard
                  title="Before you save"
                  testId="rhythms-presave-preview"
                  lines={[
                    { label: "Name", value: preview.name },
                    { label: "Frequency", value: preview.frequency },
                    { label: "Window", value: preview.window },
                    { label: "Skip", value: preview.skip },
                    { label: "Sound", value: preview.sound },
                  ]}
                />
              ) : null}
            </>
          ) : (
            <button
              type="button"
              className={BTN_PRIMARY}
              data-testid="rhythms-show-add-form"
              onClick={focusAddForm}
            >
              Create a Rhythm
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
                  ? "rhythms-save-success"
                  : "rhythms-save-error"
              }
            >
              {statusMessage}
            </p>
          ) : null}
        </section>

        <RhythmListSection
          title="Today"
          empty="Nothing due in today’s window yet."
          items={lists.today}
          testId="rhythms-today"
          onChanged={refresh}
          onAddFocus={focusAddForm}
        />
        <RhythmListSection
          title="Active"
          empty="No active rhythms yet."
          items={lists.active}
          testId="rhythms-active"
          onChanged={refresh}
          onAddFocus={focusAddForm}
        />
        <RhythmListSection
          title="Paused"
          empty="No paused rhythms."
          items={lists.paused}
          testId="rhythms-paused"
          onChanged={refresh}
          onAddFocus={focusAddForm}
        />

        <section className="mt-8 border-t border-[#e7dfd4] pt-6">
          <NotificationSoundPreferences />
        </section>
      </div>
  );

  if (embedded) return body;
  return <RhythmsRoomShell onOutsideDismiss={onBack}>{body}</RhythmsRoomShell>;
}
