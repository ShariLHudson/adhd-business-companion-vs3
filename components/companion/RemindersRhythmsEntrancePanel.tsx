"use client";

import { useCallback, useEffect, useState } from "react";
import { RemindersRoomShell } from "@/components/companion/RemindersRoomShell";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import {
  COMPARISON_ROWS,
  HELP_ME_CHOOSE_CLARIFY_OPTIONS,
  HELP_ME_CHOOSE_OPTIONS,
  HELP_ME_CHOOSE_QUESTION,
  HELP_ME_CHOOSE_CLARIFY_QUESTION,
  REMINDER_CORE,
  REMINDER_START_EXAMPLES,
  REMINDERS_RHYTHMS_ENTRANCE_LABEL,
  RHYTHM_CORE,
  RHYTHM_START_EXAMPLES,
  STILL_NOT_SURE,
  UNSURE_FALLBACK,
  loadEntranceUiState,
  resolveHelpMeChooseClarify,
  resolveHelpMeChoosePrimary,
  saveEntranceUiState,
  type HelpMeChoosePhase,
  type HelpMeChoosePrimaryId,
  type HelpMeChooseClarifyId,
} from "@/lib/remindersVsRhythms";

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-4 py-3 text-base font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";
const BTN_TEAL_SOFT =
  "rounded-xl border border-[#1e4f4f]/40 px-4 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10";
const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Open dedicated Reminders room (create path). */
  onCreateReminder: () => void;
  /** Open dedicated Rhythms room (create path). */
  onCreateRhythm: () => void;
};

