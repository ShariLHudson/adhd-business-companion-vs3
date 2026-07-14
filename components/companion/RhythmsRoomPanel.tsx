"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RhythmsRoomShell } from "@/components/companion/RhythmsRoomShell";
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
  RHYTHM_FREQUENCY_OPTIONS,
  RHYTHM_SAVE_FAILURE_MESSAGE,
  RHYTHMS_HOW_DO_I_COPY,
  WEEKDAY_OPTIONS,
  formValuesFromRhythm,
  groupRhythmsByCadence,
  rhythmPayloadFromForm,
  rhythmSaveSuccessMessage,
  summarizeRhythmSchedule,
  type DailyMode,
  type MonthlyMode,
  type NthWeekday,
  type RhythmFormValues,
} from "@/lib/rhythms/rhythmForm";

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
}: {
  values: RhythmFormValues;
  onChange: (next: RhythmFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
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
        <button type="submit" className={BTN_PRIMARY} data-testid="rhythms-save">
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={onCancel}
            data-testid="rhythms-cancel-edit"
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

  useEffect(() => {
    setDraft(formValuesFromRhythm(rhythm));
  }, [rhythm]);

  if (editing) {
    return (
      <li className={CARD} data-testid={`rhythms-row-${rhythm.id}`}>
        <RhythmForm
          values={draft}
          onChange={setDraft}
          submitLabel="Save Changes"
          onCancel={() => {
            setDraft(formValuesFromRhythm(rhythm));
            setEditing(false);
          }}
          onSubmit={() => {
            if (!draft.title.trim()) return;
            const payload = rhythmPayloadFromForm(draft);
            updateMemberRhythm(rhythm.id, {
              title: payload.title,
              details: payload.details,
              cadence: payload.cadence,
              customNote: payload.customNote,
              schedule: payload.schedule,
              window: payload.window,
            });
            setEditing(false);
            onChanged();
          }}
        />
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
          onClick={() => setEditing(true)}
          data-testid={`rhythms-edit-${rhythm.id}`}
        >
          Edit
        </button>
        {paused ? (
          <button
            type="button"
            className={BTN_TEAL_SOFT}
            onClick={() => {
              resumeRhythm(rhythm.id);
              onChanged();
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
              pauseRhythm(rhythm.id);
              onChanged();
            }}
            data-testid={`rhythms-pause-${rhythm.id}`}
          >
            Pause
          </button>
        )}
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            skipRhythmOccurrence(rhythm.id);
            onChanged();
          }}
          data-testid={`rhythms-skip-${rhythm.id}`}
        >
          Skip this occurrence
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            completeRhythmOccurrence(rhythm.id);
            onChanged();
          }}
          data-testid={`rhythms-complete-${rhythm.id}`}
        >
          Complete this occurrence
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            deleteMemberRhythm(rhythm.id);
            onChanged();
          }}
          data-testid={`rhythms-delete-${rhythm.id}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function RhythmGroup({
  id,
  label,
  items,
  onChanged,
  forceOpen,
}: {
  id: RhythmCadence;
  label: string;
  items: MemberRhythm[];
  onChanged: () => void;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(items.length > 0);
  const prevCountRef = useRef(items.length);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (forceOpen || (items.length > 0 && prev === 0)) {
      setOpen(true);
    }
    prevCountRef.current = items.length;
  }, [forceOpen, items.length]);

  const emptyCopy: Record<RhythmCadence, string> = {
    daily: "No daily rhythms yet.",
    weekly: "No weekly rhythms yet.",
    monthly: "No monthly rhythms yet.",
    quarterly: "No quarterly rhythms yet.",
    yearly: "No yearly rhythms yet.",
    custom: "No custom rhythms yet.",
  };

  return (
    <section className="mt-4" data-testid={`rhythms-group-${id}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-[#e7dfd4] bg-white/80 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-testid={`rhythms-group-toggle-${id}`}
      >
        <span className="text-lg font-semibold text-[#1f1c19]">
          {label}
          <span className="ml-2 text-sm font-normal text-[#6b635a]">
            ({items.length})
          </span>
        </span>
        <span aria-hidden="true" className="text-[#1e4f4f]">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        items.length === 0 ? (
          <p className="mt-2 px-1 text-sm text-[#6b635a]">{emptyCopy[id]}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {items.map((r) => (
              <RhythmRow key={r.id} rhythm={r} onChanged={onChanged} />
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}

export function RhythmsRoomPanel({
  onBack,
  registerBack,
}: {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState<RhythmFormValues>(EMPTY_RHYTHM_FORM);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [focusCadence, setFocusCadence] = useState<RhythmCadence | null>(null);
  const [saving, setSaving] = useState(false);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("companion-rhythms-updated", onUpdate);
    return () =>
      window.removeEventListener("companion-rhythms-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      onBack();
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, onBack]);

  void tick;
  const groups = groupRhythmsByCadence(listMemberRhythms());

  function handleSave() {
    if (saving) return;
    if (!form.title.trim()) return;
    if (form.cadence === "custom" && !form.customNote.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = rhythmPayloadFromForm(form);
      const ownerUserId = getPlanDayOwnerUserId();
      const created = createMemberRhythm({
        ...payload,
        ownerUserId,
      });
      const confirmed = getMemberRhythm(created.id);
      if (!confirmed) {
        setStatusTone("error");
        setStatusMessage(RHYTHM_SAVE_FAILURE_MESSAGE);
        return;
      }
      setForm(EMPTY_RHYTHM_FORM);
      setFocusCadence(confirmed.cadence);
      setStatusTone("success");
      setStatusMessage(rhythmSaveSuccessMessage(confirmed.cadence));
      refresh();
      window.setTimeout(() => {
        document
          .querySelector(`[data-testid="rhythms-group-${confirmed.cadence}"]`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 50);
    } catch {
      setStatusTone("error");
      setStatusMessage(RHYTHM_SAVE_FAILURE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RhythmsRoomShell>
      <div
        className="plan-day-morning-note flex flex-col gap-2 pb-10"
        data-testid="rhythms-room-panel"
      >
        <RhythmsHowDoI />
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
        <h1
          className="plan-day-morning-note__title mt-4"
          data-testid="rhythms-title"
        >
          Rhythms
        </h1>

        <section className="mt-6" data-testid="rhythms-add-section">
          <h2 className="mb-3 text-lg font-semibold text-[#1f1c19]">
            Add a Rhythm
          </h2>
          <RhythmForm
            values={form}
            onChange={setForm}
            onSubmit={handleSave}
            submitLabel="Save Rhythm"
          />
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

        {groups.map((group) => (
          <RhythmGroup
            key={group.id}
            id={group.id}
            label={group.label}
            items={group.items}
            onChanged={refresh}
            forceOpen={focusCadence === group.id}
          />
        ))}
      </div>
    </RhythmsRoomShell>
  );
}
