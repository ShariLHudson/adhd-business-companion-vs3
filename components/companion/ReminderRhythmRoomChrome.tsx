"use client";

import { useState } from "react";
import {
  COMPARISON_ROWS,
  DIFFERENCE_CUE_REMINDERS,
  DIFFERENCE_CUE_RHYTHMS,
  HOW_TO_USE_REMINDERS,
  HOW_TO_USE_RHYTHMS,
  REMINDER_ACTIONS,
  REMINDER_START_EXAMPLES,
  REMINDERS_ARRIVAL,
  RHYTHM_START_EXAMPLES,
  RHYTHMS_ARE_FLEXIBLE,
  RHYTHMS_ARRIVAL,
  STILL_NOT_SURE,
} from "@/lib/remindersVsRhythms";

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";
const BTN_TEAL_SOFT =
  "rounded-xl border border-[#1e4f4f]/40 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10";

type Kind = "reminders" | "rhythms";

export function PersistentDifferenceCue({ kind }: { kind: Kind }) {
  const text =
    kind === "reminders" ? DIFFERENCE_CUE_REMINDERS : DIFFERENCE_CUE_RHYTHMS;
  return (
    <p
      className="mt-2 max-w-xl rounded-xl border border-[#e7dfd4] bg-[#f7f3ec]/90 px-3.5 py-2.5 text-sm leading-relaxed text-[#4b463f]"
      data-testid={`${kind}-difference-cue`}
    >
      {text}
    </p>
  );
}

