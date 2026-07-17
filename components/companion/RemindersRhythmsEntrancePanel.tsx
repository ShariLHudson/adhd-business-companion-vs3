"use client";

import { useEffect, useState } from "react";
import { RemindersRoomPanel } from "@/components/companion/RemindersRoomPanel";
import { RemindersRoomShell } from "@/components/companion/RemindersRoomShell";
import { RhythmsRoomPanel } from "@/components/companion/RhythmsRoomPanel";
import {
  REMINDER_ITEM,
  REMINDER_VS_RHYTHM_BULLETS,
  REMINDER_VS_RHYTHM_DIFFERENCE,
  REMINDERS_RHYTHMS_HOW_DO_I,
  REMINDERS_RHYTHMS_WINDOW_TITLE,
  RHYTHM_ITEM,
  type RemindersRhythmsSharedChildId,
} from "@/lib/myDaySharedWindows";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left transition-colors";
const CARD_SELECTED =
  "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-4 text-left shadow-sm";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Fresh arrival: null shows both choices; menu child can pre-select. */
  initialChild?: RemindersRhythmsSharedChildId | null;
  /**
   * @deprecated Shared window keeps content in-place. Kept for transitional callers.
   */
  onCreateReminder?: () => void;
  /**
   * @deprecated Shared window keeps content in-place. Kept for transitional callers.
   */
  onCreateRhythm?: () => void;
};

function SharedHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="plan-day-how-do-i"
      data-testid="reminders-rhythms-shared-how-do-i"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="reminders-rhythms-shared-how-do-i-toggle"
      >
        How Do I…
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="reminders-rhythms-shared-how-do-i-body"
        >
          {REMINDERS_RHYTHMS_HOW_DO_I}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Shared My Day window: Reminders / Rhythms — one scroll, two children, one How Do I…
 */
export function RemindersRhythmsEntrancePanel({
  onBack,
  registerBack,
  initialChild = null,
}: Props) {
  const [activeChild, setActiveChild] =
    useState<RemindersRhythmsSharedChildId | null>(initialChild);

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    setActiveChild(initialChild ?? null);
  }, [initialChild]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  return (
    <RemindersRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-10"
        data-testid="reminders-rhythms-entrance"
        data-shared-window="true"
        data-active-child={activeChild ?? "none"}
      >
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
          data-testid="reminders-rhythms-entrance-title"
        >
          {REMINDERS_RHYTHMS_WINDOW_TITLE}
        </h1>

        <p
          className="mt-1 max-w-xl text-base leading-relaxed text-[#4b463f]"
          data-testid="reminders-rhythms-difference-cue"
        >
          {REMINDER_VS_RHYTHM_DIFFERENCE}
        </p>
        <ul
          className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#6b635a]"
          data-testid="reminders-rhythms-difference-bullets"
        >
          {REMINDER_VS_RHYTHM_BULLETS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <SharedHowDoI />

        <div
          className="mt-2 grid gap-3 md:grid-cols-2"
          role="group"
          aria-label="Choose Reminders or Rhythms"
          data-testid="reminders-rhythms-shared-choices"
        >
          <button
            type="button"
            className={activeChild === "reminders" ? CARD_SELECTED : CARD}
            data-testid="entrance-reminder-card"
            aria-pressed={activeChild === "reminders"}
            onClick={() => setActiveChild("reminders")}
          >
            <span className="block text-lg font-semibold text-[#1f1c19]">
              {REMINDER_ITEM.label}
            </span>
            <span
              className="mt-2 block text-base leading-relaxed text-[#4b463f]"
              data-testid="reminders-rhythms-reminder-description"
            >
              {REMINDER_ITEM.description}
            </span>
            <span className="mt-3 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Examples
            </span>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
              {REMINDER_ITEM.examples.slice(0, 3).map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </button>

          <button
            type="button"
            className={activeChild === "rhythms" ? CARD_SELECTED : CARD}
            data-testid="entrance-rhythm-card"
            aria-pressed={activeChild === "rhythms"}
            onClick={() => setActiveChild("rhythms")}
          >
            <span className="block text-lg font-semibold text-[#1f1c19]">
              {RHYTHM_ITEM.label}
            </span>
            <span
              className="mt-2 block text-base leading-relaxed text-[#4b463f]"
              data-testid="reminders-rhythms-rhythm-description"
            >
              {RHYTHM_ITEM.description}
            </span>
            <span className="mt-3 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Examples
            </span>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
              {RHYTHM_ITEM.examples.slice(0, 3).map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </button>
        </div>

        {activeChild === "reminders" ? (
          <div
            className="mt-4 border-t border-[#e7dfd4] pt-4"
            data-testid="reminders-rhythms-shared-reminders-content"
          >
            <RemindersRoomPanel
              embedded
              onBack={() => setActiveChild(null)}
            />
          </div>
        ) : null}

        {activeChild === "rhythms" ? (
          <div
            className="mt-4 border-t border-[#e7dfd4] pt-4"
            data-testid="reminders-rhythms-shared-rhythms-content"
          >
            <RhythmsRoomPanel embedded onBack={() => setActiveChild(null)} />
          </div>
        ) : null}
      </div>
    </RemindersRoomShell>
  );
}