function HelpMeChooseFlow({
  onConfirmReminder,
  onConfirmRhythm,
}: {
  onConfirmReminder: () => void;
  onConfirmRhythm: () => void;
}) {
  const [phase, setPhase] = useState<HelpMeChoosePhase>({ phase: "question" });

  if (phase.phase === "question") {
    return (
      <div data-testid="help-me-choose-flow">
        <p className="text-base font-semibold text-[#1f1c19]">
          {HELP_ME_CHOOSE_QUESTION}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {HELP_ME_CHOOSE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={BTN_TEAL_SOFT}
              data-testid={`help-me-choose-${opt.id}`}
              onClick={() =>
                setPhase(
                  resolveHelpMeChoosePrimary(opt.id as HelpMeChoosePrimaryId),
                )
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase.phase === "clarify") {
    return (
      <div data-testid="help-me-choose-clarify">
        <p className="text-base font-semibold text-[#1f1c19]">
          {HELP_ME_CHOOSE_CLARIFY_QUESTION}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {HELP_ME_CHOOSE_CLARIFY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={BTN_TEAL_SOFT}
              data-testid={`help-me-choose-clarify-${opt.id}`}
              onClick={() =>
                setPhase(
                  resolveHelpMeChooseClarify(opt.id as HelpMeChooseClarifyId),
                )
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${BTN_SECONDARY} mt-3`}
          onClick={() => setPhase({ phase: "question" })}
        >
          Start over
        </button>
      </div>
    );
  }

  if (phase.phase === "unsure") {
    return (
      <div data-testid="help-me-choose-unsure">
        <p className="text-base leading-relaxed text-[#4b463f]">
          {phase.message || UNSURE_FALLBACK}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid="help-me-choose-pick-reminder"
            onClick={onConfirmReminder}
          >
            Create a Reminder
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="help-me-choose-pick-rhythm"
            onClick={onConfirmRhythm}
          >
            Create a Rhythm
          </button>
        </div>
        <button
          type="button"
          className={`${BTN_SECONDARY} mt-3`}
          onClick={() => setPhase({ phase: "question" })}
        >
          Ask again
        </button>
      </div>
    );
  }

  // confirm
  const go =
    phase.recommendation === "reminder" ? onConfirmReminder : onConfirmRhythm;
  return (
    <div data-testid="help-me-choose-confirm">
      <p className="text-base leading-relaxed text-[#4b463f]">
        {phase.explanation}
      </p>
      <p className="mt-2 text-base font-semibold text-[#1f1c19]">
        {phase.recommendation === "reminder"
          ? "Shall I take you to create a Reminder?"
          : "Shall I take you to create a Rhythm?"}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className={BTN_PRIMARY}
          data-testid="help-me-choose-confirm-yes"
          onClick={go}
        >
          Yes, continue
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          data-testid="help-me-choose-confirm-no"
          onClick={() => setPhase({ phase: "question" })}
        >
          Not that — ask again
        </button>
      </div>
    </div>
  );
}

/**
 * Shared My Day entrance: Reminder vs Rhythm explanation before either room.
 */
export function RemindersRhythmsEntrancePanel({
  onBack,
  registerBack,
  onCreateReminder,
  onCreateRhythm,
}: Props) {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const ui = loadEntranceUiState();
    setComparisonOpen(ui.comparisonOpen);
    setHelpOpen(ui.helpMeChooseOpen);
  }, []);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      onBack();
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, onBack]);

  const persistComparison = useCallback((open: boolean) => {
    setComparisonOpen(open);
    saveEntranceUiState({ comparisonOpen: open });
  }, []);

  const persistHelp = useCallback((open: boolean) => {
    setHelpOpen(open);
    saveEntranceUiState({ helpMeChooseOpen: open });
  }, []);

  return (
    <RemindersRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-2 pb-10"
        data-testid="reminders-rhythms-entrance"
      >
        <div className="mt-1">
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
          data-testid="reminders-rhythms-entrance-title"
        >
          {REMINDERS_RHYTHMS_ENTRANCE_LABEL}
        </h1>

        <p
          className="mt-2 max-w-xl text-base leading-relaxed text-[#4b463f]"
          data-testid="reminders-rhythms-difference-cue"
        >
          A Reminder is a specific thing with a specific alert, date, or
          time — for example, call the dentist tomorrow at 2pm. A Rhythm is
          a repeated intention with flexible timing — for example, review
          finances every Friday morning.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className={CARD} data-testid="entrance-reminder-card">
            <h2 className="text-lg font-semibold text-[#1f1c19]">Reminder</h2>
            <p className="mt-2 text-base leading-relaxed text-[#4b463f]">
              {REMINDER_CORE}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Example
            </p>
            <p className="mt-1 text-base text-[#1f1c19]">
              {REMINDER_START_EXAMPLES[0].title} —{" "}
              {REMINDER_START_EXAMPLES[0].hint}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
              <li>A call or follow-up you don’t want to forget</li>
              <li>Something due on a date or at a time</li>
            </ul>
          </section>

          <section className={CARD} data-testid="entrance-rhythm-card">
            <h2 className="text-lg font-semibold text-[#1f1c19]">Rhythm</h2>
            <p className="mt-2 text-base leading-relaxed text-[#4b463f]">
              {RHYTHM_CORE}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Example
            </p>
            <p className="mt-1 text-base text-[#1f1c19]">
              {RHYTHM_START_EXAMPLES[1].title} — {RHYTHM_START_EXAMPLES[1].hint}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
              <li>Weekly review or morning planning</li>
              <li>Skip, pause, or resume — you’re never “behind”</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid="entrance-create-reminder"
            onClick={onCreateReminder}
          >
            Create a Reminder
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid="entrance-create-rhythm"
            onClick={onCreateRhythm}
          >
            Create a Rhythm
          </button>
          <button
            type="button"
            className={BTN_TEAL_SOFT}
            data-testid="entrance-help-me-choose"
            aria-expanded={helpOpen}
            onClick={() => persistHelp(!helpOpen)}
          >
            Help Me Choose
          </button>
        </div>

        {helpOpen ? (
          <section
            className={`${CARD} mt-4`}
            data-testid="entrance-help-me-choose-panel"
          >
            <HelpMeChooseFlow
              onConfirmReminder={onCreateReminder}
              onConfirmRhythm={onCreateRhythm}
            />
          </section>
        ) : null}

        <section className="mt-6">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#1e4f4f] hover:underline"
            aria-expanded={comparisonOpen}
            data-testid="entrance-comparison-toggle"
            onClick={() => persistComparison(!comparisonOpen)}
          >
            Reminder or Rhythm?
            <span aria-hidden="true">{comparisonOpen ? "−" : "+"}</span>
          </button>
          {comparisonOpen ? (
            <div
              className="mt-3 overflow-x-auto rounded-2xl border border-[#e7dfd4] bg-white/90"
              data-testid="entrance-comparison-table"
            >
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e7dfd4] text-[#6b635a]">
                    <th className="px-4 py-3 font-semibold"> </th>
                    <th className="px-4 py-3 font-semibold">Reminder</th>
                    <th className="px-4 py-3 font-semibold">Rhythm</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr
                      key={row.aspect}
                      className="border-b border-[#f0ebe3] last:border-0"
                    >
                      <th className="px-4 py-3 font-semibold text-[#1f1c19]">
                        {row.aspect}
                      </th>
                      <td className="px-4 py-3 text-[#4b463f]">
                        {row.reminder}
                      </td>
                      <td className="px-4 py-3 text-[#4b463f]">{row.rhythm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[#e7dfd4] px-4 py-3 text-sm text-[#6b635a]">
                {STILL_NOT_SURE}{" "}
                <button
                  type="button"
                  className="font-semibold text-[#1e4f4f] underline"
                  onClick={() => {
                    persistHelp(true);
                    persistComparison(false);
                  }}
                >
                  Help Me Choose
                </button>
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </RemindersRoomShell>
  );
}