export function RoomArrivalBlock({
  kind,
  onPrimary,
  onShowComparison,
}: {
  kind: Kind;
  onPrimary: () => void;
  onShowComparison: () => void;
}) {
  const arrival = kind === "reminders" ? REMINDERS_ARRIVAL : RHYTHMS_ARRIVAL;
  return (
    <section
      className="mt-4 rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4"
      data-testid={`${kind}-arrival`}
    >
      <p className="text-base leading-relaxed text-[#4b463f]">
        {arrival.explanation}
      </p>
      {kind === "rhythms" ? (
        <p className="mt-2 text-base leading-relaxed text-[#4b463f]">
          {RHYTHMS_ARRIVAL.flexibleWindow}
        </p>
      ) : null}
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
        Useful for
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#4b463f]">
        {arrival.usefulFor.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
        {arrival.example.label}
      </p>
      <p className="mt-1 text-base text-[#1f1c19]">{arrival.example.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={BTN_PRIMARY}
          data-testid={`${kind}-arrival-primary`}
          onClick={onPrimary}
        >
          {arrival.primaryCta}
        </button>
        <button
          type="button"
          className={BTN_TEAL_SOFT}
          data-testid={`${kind}-arrival-compare`}
          onClick={onShowComparison}
        >
          {arrival.secondaryCta}
        </button>
      </div>
    </section>
  );
}

export function ComparisonExpandable({
  open,
  onToggle,
  onHelpMeChoose,
  testIdPrefix,
}: {
  open: boolean;
  onToggle: () => void;
  onHelpMeChoose?: () => void;
  testIdPrefix: string;
}) {
  return (
    <section className="mt-4">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-base font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={open}
        data-testid={`${testIdPrefix}-comparison-toggle`}
        onClick={onToggle}
      >
        Reminder or Rhythm?
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div
          className="mt-3 overflow-x-auto rounded-2xl border border-[#e7dfd4] bg-white/90"
          data-testid={`${testIdPrefix}-comparison-table`}
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
                  <td className="px-4 py-3 text-[#4b463f]">{row.reminder}</td>
                  <td className="px-4 py-3 text-[#4b463f]">{row.rhythm}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[#e7dfd4] px-4 py-3 text-sm text-[#6b635a]">
            {STILL_NOT_SURE}
            {onHelpMeChoose ? (
              <>
                {" "}
                <button
                  type="button"
                  className="font-semibold text-[#1e4f4f] underline"
                  data-testid={`${testIdPrefix}-still-not-sure`}
                  onClick={onHelpMeChoose}
                >
                  Help Me Choose
                </button>
              </>
            ) : null}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function HowToUseBlock({ kind }: { kind: Kind }) {
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const copy = kind === "reminders" ? HOW_TO_USE_REMINDERS : HOW_TO_USE_RHYTHMS;
  return (
    <div className="mt-2" data-testid={`${kind}-how-to-use`}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={open}
        data-testid={`${kind}-how-to-use-toggle`}
        onClick={() => setOpen((v) => !v)}
      >
        {copy.title}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <ol className="mt-2 max-w-xl list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#4b463f]">
          {copy.parts.map((part) => (
            <li key={part.title}>
              <span className="font-semibold text-[#1f1c19]">{part.title}.</span>{" "}
              {part.body}
            </li>
          ))}
        </ol>
      ) : null}
      {open ? (
        <div className="mt-3">
          <button
            type="button"
            className="text-sm font-semibold text-[#6b635a] hover:underline"
            aria-expanded={advancedOpen}
            data-testid={`${kind}-how-to-advanced-toggle`}
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            {copy.advancedTitle}
          </button>
          {advancedOpen ? (
            <p className="mt-1 max-w-xl text-sm text-[#6b635a]">
              {copy.advancedBody}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ReminderStartExamples({
  onUse,
}: {
  onUse: (exampleId: string) => void;
}) {
  return (
    <section className="mt-4" data-testid="reminders-start-examples">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
        Start with an example
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {REMINDER_START_EXAMPLES.map((ex) => (
          <li
            key={ex.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-2"
          >
            <div>
              <p className="font-semibold text-[#1f1c19]">{ex.title}</p>
              <p className="text-sm text-[#6b635a]">{ex.hint}</p>
            </div>
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`reminder-example-${ex.id}`}
              onClick={() => onUse(ex.id)}
            >
              Use This Example
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RhythmStartExamples({
  onUse,
}: {
  onUse: (exampleId: string) => void;
}) {
  return (
    <section className="mt-4" data-testid="rhythms-start-examples">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
        Start with an example
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {RHYTHM_START_EXAMPLES.map((ex) => (
          <li
            key={ex.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-2"
          >
            <div>
              <p className="font-semibold text-[#1f1c19]">{ex.title}</p>
              <p className="text-sm text-[#6b635a]">{ex.hint}</p>
            </div>
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`rhythm-example-${ex.id}`}
              onClick={() => onUse(ex.id)}
            >
              Use This Example
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReminderActionsExplained() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-4" data-testid="reminders-actions-explained">
      <button
        type="button"
        className="text-sm font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {REMINDER_ACTIONS.title}
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5 text-sm text-[#4b463f]">
          {REMINDER_ACTIONS.actions.map((a) => (
            <li key={a.id}>
              <span className="font-semibold text-[#1f1c19]">{a.label}:</span>{" "}
              {a.meaning}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function RhythmsAreFlexibleSection() {
  const [open, setOpen] = useState(true);
  return (
    <section
      className="mt-4 rounded-2xl border border-[#e7dfd4] bg-[#f7f3ec]/80 px-4 py-3"
      data-testid="rhythms-are-flexible"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-base font-semibold text-[#1f1c19]">
          {RHYTHMS_ARE_FLEXIBLE.title}
        </span>
        <span aria-hidden="true" className="text-[#1e4f4f]">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-[#4b463f]">
            {RHYTHMS_ARE_FLEXIBLE.body}
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm text-[#4b463f] sm:grid-cols-2">
            {RHYTHMS_ARE_FLEXIBLE.actions.map((a) => (
              <li key={a.id}>
                <span className="font-semibold text-[#1f1c19]">{a.label}:</span>{" "}
                {a.meaning}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function PreviewCard({
  title,
  lines,
  testId,
}: {
  title: string;
  lines: { label: string; value: string }[];
  testId: string;
}) {
  return (
    <div
      className="mt-3 rounded-xl border border-dashed border-[#1e4f4f]/35 bg-[#f0f5f5]/60 px-3.5 py-3"
      data-testid={testId}
    >
      <p className="text-sm font-semibold text-[#1e4f4f]">{title}</p>
      <dl className="mt-2 space-y-1 text-sm text-[#4b463f]">
        {lines.map((line) => (
          <div key={line.label} className="flex flex-wrap gap-x-2">
            <dt className="font-semibold text-[#1f1c19]">{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
